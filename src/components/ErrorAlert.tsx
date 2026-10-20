import React, { useEffect, useRef } from "react";
import { AttentionIcon } from "./Icons";

export type ErrorType =
  | "TOO_SHORT"
  | "TOO_LONG"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "NETWORK_ERROR"
  | "CANCELLED"
  | "MALFORMED_RESPONSE"
  | "GENERIC";

interface ErrorAlertProps {
  errorType: ErrorType;
  customMessage?: string;
  onTryAgain?: () => void;
}

export function ErrorAlert({
  errorType,
  customMessage,
  onTryAgain,
}: ErrorAlertProps) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    alertRef.current?.focus();
  }, [errorType]);

  const getMessage = (): { title: string; body: string } => {
    switch (errorType) {
      case "RATE_LIMITED":
        return {
          title: "Service busy",
          body: "The service is busy right now. Please try again in a minute.",
        };
      case "TIMEOUT":
        return {
          title: "Request timed out",
          body: "The review request timed out. Please try again or check your connection.",
        };
      case "UNAVAILABLE":
        return {
          title: "Service unavailable",
          body: "Analysis is temporarily unavailable. Please try again shortly.",
        };
      case "NETWORK_ERROR":
        return {
          title: "Connection issue",
          body: "Could not reach the analysis service. Please check your network connection and try again.",
        };
      case "CANCELLED":
        return {
          title: "Analysis cancelled",
          body: "The analysis request was cancelled.",
        };
      case "TOO_SHORT":
        return {
          title: "Text too short",
          body:
            customMessage ||
            "Please paste more complete context from the offer (at least 40 characters) to review.",
        };
      case "TOO_LONG":
        return {
          title: "Text too long",
          body:
            customMessage ||
            "Offer text exceeds the maximum character limit. Please shorten the text and try again.",
        };
      case "MALFORMED_RESPONSE":
        return {
          title: "Unexpected response",
          body: "The service returned an unexpected format. Please try again.",
        };
      case "GENERIC":
      default:
        return {
          title: "Review could not be completed",
          body:
            customMessage ||
            "Unable to analyze the provided text. Please check your connection and try again.",
        };
    }
  };

  const { title, body } = getMessage();

  return (
    <div
      ref={alertRef}
      tabIndex={-1}
      role="alert"
      className="rounded-xl border border-slate-300 bg-slate-100/90 p-4 text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-600 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AttentionIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {body}
            </p>
          </div>
        </div>
        {onTryAgain && errorType !== "CANCELLED" && (
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-xs hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 min-h-[44px] shrink-0 self-start sm:self-auto"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
