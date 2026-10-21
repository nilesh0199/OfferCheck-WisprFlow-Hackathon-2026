import React, { useEffect, useRef } from "react";
import { AttentionIcon } from "./Icons";

export type ErrorType =
  | "TOO_SHORT"
  | "TOO_LONG"
  | "RATE_LIMITED"
  | "RATE_LIMITED_CLIENT"
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
      case "RATE_LIMITED_CLIENT":
        return {
          title: "Request limit reached",
          body:
            customMessage ||
            "You have reached the request limit for now. Please try again later.",
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
      className="rounded-xl border border-[var(--color-tint-attention-border)] bg-[var(--color-tint-attention-bg)] p-4 text-[var(--color-tint-attention-text)] shadow-xs focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AttentionIcon className="w-5 h-5 text-[var(--color-tint-attention-accent)] mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-0.5 text-xs sm:text-sm text-[var(--color-tint-attention-text)] opacity-90 leading-relaxed">
              {body}
            </p>
          </div>
        </div>
        {onTryAgain && errorType !== "CANCELLED" && (
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-xs sm:text-sm font-medium text-[var(--color-text)] shadow-xs hover:bg-[var(--color-surface-alt)] active:bg-[var(--color-surface-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] shrink-0 self-start sm:self-auto"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
