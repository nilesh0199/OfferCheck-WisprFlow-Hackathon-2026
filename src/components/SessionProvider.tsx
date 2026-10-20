"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  offerSessionReducer,
  INITIAL_SESSION_STATE,
  SessionErrorState,
  AnalysisStatus,
} from "@/lib/session-reducer";
import {
  isAnalyzeSuccessResponse,
  isAnalyzeErrorResponse,
} from "@/lib/analysis/api-response";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { MIN_INPUT_CHARS } from "@/lib/config";

const CLIENT_TIMEOUT_MS = 65000; // 65-second client-side timeout cap

export interface OfferSessionContextValue {
  offerText: string;
  analyzedSnapshotText: string;
  analysis: ValidatedAnalysis | null;
  status: AnalysisStatus;
  isLoading: boolean;
  errorState: SessionErrorState | null;
  elapsedSeconds: number;
  isResultOutdated: boolean;
  setOfferText: (text: string) => void;
  loadSample: (text: string) => void;
  handleAnalyze: () => Promise<void>;
  handleCancel: () => void;
  handleClear: () => void;
}

const OfferSessionContext = createContext<OfferSessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    offerSessionReducer,
    INITIAL_SESSION_STATE
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up timers on full provider unmount (e.g. app close/refresh)
  useEffect(() => {
    return () => {
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const setOfferText = useCallback((text: string) => {
    dispatch({ type: "SET_OFFER_TEXT", payload: text });
  }, []);

  const loadSample = useCallback((text: string) => {
    dispatch({ type: "SET_OFFER_TEXT", payload: text });
  }, []);

  const handleClear = useCallback(() => {
    if (state.status === "loading") return;
    if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    dispatch({ type: "CLEAR_SESSION" });
  }, [state.status]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("user_cancelled");
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (state.status === "loading") return;

    const trimmed = state.offerText.trim();
    if (!trimmed) {
      dispatch({
        type: "ANALYSIS_ERROR",
        payload: {
          type: "TOO_SHORT",
          message: "Please paste offer text to review.",
        },
      });
      return;
    }

    if (trimmed.length < MIN_INPUT_CHARS) {
      dispatch({
        type: "ANALYSIS_ERROR",
        payload: {
          type: "TOO_SHORT",
          message: `Offer text is too short (minimum ${MIN_INPUT_CHARS} characters). Please provide more context from the offer.`,
        },
      });
      return;
    }

    // Snapshot current text being submitted for deterministic quotation validation
    const currentSnapshot = state.offerText;

    dispatch({
      type: "START_ANALYSIS",
      payload: { snapshotText: currentSnapshot },
    });

    // Start elapsed-seconds timer
    const startTime = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      dispatch({
        type: "TICK_ELAPSED",
        payload: Math.floor((Date.now() - startTime) / 1000),
      });
    }, 1000);

    // Setup AbortController and 65s client timeout
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let timedOut = false;
    if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
    timeoutHandleRef.current = setTimeout(() => {
      timedOut = true;
      controller.abort("client_timeout");
    }, CLIENT_TIMEOUT_MS);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: currentSnapshot }),
        signal: controller.signal,
      });

      // Clear client timeout and elapsed timer
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: {
            type: "MALFORMED_RESPONSE",
            message: "Could not parse server response.",
          },
        });
        return;
      }

      // Check defensive response shape
      if (response.ok && isAnalyzeSuccessResponse(data)) {
        dispatch({
          type: "ANALYSIS_SUCCESS",
          payload: {
            analysis: data.analysis,
            snapshotText: currentSnapshot,
          },
        });
      } else if (isAnalyzeErrorResponse(data)) {
        const code = data.error.code;
        const status = response.status;

        if (code === "RATE_LIMITED_CLIENT") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "RATE_LIMITED_CLIENT",
              message: data.error.message,
            },
          });
        } else if (code === "BUSY") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "RATE_LIMITED",
              message: data.error.message,
            },
          });
        } else if (status === 429 || code === "RATE_LIMITED") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: { type: "RATE_LIMITED" },
          });
        } else if (status === 504 || code === "TIMEOUT") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: { type: "TIMEOUT" },
          });
        } else if (code === "NOT_CONFIGURED" || status >= 500) {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: { type: "UNAVAILABLE" },
          });
        } else if (code === "TOO_SHORT") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: { type: "TOO_SHORT", message: data.error.message },
          });
        } else if (code === "TOO_LONG") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: { type: "TOO_LONG", message: data.error.message },
          });
        } else {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: { type: "GENERIC", message: data.error.message },
          });
        }
      } else {
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: { type: "MALFORMED_RESPONSE" },
        });
      }
    } catch (err: unknown) {
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      if (timedOut) {
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: { type: "TIMEOUT" },
        });
      } else if (
        err instanceof Error &&
        (err.name === "AbortError" || controller.signal.aborted)
      ) {
        dispatch({
          type: "CANCEL_ANALYSIS",
        });
      } else {
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: { type: "NETWORK_ERROR" },
        });
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [state.offerText, state.status]);

  const isResultOutdated = useMemo(() => {
    return (
      Boolean(state.analysis) &&
      state.offerText.trim() !== state.analyzedSnapshotText.trim()
    );
  }, [state.analysis, state.offerText, state.analyzedSnapshotText]);

  const contextValue: OfferSessionContextValue = useMemo(
    () => ({
      offerText: state.offerText,
      analyzedSnapshotText: state.analyzedSnapshotText,
      analysis: state.analysis,
      status: state.status,
      isLoading: state.status === "loading",
      errorState: state.errorState,
      elapsedSeconds: state.elapsedSeconds,
      isResultOutdated,
      setOfferText,
      loadSample,
      handleAnalyze,
      handleCancel,
      handleClear,
    }),
    [
      state.offerText,
      state.analyzedSnapshotText,
      state.analysis,
      state.status,
      state.errorState,
      state.elapsedSeconds,
      isResultOutdated,
      setOfferText,
      loadSample,
      handleAnalyze,
      handleCancel,
      handleClear,
    ]
  );

  return (
    <OfferSessionContext.Provider value={contextValue}>
      {children}
    </OfferSessionContext.Provider>
  );
}

/**
 * Hook to access in-memory offer session state across client navigations.
 */
export function useOfferSession(): OfferSessionContextValue {
  const context = useContext(OfferSessionContext);
  if (!context) {
    throw new Error("useOfferSession must be used within a SessionProvider");
  }
  return context;
}
