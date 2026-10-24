"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { matchCommand, Command } from "@/lib/commands/match";
import { useOfferSession } from "./SessionProvider";
import { WizardStep } from "@/lib/combined-text";

export function CommandBar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    currentStep,
    setStep,
    setStepSkipped,
    isReady,
    handleAnalyze,
    analysis,
  } = useOfferSession();

  const [rawInput, setRawInput] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingCommand, setPendingCommand] = useState<Command | null>(null);
  const [highlightHelp, setHighlightHelp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const helpDialogRef = useRef<HTMLDialogElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const unrecognisedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const announcementTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear countdown interval
  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setPendingCommand(null);
  }, []);

  // Clear unrecognised timer
  const clearUnrecognisedTimer = useCallback(() => {
    if (unrecognisedTimerRef.current) {
      clearTimeout(unrecognisedTimerRef.current);
      unrecognisedTimerRef.current = null;
    }
  }, []);

  // Clear announcement timer
  const clearAnnouncementTimer = useCallback(() => {
    if (announcementTimerRef.current) {
      clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = null;
    }
  }, []);

  // Show announcement with auto-dismiss (defaults to 5 seconds)
  const showAnnouncement = useCallback(
    (msg: string, durationMs: number = 5000) => {
      clearAnnouncementTimer();
      setAnnouncement(msg);
      announcementTimerRef.current = setTimeout(() => {
        setAnnouncement("");
      }, durationMs);
    },
    [clearAnnouncementTimer]
  );

  const triggerUnrecognised = useCallback(() => {
    clearCountdown();
    clearUnrecognisedTimer();
    setRawInput("");
    showAnnouncement(
      "That command isn't recognised. Try again, or open the list of commands.",
      5000
    );
    setHighlightHelp(true);
    setTimeout(() => setHighlightHelp(false), 3000);
  }, [clearCountdown, clearUnrecognisedTimer, showAnnouncement]);

  // Execute a recognized navigation command
  const executeCommand = useCallback(
    async (cmd: Command) => {
      clearCountdown();
      clearUnrecognisedTimer();
      setRawInput("");
      inputRef.current?.blur();

      switch (cmd.kind) {
        case "OPEN_SIDEBAR": {
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: true } })
          );
          break;
        }

        case "CLOSE_SIDEBAR": {
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: false } })
          );
          break;
        }

        case "SHOW_HELP": {
          helpDialogRef.current?.showModal();
          break;
        }

        case "NAVIGATE": {
          router.push(cmd.target);
          if (cmd.target.includes("#")) {
            const hash = cmd.target.split("#")[1];
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }
          break;
        }

        case "WIZARD_NEXT": {
          if (currentStep < 5) {
            setStep((currentStep + 1) as WizardStep);
          }
          break;
        }

        case "WIZARD_BACK": {
          if (currentStep > 1) {
            setStep((currentStep - 1) as WizardStep);
          }
          break;
        }

        case "WIZARD_SKIP": {
          setStepSkipped(currentStep, true);
          if (currentStep < 5) {
            setStep((currentStep + 1) as WizardStep);
          }
          break;
        }

        case "WIZARD_GOTO_STEP": {
          setStep(cmd.step);
          break;
        }

        case "ANALYSE": {
          if (isReady) {
            await handleAnalyze();
          } else {
            showAnnouncement("Add your offer first.", 5000);
          }
          break;
        }

        case "JUMP_SECTION": {
          const el = document.getElementById(cmd.sectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }

        case "EDIT_ANSWERS": {
          const editBtn = document.querySelector('button[aria-label="Edit your offer text"]') as HTMLButtonElement | null;
          editBtn?.click();
          break;
        }

        default:
          break;
      }
    },
    [
      clearCountdown,
      clearUnrecognisedTimer,
      currentStep,
      handleAnalyze,
      isReady,
      router,
      setStep,
      setStepSkipped,
      showAnnouncement,
    ]
  );

  // User canceled the pending command
  const handleCancel = useCallback(() => {
    clearCountdown();
    clearUnrecognisedTimer();
    clearAnnouncementTimer();
    setRawInput("");
    setAnnouncement("");
  }, [clearCountdown, clearUnrecognisedTimer, clearAnnouncementTimer]);

  // Handle typing / dictating in input
  const handleInputChange = useCallback(
    (val: string) => {
      setRawInput(val);
      clearCountdown();
      clearUnrecognisedTimer();
      clearAnnouncementTimer();
      setAnnouncement("");

      const trimmed = val.trim();
      if (!trimmed) {
        return;
      }

      // If user dictated or pasted long text (> 80 chars), it is unrecognised
      if (val.length > 80) {
        triggerUnrecognised();
        return;
      }

      const match = matchCommand(val, {
        page: pathname,
        step: currentStep,
        hasReview: Boolean(analysis),
      });

      if (match.kind === "WRONG_CONTEXT") {
        clearCountdown();
        setRawInput("");
        showAnnouncement(match.hint, 5000);
        return;
      }

      if (match.kind !== "UNKNOWN") {
        if (match.kind === "SHOW_HELP") {
          executeCommand(match);
          return;
        }

        setPendingCommand(match);
        let timeLeft = 2;
        setCountdown(timeLeft);

        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 1;
          if (timeLeft <= 0) {
            clearCountdown();
            executeCommand(match);
          } else {
            setCountdown(timeLeft);
          }
        }, 1000);
        return;
      }

      // If text is not recognized, set a timer to clear after 2.5s of no further typing
      unrecognisedTimerRef.current = setTimeout(() => {
        triggerUnrecognised();
      }, 2500);
    },
    [
      clearCountdown,
      clearUnrecognisedTimer,
      clearAnnouncementTimer,
      showAnnouncement,
      pathname,
      currentStep,
      analysis,
      triggerUnrecognised,
      executeCommand,
    ]
  );

  // Keyboard navigation: Escape cancels, "/" or Cmd+K / Ctrl+K focuses input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pendingCommand) {
          handleCancel();
        } else if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        }
        return;
      }

      // Check if user is typing in an editable field
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isEditable) return;

      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingCommand, handleCancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountdown();
      clearUnrecognisedTimer();
      clearAnnouncementTimer();
    };
  }, [clearCountdown, clearUnrecognisedTimer, clearAnnouncementTimer]);

  // Label for countdown
  const getCommandDisplayLabel = (cmd: Command): string => {
    switch (cmd.kind) {
      case "OPEN_SIDEBAR":
        return "Open sidebar";
      case "CLOSE_SIDEBAR":
        return "Close sidebar";
      case "SHOW_HELP":
        return "What can I say";
      case "NAVIGATE":
        return cmd.label;
      case "WIZARD_NEXT":
        return "Next step";
      case "WIZARD_BACK":
        return "Previous step";
      case "WIZARD_SKIP":
        return "Skip step";
      case "WIZARD_GOTO_STEP":
        return `Step ${cmd.step}: ${cmd.label}`;
      case "ANALYSE":
        return "Analyse offer";
      case "JUMP_SECTION":
        return cmd.label;
      case "EDIT_ANSWERS":
        return "Edit answers";
      default:
        return "command";
    }
  };

  // Hidden on 404, error, and print
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

      {/* Docked Command Bar Container */}
      <aside
        aria-label="Command bar"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-[min(480px,94vw)] px-3 sm:px-0 pointer-events-none pb-[calc(env(safe-area-inset-bottom,0px))] print:hidden"
      >
        {/* Status Line: Countdown or Announcement */}
        {pendingCommand && countdown !== null && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-2 flex items-center justify-between text-xs font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-2 shadow-xs"
          >
            <span>
              Running {getCommandDisplayLabel(pendingCommand)} in {countdown}...
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded px-1.5 py-0.5 min-h-[32px] inline-flex items-center"
            >
              Cancel
            </button>
          </div>
        )}

        {!pendingCommand && announcement && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-2 flex items-center justify-between text-xs font-medium text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-2 shadow-xs gap-2"
          >
            <span className="leading-snug">{announcement}</span>
            <button
              type="button"
              onClick={() => {
                clearAnnouncementTimer();
                setAnnouncement("");
              }}
              aria-label="Dismiss message"
              className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] shrink-0 inline-flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg
                aria-hidden="true"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="pointer-events-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-md flex items-center gap-1.5 sm:gap-2">
          <input
            ref={inputRef}
            type="text"
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (pendingCommand) {
                  executeCommand(pendingCommand);
                } else if (rawInput.trim()) {
                  const match = matchCommand(rawInput, {
                    page: pathname,
                    step: currentStep,
                    hasReview: Boolean(analysis),
                  });
                  if (match.kind === "WRONG_CONTEXT") {
                    setRawInput("");
                    showAnnouncement(match.hint, 5000);
                  } else if (match.kind !== "UNKNOWN") {
                    executeCommand(match);
                  } else {
                    triggerUnrecognised();
                  }
                }
              }
            }}
            placeholder="Dictate a command..."
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none min-h-[44px] px-2.5 sm:px-3 rounded-lg"
            aria-label="Dictate a command"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            title="Press / anywhere to focus the command box"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--surface-muted)]/70 hover:bg-[var(--surface-muted)] border border-[var(--border)] rounded-md px-2 py-1 shrink-0 font-medium select-none cursor-pointer transition-colors"
          >
            Press <kbd className="font-mono font-semibold text-[var(--text)] text-[10px] bg-[var(--surface)] px-1 py-0.5 rounded border border-[var(--border)]">/</kbd> to start
          </button>

          <button
            type="button"
            onClick={() => helpDialogRef.current?.showModal()}
            className={`shrink-0 px-2.5 sm:px-3 py-2 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors border ${
              highlightHelp
                ? "border-[var(--color-primary)] ring-2 ring-[var(--focus-ring)] text-[var(--color-primary)] font-semibold"
                : "border-transparent"
            }`}
          >
            What can I say?
          </button>
        </div>
      </aside>

      {/* Accessible Help Panel Dialog */}
      <dialog
        ref={helpDialogRef}
        id="command-help-dialog"
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl backdrop:bg-[rgba(0,0,0,0.4)] max-w-lg w-full text-[var(--text)] space-y-4 print:hidden"
        onCancel={() => helpDialogRef.current?.close()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-semibold text-[var(--text)]">
            What can I say?
          </h2>
          <button
            type="button"
            onClick={() => helpDialogRef.current?.close()}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] inline-flex items-center"
            autoFocus
          >
            Close
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[var(--text-muted)] max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          <div>
            <h3 className="font-semibold text-[var(--text)] mb-1">
              Anywhere
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>&ldquo;open sidebar&rdquo;, &ldquo;close sidebar&rdquo;</li>
              <li>&ldquo;home&rdquo;</li>
              <li>&ldquo;check an offer&rdquo;</li>
              <li>&ldquo;clear doubt&rdquo; / &ldquo;ask a doubt&rdquo;</li>
              <li>&ldquo;help and reporting&rdquo;</li>
              <li>&ldquo;about&rdquo;</li>
              <li>&ldquo;privacy&rdquo;</li>
              <li>&ldquo;how it works&rdquo;</li>
              <li>&ldquo;what you get&rdquo;</li>
              <li>&ldquo;faq&rdquo;</li>
              <li>&ldquo;i paid&rdquo; / &ldquo;i already paid&rdquo;</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text)] mb-1">
              On check page
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>&ldquo;next&rdquo;, &ldquo;back&rdquo;, &ldquo;skip&rdquo;</li>
              <li>&ldquo;step 1&rdquo; to &ldquo;step 5&rdquo; (or &ldquo;offer&rdquo;, &ldquo;source&rdquo;, &ldquo;conversation&rdquo;, &ldquo;money and documents&rdquo;, &ldquo;review&rdquo;)</li>
              <li>&ldquo;analyse&rdquo; (runs review when offer is added)</li>
              <li>&ldquo;overview&rdquo;, &ldquo;observations&rdquo;, &ldquo;missing details&rdquo;, &ldquo;questions&rdquo;, &ldquo;company research&rdquo;, &ldquo;resources&rdquo;, &ldquo;my text&rdquo;</li>
              <li>&ldquo;edit my answers&rdquo;</li>
            </ul>
          </div>

          <p className="pt-2 text-xs border-t border-[var(--border)] leading-relaxed text-[var(--text-subtle)]">
            No microphone permission is needed. Use Wispr Flow or any dictation tool to type for you. To enter your offer or your question, click that text box and dictate there.
          </p>
        </div>
      </dialog>
    </>
  );
}
