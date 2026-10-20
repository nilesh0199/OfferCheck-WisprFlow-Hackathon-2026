"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { OfferInputForm } from "@/components/OfferInputForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { OutdatedBanner } from "@/components/OutdatedBanner";
import { ErrorAlert, ErrorType } from "@/components/ErrorAlert";
import { AboutTool } from "@/components/AboutTool";
import {
  isAnalyzeSuccessResponse,
  isAnalyzeErrorResponse,
} from "@/lib/analysis/api-response";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { APP_NAME } from "@/lib/config";

const CLIENT_TIMEOUT_MS = 65000; // 65-second client-side timeout cap

export default function Home() {
  const [offerText, setOfferText] = useState("");
  const [analyzedSnapshotText, setAnalyzedSnapshotText] = useState("");
  const [analysis, setAnalysis] = useState<ValidatedAnalysis | null>(null);

  // Loading & Timer state
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Error state
  const [errorState, setErrorState] = useState<{
    type: ErrorType;
    message?: string;
  } | null>(null);

  // Active abort controller ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleClear = () => {
    if (isLoading) return;
    setOfferText("");
    setAnalyzedSnapshotText("");
    setAnalysis(null);
    setErrorState(null);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("user_cancelled");
    }
  };

  const handleAnalyze = async () => {
    if (isLoading) return;

    const trimmed = offerText.trim();
    if (!trimmed) {
      setErrorState({
        type: "TOO_SHORT",
        message: "Please paste offer text to review.",
      });
      return;
    }

    if (trimmed.length < 40) {
      setErrorState({
        type: "TOO_SHORT",
        message:
          "Offer text is too short (minimum 40 characters). Please provide more context from the offer.",
      });
      return;
    }

    // Reset error state for new submission
    setErrorState(null);
    setIsLoading(true);
    setElapsedSeconds(0);

    // Snapshot current text being submitted for deterministic quotation validation
    const currentSnapshot = offerText;

    // Start elapsed-seconds timer
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Setup AbortController and 65s client timeout
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let timedOut = false;
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
        setErrorState({
          type: "MALFORMED_RESPONSE",
          message: "Could not parse server response.",
        });
        return;
      }

      // Check defensive response shape
      if (response.ok && isAnalyzeSuccessResponse(data)) {
        setAnalyzedSnapshotText(currentSnapshot);
        setAnalysis(data.analysis);
        setErrorState(null);
      } else if (isAnalyzeErrorResponse(data)) {
        const code = data.error.code;
        const status = response.status;

        if (status === 429 || code === "RATE_LIMITED") {
          setErrorState({ type: "RATE_LIMITED" });
        } else if (status === 504 || code === "TIMEOUT") {
          setErrorState({ type: "TIMEOUT" });
        } else if (code === "NOT_CONFIGURED" || status >= 500) {
          setErrorState({ type: "UNAVAILABLE" });
        } else if (code === "TOO_SHORT") {
          setErrorState({ type: "TOO_SHORT", message: data.error.message });
        } else if (code === "TOO_LONG") {
          setErrorState({ type: "TOO_LONG", message: data.error.message });
        } else {
          setErrorState({ type: "GENERIC", message: data.error.message });
        }
      } else {
        setErrorState({ type: "MALFORMED_RESPONSE" });
      }
    } catch (err: unknown) {
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      if (timedOut) {
        setErrorState({ type: "TIMEOUT" });
      } else if (
        err instanceof Error &&
        (err.name === "AbortError" || controller.signal.aborted)
      ) {
        setErrorState({ type: "CANCELLED" });
      } else {
        setErrorState({ type: "NETWORK_ERROR" });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Determine if the user has changed the text in the textarea after an analysis result was rendered
  const isResultOutdated =
    Boolean(analysis) &&
    offerText.trim() !== analyzedSnapshotText.trim();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-between overflow-x-hidden">
      <main className="w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-8">
        {/* Top Header */}
        <Header />

        {/* Input panel (Above the fold) */}
        <OfferInputForm
          offerText={offerText}
          setOfferText={setOfferText}
          onAnalyze={handleAnalyze}
          onCancel={handleCancel}
          onClear={handleClear}
          isLoading={isLoading}
          elapsedSeconds={elapsedSeconds}
        />

        {/* Error notification (if error state active) */}
        {errorState && (
          <ErrorAlert
            errorType={errorState.type}
            customMessage={errorState.message}
            onTryAgain={handleAnalyze}
          />
        )}

        {/* Outdated review warning if user modified textarea text after review */}
        {isResultOutdated && <OutdatedBanner />}

        {/* Structured Results Display */}
        {analysis && (
          <AnalysisResults
            analysis={analysis}
            analyzedSnapshotText={analyzedSnapshotText}
          />
        )}

        {/* Collapsed "About this tool" details section below results */}
        <AboutTool />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center sm:text-left text-xs text-zinc-500 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            {APP_NAME} — Student hackathon prototype for No Hands: The Wispr
            Challenge.
          </p>
          <p>Phase 4 Results UI</p>
        </div>
      </footer>
    </div>
  );
}
