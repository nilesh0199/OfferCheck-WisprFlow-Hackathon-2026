"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { matchCommand, Command } from "@/lib/commands/match";
import { useOfferSession } from "./SessionProvider";
import { WizardStep } from "@/lib/combined-text";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import { FULL_WIZARD_SAMPLES } from "@/data/wizard-samples";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Offer",
  2: "Source",
  3: "Conversation",
  4: "Money and documents",
  5: "Review",
};

export function CommandBar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    currentStep,
    setStep,
    offerText,
    setOfferText,
    setSourceNote,
    source,
    setConversationText,
    conversation,
    setPaymentNote,
    payment,
    loadWizardSample,
    handleAnalyze,
    handleClear,
    analysis,
    analyzedSnapshotText,
  } = useOfferSession();

  const [rawInput, setRawInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derive recognized command
  const recognizedCommand = useMemo<Command>(() => {
    if (!rawInput.trim()) return { kind: "UNKNOWN", rawText: "" };
    return matchCommand(rawInput, {
      route: pathname,
      currentStep,
    });
  }, [rawInput, pathname, currentStep]);

  const clearTimer = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  // Keyboard shortcut listener: / or Ctrl+K / Cmd+K to focus, Esc to blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an editable element (unless it's Esc or Ctrl+K)
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        if (inputRef.current && document.activeElement === inputRef.current) {
          inputRef.current.blur();
          setIsFocused(false);
          clearTimer();
          setConfirmClear(false);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
        setIsMobileOpen(true);
        return;
      }

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
        setIsMobileOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearTimer]);

  // Execute a command
  const executeCommand = useCallback(
    async (cmd: Command) => {
      clearTimer();
      setConfirmClear(false);
      setRawInput("");
      inputRef.current?.blur();
      setIsFocused(false);

      switch (cmd.kind) {
        case "NAVIGATE_WIZARD": {
          if (pathname !== "/check") {
            router.push("/check");
          }
          setStep(cmd.step);
          setAnnouncement(`Navigated to Step ${cmd.step}: ${STEP_LABELS[cmd.step]}`);
          break;
        }

        case "NAVIGATE_ROUTE": {
          router.push(cmd.route);
          setAnnouncement(`Navigated to ${cmd.route}`);
          break;
        }

        case "ANALYSE": {
          if (pathname !== "/check") {
            router.push("/check");
          }
          setAnnouncement("Starting analysis...");
          await handleAnalyze();
          break;
        }

        case "CLEAR": {
          handleClear();
          setAnnouncement("Cleared session");
          break;
        }

        case "SAVE_PDF": {
          setAnnouncement("Opening print document");
          if (typeof window !== "undefined") {
            window.print();
          }
          break;
        }

        case "COPY_SUMMARY": {
          if (analysis) {
            const summary = buildReviewSummary(analysis, analyzedSnapshotText);
            if (navigator?.clipboard) {
              await navigator.clipboard.writeText(summary);
              setAnnouncement("Review summary copied to clipboard");
            }
          } else {
            setAnnouncement("No review summary available to copy");
          }
          break;
        }

        case "TOGGLE_THEME": {
          if (typeof window !== "undefined") {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem(THEME_STORAGE_KEY, next);
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) {
              metaTheme.setAttribute("content", next === "dark" ? "#0a111a" : "#10263f");
            }
            window.dispatchEvent(new Event("storage"));
            setAnnouncement(`Switched to ${next} theme`);
          }
          break;
        }

        case "SCROLL_SECTION": {
          const el =
            document.getElementById(cmd.sectionId) ||
            document.getElementById(`section-${cmd.sectionId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setAnnouncement(`Scrolled to ${cmd.sectionId}`);
          } else if (pathname !== "/check") {
            router.push(`/check#${cmd.sectionId}`);
            setAnnouncement(`Navigating to ${cmd.sectionId}`);
          }
          break;
        }

        case "LOAD_SAMPLE": {
          const fullSample = FULL_WIZARD_SAMPLES.find((s) => s.id === cmd.sampleId);
          if (fullSample) {
            loadWizardSample(fullSample);
            setAnnouncement(`Loaded ${fullSample.title}`);
            if (pathname !== "/check") {
              router.push("/check");
            }
            setStep(5);
            break;
          }

          const single = SYNTHETIC_EXAMPLES.find((s) => s.id === cmd.sampleId);
          if (single) {
            setOfferText(single.text);
            setAnnouncement(`Loaded ${single.title}`);
            if (pathname !== "/check") {
              router.push("/check");
            }
            setStep(1);
            break;
          }
          break;
        }

        case "UNKNOWN":
        default:
          break;
      }
    },
    [
      clearTimer,
      pathname,
      router,
      setStep,
      handleAnalyze,
      handleClear,
      analysis,
      analyzedSnapshotText,
      loadWizardSample,
      setOfferText,
    ]
  );

  // Add dictated text to the relevant wizard step or offer text
  const handleAddToOfferText = useCallback(() => {
    const textToAdd = rawInput.trim();
    if (!textToAdd) return;

    clearTimer();
    setRawInput("");
    inputRef.current?.blur();
    setIsFocused(false);

    if (pathname !== "/check") {
      router.push("/check");
    }

    if (currentStep === 1) {
      setOfferText(offerText ? `${offerText}\n\n${textToAdd}` : textToAdd);
      setAnnouncement("Added text to Step 1 Offer");
    } else if (currentStep === 2) {
      setSourceNote(source.note ? `${source.note} ${textToAdd}` : textToAdd);
      setAnnouncement("Added note to Step 2 Source");
    } else if (currentStep === 3) {
      setConversationText(
        conversation.text ? `${conversation.text}\n\n${textToAdd}` : textToAdd
      );
      setAnnouncement("Added text to Step 3 Conversation");
    } else if (currentStep === 4) {
      setPaymentNote(payment.note ? `${payment.note} ${textToAdd}` : textToAdd);
      setAnnouncement("Added note to Step 4 Money and documents");
    } else {
      setOfferText(offerText ? `${offerText}\n\n${textToAdd}` : textToAdd);
      setAnnouncement("Added text to Step 1 Offer");
    }
  }, [
    rawInput,
    clearTimer,
    pathname,
    router,
    currentStep,
    offerText,
    setOfferText,
    source.note,
    setSourceNote,
    conversation.text,
    setConversationText,
    payment.note,
    setPaymentNote,
  ]);

  // Handle input change and start countdown for recognized commands
  const handleInputChange = useCallback(
    (val: string) => {
      setRawInput(val);
      clearTimer();

      const trimmed = val.trim();
      if (!trimmed || trimmed.length > 80) {
        setConfirmClear(false);
        return;
      }

      const cmd = matchCommand(val, {
        route: pathname,
        currentStep,
      });

      if (cmd.kind === "CLEAR") {
        setConfirmClear(true);
        return;
      }

      setConfirmClear(false);
      if (cmd.kind !== "UNKNOWN") {
        let timeLeft = 2;
        setCountdown(timeLeft);

        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 1;
          if (timeLeft <= 0) {
            clearTimer();
            executeCommand(cmd);
          } else {
            setCountdown(timeLeft);
          }
        }, 1000);
      }
    },
    [clearTimer, executeCommand, pathname, currentStep]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Human-readable command label
  const getCommandLabel = (cmd: Command): string => {
    switch (cmd.kind) {
      case "NAVIGATE_WIZARD":
        return `Jump to Step ${cmd.step}: ${STEP_LABELS[cmd.step]}`;
      case "NAVIGATE_ROUTE":
        return `Go to ${cmd.route === "/" ? "Home" : cmd.route}`;
      case "ANALYSE":
        return "Analyze offer";
      case "CLEAR":
        return "Clear everything";
      case "SAVE_PDF":
        return "Save as PDF";
      case "COPY_SUMMARY":
        return "Copy summary to clipboard";
      case "TOGGLE_THEME":
        return "Switch theme";
      case "SCROLL_SECTION":
        return `Jump to ${cmd.sectionId}`;
      case "LOAD_SAMPLE":
        return `Load sample (${cmd.sampleId})`;
      default:
        return "";
    }
  };

  const hasInput = rawInput.trim().length > 0;
  const isMatch = recognizedCommand.kind !== "UNKNOWN";
  const isLongInput = rawInput.length > 80;

  if (pathname === "/_not-found" || pathname === "/not-found") {
    return null;
  }

  return (
    <>
      {/* Screen Reader Announcement Region */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Desktop and Mobile Responsive Command Bar Container */}
      <div
        role="search"
        aria-label="Voice or typed command"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none pb-[calc(env(safe-area-inset-bottom,0px))]"
      >
        <div
          className={`pointer-events-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md shadow-lg transition-all duration-200 ${
            isFocused || hasInput || isMobileOpen ? "ring-2 ring-[var(--focus-ring)] p-3" : "p-1.5 opacity-90 hover:opacity-100"
          }`}
        >
          {/* Main Input Row */}
          <div className="flex items-center gap-2">
            <span
              className="pl-2 text-xs text-[var(--text-muted)] font-mono select-none"
              aria-hidden="true"
            >
              ⌘
            </span>

            <input
              ref={inputRef}
              type="text"
              value={rawInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                if (!hasInput) {
                  setIsFocused(false);
                  setIsMobileOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (confirmClear) {
                    executeCommand({ kind: "CLEAR" });
                  } else if (isMatch) {
                    executeCommand(recognizedCommand);
                  } else if (hasInput) {
                    handleAddToOfferText();
                  }
                }
              }}
              placeholder="Dictate or type a command... (or press /)"
              className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none min-h-[40px] px-1"
              aria-label="Command input"
            />

            {/* Clear input button if typed */}
            {hasInput && (
              <button
                type="button"
                onClick={() => {
                  setRawInput("");
                  clearTimer();
                  setConfirmClear(false);
                  inputRef.current?.focus();
                }}
                className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] min-h-[44px] inline-flex items-center"
                aria-label="Clear command text"
              >
                Clear
              </button>
            )}

            {/* Keyboard shortcut hint */}
            {!hasInput && (
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[0.75rem] font-mono text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] select-none mr-1"
                aria-hidden="true"
              >
                <span>/</span>
                <span>or</span>
                <span>Ctrl+K</span>
              </span>
            )}
          </div>

          {/* Destructive Clear Confirmation Banner */}
          {confirmClear && (
            <div
              role="alert"
              className="mt-2 pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <span className="font-semibold text-[var(--text)]">
                Clear everything? This will reset your review.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeCommand({ kind: "CLEAR" })}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] font-semibold hover:bg-[var(--color-primary-hover)] min-h-[36px]"
                >
                  Yes, clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmClear(false);
                    clearTimer();
                    setRawInput("");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] min-h-[36px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Countdown / Recognition Bar */}
          {!confirmClear && isMatch && !isLongInput && (
            <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--text)]">
                  {getCommandLabel(recognizedCommand)}
                </span>
                {countdown !== null && (
                  <span className="text-[var(--text-muted)] font-mono">
                    (in {countdown}s...)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeCommand(recognizedCommand)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] font-medium hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                >
                  Run now
                </button>
                <button
                  type="button"
                  onClick={handleAddToOfferText}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                >
                  Add to offer text instead
                </button>
              </div>
            </div>
          )}

          {/* Dictated Offer Text Option (> 80 chars or UNKNOWN) */}
          {!confirmClear && hasInput && (!isMatch || isLongInput) && (
            <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[var(--text-muted)] truncate max-w-[280px]">
                &quot;{rawInput}&quot;
              </span>
              <button
                type="button"
                onClick={handleAddToOfferText}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] font-semibold hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
              >
                Add to offer text (Step {currentStep})
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
