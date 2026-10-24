"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  offerSessionReducer,
  INITIAL_SESSION_STATE,
  SessionErrorState,
  AnalysisStatus,
  TranscribeStatus,
  SelectedFileItem,
  WizardStep,
  SourceChannel,
  AppliedStatus,
  WizardSourceState,
  WizardConversationState,
  PaymentAskedStatus,
  PaymentPurpose,
  DocumentType,
  WizardPaymentState,
  OfferSessionAction,
} from "@/lib/session-reducer";
import {
  isAnalyzeSuccessResponse,
  isAnalyzeErrorResponse,
} from "@/lib/analysis/api-response";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { MIN_INPUT_CHARS } from "@/lib/config";
import { compressFileForUpload, TranscribedItem } from "@/lib/upload";
import { buildCombinedText, isReadyToAnalyse } from "@/lib/combined-text";
import { AskThreadMessage, AskReviewContext } from "@/lib/ask/schema";

const CLIENT_TIMEOUT_MS = 65000; // 65-second client-side timeout cap

interface TranscribeApiResponse {
  ok?: boolean;
  files?: { kind: "image" | "pdf"; transcript: string; readable: boolean }[];
  warnings?: string[];
  error?: { code?: string; message?: string };
}

export interface OfferSessionContextValue {
  // Wizard state:
  currentStep: WizardStep;
  visitedSteps: Record<number, boolean>;
  skippedSteps: Record<number, boolean>;
  source: WizardSourceState;
  conversation: WizardConversationState;
  payment: WizardPaymentState;
  combinedText: string;
  isReady: boolean;
  readyReason?: string;

  // Wizard dispatchers:
  setStep: (step: WizardStep) => void;
  setStepVisited: (step: number, visited?: boolean) => void;
  setStepSkipped: (step: number, skipped?: boolean) => void;
  setSourceChannel: (channel: SourceChannel) => void;
  setSourceApplied: (applied: AppliedStatus) => void;
  setSourceNote: (note: string) => void;
  setConversationText: (text: string) => void;
  setPaymentAsked: (asked: PaymentAskedStatus) => void;
  setPaymentPurposes: (purposes: PaymentPurpose[]) => void;
  togglePaymentPurpose: (purpose: PaymentPurpose) => void;
  setPaymentAmount: (amount: string) => void;
  setPaymentDeadline: (deadline: string) => void;
  setDocsAsked: (docs: DocumentType[]) => void;
  toggleDocsAsked: (doc: DocumentType) => void;
  setDocsShared: (docs: DocumentType[]) => void;
  toggleDocsShared: (doc: DocumentType) => void;
  setPaymentNote: (note: string) => void;
  loadWizardSample: (sample: Extract<OfferSessionAction, { type: "LOAD_WIZARD_SAMPLE" }>["payload"]) => void;

  // Offer text & analysis:
  offerText: string;
  undoOfferText: string | null;
  addedFileCount: number;
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
  handleClearAll: () => void;
  handleUndoAppendTranscript: () => void;

  // File upload & transcription:
  selectedFiles: SelectedFileItem[];
  addSelectedFiles: (files: File[]) => void;
  removeSelectedFile: (id: string) => void;
  clearSelectedFiles: () => void;
  transcribeStatus: TranscribeStatus;
  isTranscribing: boolean;
  transcribeError: string | null;
  transcribeErrorCode: string | null;
  transcribeWarnings: string[];
  transcribeElapsedSeconds: number;
  transcriptBannerDismissed: boolean;
  handleTranscribe: () => Promise<void>;
  handleCancelTranscribe: () => void;
  dismissTranscriptBanner: () => void;

  // Clear doubt AI thread:
  askThread: AskThreadMessage[];
  askLoading: boolean;
  askError: { code: string; message: string } | null;
  sendAskQuestion: (question: string, reviewContext?: AskReviewContext) => Promise<void>;
  clearAskThread: () => void;
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

  // Clear doubt AI state
  const [askThread, setAskThread] = useState<AskThreadMessage[]>([]);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<{ code: string; message: string } | null>(null);

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

      for (const item of selectedFilesRef.current) {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    };
  }, []);

  const setOfferText = useCallback((text: string) => {
    dispatch({ type: "SET_OFFER_TEXT", payload: text });
  }, []);

  const loadSample = useCallback((text: string) => {
    dispatch({ type: "SET_OFFER_TEXT", payload: text });
  }, []);

  const setStep = useCallback((step: WizardStep) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const setStepVisited = useCallback((step: number, visited?: boolean) => {
    dispatch({ type: "SET_STEP_VISITED", payload: { step, visited } });
  }, []);

  const setStepSkipped = useCallback((step: number, skipped?: boolean) => {
    dispatch({ type: "SET_STEP_SKIPPED", payload: { step, skipped } });
  }, []);

  const setSourceChannel = useCallback((channel: SourceChannel) => {
    dispatch({ type: "SET_SOURCE_CHANNEL", payload: channel });
  }, []);

  const setSourceApplied = useCallback((applied: AppliedStatus) => {
    dispatch({ type: "SET_SOURCE_APPLIED", payload: applied });
  }, []);

  const setSourceNote = useCallback((note: string) => {
    dispatch({ type: "SET_SOURCE_NOTE", payload: note });
  }, []);

  const setConversationText = useCallback((text: string) => {
    dispatch({ type: "SET_CONVERSATION_TEXT", payload: text });
  }, []);

  const setPaymentAsked = useCallback((asked: PaymentAskedStatus) => {
    dispatch({ type: "SET_PAYMENT_ASKED", payload: asked });
  }, []);

  const setPaymentPurposes = useCallback((purposes: PaymentPurpose[]) => {
    dispatch({ type: "SET_PAYMENT_PURPOSES", payload: purposes });
  }, []);

  const togglePaymentPurpose = useCallback((purpose: PaymentPurpose) => {
    dispatch({ type: "TOGGLE_PAYMENT_PURPOSE", payload: purpose });
  }, []);

  const setPaymentAmount = useCallback((amount: string) => {
    dispatch({ type: "SET_PAYMENT_AMOUNT", payload: amount });
  }, []);

  const setPaymentDeadline = useCallback((deadline: string) => {
    dispatch({ type: "SET_PAYMENT_DEADLINE", payload: deadline });
  }, []);

  const setDocsAsked = useCallback((docs: DocumentType[]) => {
    dispatch({ type: "SET_DOCS_ASKED", payload: docs });
  }, []);

  const toggleDocsAsked = useCallback((doc: DocumentType) => {
    dispatch({ type: "TOGGLE_DOCS_ASKED", payload: doc });
  }, []);

  const setDocsShared = useCallback((docs: DocumentType[]) => {
    dispatch({ type: "SET_DOCS_SHARED", payload: docs });
  }, []);

  const toggleDocsShared = useCallback((doc: DocumentType) => {
    dispatch({ type: "TOGGLE_DOCS_SHARED", payload: doc });
  }, []);

  const setPaymentNote = useCallback((note: string) => {
    dispatch({ type: "SET_PAYMENT_NOTE", payload: note });
  }, []);

  const loadWizardSample = useCallback(
    (sample: Parameters<OfferSessionContextValue["loadWizardSample"]>[0]) => {
      dispatch({ type: "LOAD_WIZARD_SAMPLE", payload: sample });
    },
    []
  );

  const addSelectedFiles = useCallback((newFiles: File[]) => {
    const items: SelectedFileItem[] = newFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    dispatch({ type: "ADD_SELECTED_FILES", payload: items });
  }, []);

  const removeSelectedFile = useCallback((id: string) => {
    const found = selectedFilesRef.current.find((item) => item.id === id);
    if (found?.previewUrl) {
      URL.revokeObjectURL(found.previewUrl);
    }
    dispatch({ type: "REMOVE_SELECTED_FILE", payload: id });
  }, []);

  const clearSelectedFiles = useCallback(() => {
    for (const item of selectedFilesRef.current) {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    }
    dispatch({ type: "CLEAR_SELECTED_FILES" });
  }, []);

  const dismissTranscriptBanner = useCallback(() => {
    dispatch({ type: "DISMISS_TRANSCRIPT_BANNER" });
  }, []);

  const handleUndoAppendTranscript = useCallback(() => {
    dispatch({ type: "UNDO_APPEND_TRANSCRIPT" });
  }, []);

  const handleCancelTranscribe = useCallback(() => {
    if (transcribeAbortControllerRef.current) {
      transcribeAbortControllerRef.current.abort("user_cancelled");
    }
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (state.transcribeStatus === "loading") return;
    if (state.selectedFiles.length === 0) return;

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
        const items: TranscribedItem[] = (data.files || []).map((f) => ({
          kind: f.kind === "pdf" ? ("PDF" as const) : ("Screenshot" as const),
          transcript: f.transcript || "",
          readable: Boolean(f.readable),
        }));
        dispatch({
          type: "TRANSCRIBE_SUCCESS",
          payload: {
            items,
            warnings: data.warnings ?? [],
            fileCount: compressedFiles.length,
          },
        });
      } else {
        const code =
          data?.error?.code ||
          (response.status === 429
            ? "RATE_LIMITED_CLIENT"
            : response.status === 413
            ? "TOTAL_TOO_LARGE"
            : response.status === 415
            ? "UNSUPPORTED_MEDIA_TYPE"
            : "UPSTREAM_ERROR");
        const msg = data?.error?.message || "File transcription failed. Please try again.";
        dispatch({
          type: "TRANSCRIBE_ERROR",
          payload: { message: msg, code },
        });
      }
    } catch (err: unknown) {
      if (transcribeTimeoutRef.current) clearTimeout(transcribeTimeoutRef.current);
      if (transcribeIntervalRef.current) clearInterval(transcribeIntervalRef.current);

      const isAbort =
        (err as Error)?.name === "AbortError" ||
        controller.signal.aborted ||
        (err as { name?: string })?.name === "AbortError";

      if (isAbort && timedOut) {
        dispatch({
          type: "TRANSCRIBE_ERROR",
          payload: {
            message: "Transcription timed out. Please try again with fewer or smaller files.",
            code: "TIMEOUT",
          },
        });
      } else if (isAbort) {
        dispatch({ type: "CANCEL_TRANSCRIBE" });
      } else {
        dispatch({
          type: "TRANSCRIBE_ERROR",
          payload: "A network error occurred while transcribing your files.",
        });
      }
    } finally {
      transcribeAbortControllerRef.current = null;
    }
  }, [state.transcribeStatus, state.selectedFiles]);

  const handleClear = useCallback(() => {
    if (state.status === "loading" && abortControllerRef.current) {
      abortControllerRef.current.abort("user_cancelled");
    }
    if (state.transcribeStatus === "loading" && transcribeAbortControllerRef.current) {
      transcribeAbortControllerRef.current.abort("user_cancelled");
    }
    if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (transcribeTimeoutRef.current) clearTimeout(transcribeTimeoutRef.current);
    if (transcribeIntervalRef.current) clearInterval(transcribeIntervalRef.current);

    for (const item of selectedFilesRef.current) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    }

    dispatch({ type: "CLEAR_SESSION" });
  }, [state.status, state.transcribeStatus]);

  const clearAskThread = useCallback(() => {
    setAskThread([]);
    setAskLoading(false);
    setAskError(null);
  }, []);

  const handleClearAll = useCallback(() => {
    handleClear();
    clearAskThread();
  }, [handleClear, clearAskThread]);

  const sendAskQuestion = useCallback(
    async (question: string, reviewContext?: AskReviewContext) => {
      const trimmed = question.trim();
      if (!trimmed) return;

      const userTurnCount = askThread.filter((m) => m.role === "user").length;
      if (userTurnCount >= 6) {
        setAskError({
          code: "LIMIT_REACHED",
          message:
            "Thread limit reached (6 questions). Please clear the thread to start a new inquiry.",
        });
        return;
      }

      const userMessage: AskThreadMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      const updatedThread = [...askThread, userMessage];
      setAskThread(updatedThread);
      setAskLoading(true);
      setAskError(null);

      try {
        const payload = {
          messages: updatedThread.map((m) => ({
            role: m.role,
            content: m.role === "user" ? m.content : (m.data?.summary || m.content),
          })),
          reviewContext,
        };

        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.ok && data.data) {
          const assistantMessage: AskThreadMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.data.summary,
            data: data.data,
            createdAt: Date.now(),
          };
          setAskThread([...updatedThread, assistantMessage]);
        } else {
          const code = data?.error?.code || "UPSTREAM_ERROR";
          const message =
            data?.error?.message ||
            "Unable to clear doubt right now. Please try again or check the official resources.";
          setAskError({ code, message });
        }
      } catch {
        setAskError({
          code: "NETWORK_ERROR",
          message:
            "A network error occurred while communicating with the server. Please check your connection.",
        });
      } finally {
        setAskLoading(false);
      }
    },
    [askThread]
  );

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("user_cancelled");
    }
  }, []);

  const combinedText = useMemo(() => {
    return buildCombinedText(state).text;
  }, [state]);

  const readyCheck = useMemo(() => {
    return isReadyToAnalyse(state);
  }, [state]);

  const handleAnalyze = useCallback(async () => {
    if (state.status === "loading") return;

    const currentCombined = buildCombinedText(state).text;
    const check = isReadyToAnalyse(state);

    if (!check.ready) {
      dispatch({
        type: "ANALYSIS_ERROR",
        payload: {
          type: "TOO_SHORT",
          message:
            check.reason ||
            `Please provide at least ${MIN_INPUT_CHARS} characters of text to review.`,
        },
      });
      return;
    }

    // Snapshot current combined text being submitted for deterministic quotation validation
    const currentSnapshot = currentCombined;

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
              code: "RATE_LIMITED_CLIENT",
            },
          });
        } else if (code === "BUSY") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "RATE_LIMITED",
              message: data.error.message,
              code: "BUSY",
            },
          });
        } else if (code === "TOO_SHORT") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "TOO_SHORT",
              message: data.error.message,
              code: "TOO_SHORT",
            },
          });
        } else if (code === "TOO_LONG") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "TOO_LONG",
              message: data.error.message,
              code: "TOO_LONG",
            },
          });
        } else if (code === "INVALID_INPUT") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "MALFORMED_RESPONSE",
              message: data.error.message,
              code: "INVALID_INPUT",
            },
          });
        } else if (code === "NOT_CONFIGURED") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "UNAVAILABLE",
              message: data.error.message,
              code: "NOT_CONFIGURED",
            },
          });
        } else if (status === 429 || code === "RATE_LIMITED") {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "RATE_LIMITED",
              message:
                data.error.message ||
                "Analysis limit reached. Please wait a moment before trying again.",
              code: "RATE_LIMITED",
            },
          });
        } else {
          dispatch({
            type: "ANALYSIS_ERROR",
            payload: {
              type: "UNAVAILABLE",
              message:
                data.error.message ||
                "The analysis service is temporarily unavailable. Please try again shortly.",
              code: code || "UPSTREAM_ERROR",
            },
          });
        }
      } else {
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: {
            type: "MALFORMED_RESPONSE",
            message: "Unexpected response format from analysis service.",
          },
        });
      }
    } catch (err: unknown) {
      // Clear timers
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      const isAbort =
        (err as Error)?.name === "AbortError" ||
        controller.signal.aborted ||
        (err as { name?: string })?.name === "AbortError";

      if (isAbort && timedOut) {
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: {
            type: "TIMEOUT",
            message:
              "The analysis took longer than expected. Please try again with shorter text.",
            code: "TIMEOUT",
          },
        });
      } else if (isAbort) {
        dispatch({ type: "CANCEL_ANALYSIS" });
      } else {
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: {
            type: "NETWORK_ERROR",
            message: "A network error occurred. Please check your connection and try again.",
          },
        });
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [state]);

  const isResultOutdated = useMemo(() => {
    return (
      Boolean(state.analysis) &&
      combinedText.trim() !== state.analyzedSnapshotText.trim()
    );
  }, [state.analysis, combinedText, state.analyzedSnapshotText]);

  const contextValue: OfferSessionContextValue = useMemo(
    () => ({
      // Wizard:
      currentStep: state.currentStep,
      visitedSteps: state.visitedSteps,
      skippedSteps: state.skippedSteps,
      source: state.source,
      conversation: state.conversation,
      payment: state.payment,
      combinedText,
      isReady: readyCheck.ready,
      readyReason: readyCheck.reason,

      setStep,
      setStepVisited,
      setStepSkipped,
      setSourceChannel,
      setSourceApplied,
      setSourceNote,
      setConversationText,
      setPaymentAsked,
      setPaymentPurposes,
      togglePaymentPurpose,
      setPaymentAmount,
      setPaymentDeadline,
      setDocsAsked,
      toggleDocsAsked,
      setDocsShared,
      toggleDocsShared,
      setPaymentNote,
      loadWizardSample,

      // OfferText & analysis:
      offerText: state.offerText,
      undoOfferText: state.undoOfferText,
      addedFileCount: state.addedFileCount,
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
      handleClearAll,
      handleUndoAppendTranscript,
      selectedFiles: state.selectedFiles,
      addSelectedFiles,
      removeSelectedFile,
      clearSelectedFiles,
      transcribeStatus: state.transcribeStatus,
      isTranscribing: state.transcribeStatus === "loading",
      transcribeError: state.transcribeError,
      transcribeErrorCode: state.transcribeErrorCode,
      transcribeWarnings: state.transcribeWarnings,
      transcribeElapsedSeconds: state.transcribeElapsedSeconds,
      transcriptBannerDismissed: state.transcriptBannerDismissed,
      handleTranscribe,
      handleCancelTranscribe,
      dismissTranscriptBanner,

      // Clear doubt AI thread:
      askThread,
      askLoading,
      askError,
      sendAskQuestion,
      clearAskThread,
    }),
    [
      state.currentStep,
      state.visitedSteps,
      state.skippedSteps,
      state.source,
      state.conversation,
      state.payment,
      combinedText,
      readyCheck.ready,
      readyCheck.reason,
      setStep,
      setStepVisited,
      setStepSkipped,
      setSourceChannel,
      setSourceApplied,
      setSourceNote,
      setConversationText,
      setPaymentAsked,
      setPaymentPurposes,
      togglePaymentPurpose,
      setPaymentAmount,
      setPaymentDeadline,
      setDocsAsked,
      toggleDocsAsked,
      setDocsShared,
      toggleDocsShared,
      setPaymentNote,
      loadWizardSample,
      state.offerText,
      state.undoOfferText,
      state.addedFileCount,
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
      handleClearAll,
      handleUndoAppendTranscript,
      state.selectedFiles,
      addSelectedFiles,
      removeSelectedFile,
      clearSelectedFiles,
      state.transcribeStatus,
      state.transcribeError,
      state.transcribeErrorCode,
      state.transcribeWarnings,
      state.transcribeElapsedSeconds,
      state.transcriptBannerDismissed,
      handleTranscribe,
      handleCancelTranscribe,
      dismissTranscriptBanner,
      askThread,
      askLoading,
      askError,
      sendAskQuestion,
      clearAskThread,
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
