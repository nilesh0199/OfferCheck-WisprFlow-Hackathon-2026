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
  InputTab,
  TranscribeStatus,
  SelectedFileItem,
} from "@/lib/session-reducer";
import {
  isAnalyzeSuccessResponse,
  isAnalyzeErrorResponse,
} from "@/lib/analysis/api-response";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { MIN_INPUT_CHARS } from "@/lib/config";
import { compressFileForUpload } from "@/lib/upload";

const CLIENT_TIMEOUT_MS = 65000; // 65-second client-side timeout cap

interface TranscribeApiResponse {
  ok?: boolean;
  transcript?: string;
  warnings?: string[];
  error?: { message?: string };
}

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

  // Phase 8 file upload & transcription:
  activeTab: InputTab;
  setActiveTab: (tab: InputTab) => void;
  selectedFiles: SelectedFileItem[];
  addSelectedFiles: (files: File[]) => void;
  removeSelectedFile: (id: string) => void;
  clearSelectedFiles: () => void;
  transcribeStatus: TranscribeStatus;
  isTranscribing: boolean;
  transcribeError: string | null;
  transcribeWarnings: string[];
  transcribeElapsedSeconds: number;
  transcriptBannerDismissed: boolean;
  handleTranscribe: () => Promise<void>;
  handleCancelTranscribe: () => void;
  dismissTranscriptBanner: () => void;
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

  const transcribeAbortControllerRef = useRef<AbortController | null>(null);
  const transcribeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcribeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep a ref of selectedFiles so we can revoke object URLs on unmount without re-triggering effect
  const selectedFilesRef = useRef(state.selectedFiles);

  useEffect(() => {
    selectedFilesRef.current = state.selectedFiles;
  }, [state.selectedFiles]);

  // Clean up timers and object URLs on full provider unmount (e.g. app close/refresh)
  useEffect(() => {
    return () => {
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();

      if (transcribeTimeoutRef.current) clearTimeout(transcribeTimeoutRef.current);
      if (transcribeIntervalRef.current) clearInterval(transcribeIntervalRef.current);
      if (transcribeAbortControllerRef.current) transcribeAbortControllerRef.current.abort();

      selectedFilesRef.current.forEach((item) => {
        if (item.previewUrl) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch {
            // Ignore in environments where URL.revokeObjectURL is unavailable
          }
        }
      });
    };
  }, []);

  const setOfferText = useCallback((text: string) => {
    dispatch({ type: "SET_OFFER_TEXT", payload: text });
  }, []);

  const loadSample = useCallback((text: string) => {
    dispatch({ type: "SET_OFFER_TEXT", payload: text });
  }, []);

  const setActiveTab = useCallback((tab: InputTab) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });
  }, []);

  const addSelectedFiles = useCallback((files: File[]) => {
    const items: SelectedFileItem[] = files.map((file) => {
      let previewUrl: string | undefined;
      if (file.type.startsWith("image/") && typeof URL?.createObjectURL === "function") {
        try {
          previewUrl = URL.createObjectURL(file);
        } catch {
          // Ignore if object URL creation fails
        }
      }
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl,
      };
    });
    dispatch({ type: "ADD_SELECTED_FILES", payload: items });
  }, []);

  const removeSelectedFile = useCallback((id: string) => {
    const item = state.selectedFiles.find((f) => f.id === id);
    if (item?.previewUrl && typeof URL?.revokeObjectURL === "function") {
      try {
        URL.revokeObjectURL(item.previewUrl);
      } catch {
        // Ignore
      }
    }
    dispatch({ type: "REMOVE_SELECTED_FILE", payload: id });
  }, [state.selectedFiles]);

  const clearSelectedFiles = useCallback(() => {
    state.selectedFiles.forEach((item) => {
      if (item.previewUrl && typeof URL?.revokeObjectURL === "function") {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // Ignore
        }
      }
    });
    dispatch({ type: "CLEAR_SELECTED_FILES" });
  }, [state.selectedFiles]);

  const dismissTranscriptBanner = useCallback(() => {
    dispatch({ type: "DISMISS_TRANSCRIPT_BANNER" });
  }, []);

  const handleCancelTranscribe = useCallback(() => {
    if (transcribeAbortControllerRef.current) {
      transcribeAbortControllerRef.current.abort("user_cancelled");
    }
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (state.selectedFiles.length === 0 || state.transcribeStatus === "loading") {
      return;
    }

    dispatch({ type: "START_TRANSCRIBE" });

    const startTime = Date.now();
    if (transcribeIntervalRef.current) clearInterval(transcribeIntervalRef.current);
    transcribeIntervalRef.current = setInterval(() => {
      dispatch({
        type: "TICK_TRANSCRIBE_ELAPSED",
        payload: Math.floor((Date.now() - startTime) / 1000),
      });
    }, 1000);

    const controller = new AbortController();
    transcribeAbortControllerRef.current = controller;

    let timedOut = false;
    if (transcribeTimeoutRef.current) clearTimeout(transcribeTimeoutRef.current);
    transcribeTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      controller.abort("client_timeout");
    }, CLIENT_TIMEOUT_MS);

    try {
      // In-browser canvas downscale/compression for large images
      const compressedFiles = await Promise.all(
        state.selectedFiles.map(async (item) => {
          return await compressFileForUpload(item.file);
        })
      );

      const formData = new FormData();
      for (const f of compressedFiles) {
        formData.append("files", f);
      }

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (transcribeTimeoutRef.current) clearTimeout(transcribeTimeoutRef.current);
      if (transcribeIntervalRef.current) clearInterval(transcribeIntervalRef.current);

      let data: TranscribeApiResponse | null = null;
      try {
        data = (await response.json()) as TranscribeApiResponse;
      } catch {
        dispatch({
          type: "TRANSCRIBE_ERROR",
          payload: "Could not parse server response.",
        });
        return;
      }

      if (response.ok && data?.ok) {
        dispatch({
          type: "TRANSCRIBE_SUCCESS",
          payload: {
            transcript: data.transcript ?? "",
            warnings: data.warnings ?? [],
          },
        });
      } else {
        const msg =
          data?.error?.message ||
          (response.status === 429
            ? "The transcription service is currently busy. Please wait a moment and try again."
            : response.status === 503
            ? "The transcription service is busy right now. Please try again in a minute."
            : response.status === 413
            ? "Uploaded files exceed the 4 MB size limit. Please remove or compress some files."
            : "Unable to transcribe uploaded files. Please check the files or try pasting the text directly.");
        dispatch({
          type: "TRANSCRIBE_ERROR",
          payload: msg,
        });
      }
    } catch (err: unknown) {
      if (transcribeTimeoutRef.current) clearTimeout(transcribeTimeoutRef.current);
      if (transcribeIntervalRef.current) clearInterval(transcribeIntervalRef.current);

      if (timedOut) {
        dispatch({
          type: "TRANSCRIBE_ERROR",
          payload: "The transcription request timed out. Please try uploading fewer or smaller files.",
        });
      } else if (
        err instanceof Error &&
        (err.name === "AbortError" || controller.signal.aborted)
      ) {
        dispatch({ type: "CANCEL_TRANSCRIBE" });
      } else {
        dispatch({
          type: "TRANSCRIBE_ERROR",
          payload: "A network error occurred while uploading your files. Please check your connection and try again.",
        });
      }
    } finally {
      transcribeAbortControllerRef.current = null;
    }
  }, [state.selectedFiles, state.transcribeStatus]);

  const handleClear = useCallback(() => {
    if (state.status === "loading" || state.transcribeStatus === "loading") return;
    if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (transcribeTimeoutRef.current) clearTimeout(transcribeTimeoutRef.current);
    if (transcribeIntervalRef.current) clearInterval(transcribeIntervalRef.current);

    state.selectedFiles.forEach((item) => {
      if (item.previewUrl && typeof URL?.revokeObjectURL === "function") {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // Ignore
        }
      }
    });

    dispatch({ type: "CLEAR_SESSION" });
  }, [state.status, state.transcribeStatus, state.selectedFiles]);

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
      activeTab: state.activeTab,
      setActiveTab,
      selectedFiles: state.selectedFiles,
      addSelectedFiles,
      removeSelectedFile,
      clearSelectedFiles,
      transcribeStatus: state.transcribeStatus,
      isTranscribing: state.transcribeStatus === "loading",
      transcribeError: state.transcribeError,
      transcribeWarnings: state.transcribeWarnings,
      transcribeElapsedSeconds: state.transcribeElapsedSeconds,
      transcriptBannerDismissed: state.transcriptBannerDismissed,
      handleTranscribe,
      handleCancelTranscribe,
      dismissTranscriptBanner,
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
      state.activeTab,
      setActiveTab,
      state.selectedFiles,
      addSelectedFiles,
      removeSelectedFile,
      clearSelectedFiles,
      state.transcribeStatus,
      state.transcribeError,
      state.transcribeWarnings,
      state.transcribeElapsedSeconds,
      state.transcriptBannerDismissed,
      handleTranscribe,
      handleCancelTranscribe,
      dismissTranscriptBanner,
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
