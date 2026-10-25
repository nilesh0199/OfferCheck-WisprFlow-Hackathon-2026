"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { matchCommand, Command } from "@/lib/commands/match";
import { APP_NAME, HERO_HEADLINE, PRODUCTION_DOMAIN } from "@/lib/config";
import { useOfferSession } from "./SessionProvider";
import { WizardStep } from "@/lib/combined-text";
import { computeDockOffset, DOCK_BAR_DEFAULT_HEIGHT_PX } from "@/lib/dock-layout";

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
    isCommandBarEnabled,
  } = useOfferSession();

  const [rawInput, setRawInput] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingCommand, setPendingCommand] = useState<Command | null>(null);
  const [highlightHelp, setHighlightHelp] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isActive = isFocused || Boolean(pendingCommand) || Boolean(rawInput.trim()) || isHelpOpen;

  const asideRef = useRef<HTMLElement>(null);
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

  const openHelp = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("toggle-sidebar", { detail: { open: false } })
    );
    setIsHelpOpen(true);
    setIsFocused(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

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
      if (cmd.kind !== "SHOW_HELP") {
        closeHelp();
      }
      // Keep input focused so user can continue voice or keyboard navigation
      inputRef.current?.focus();

      switch (cmd.kind) {
        case "OPEN_SIDEBAR": {
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: true } })
          );
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
          break;
        }

        case "CLOSE_SIDEBAR": {
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: false } })
          );
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
          break;
        }

        case "SHOW_HELP": {
          openHelp();
          break;
        }

        case "OPEN_GITHUB": {
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: false } })
          );
          inputRef.current?.blur();
          setIsFocused(false);
          window.open(
            "https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026",
            "_blank",
            "noopener,noreferrer"
          );
          break;
        }

        case "SHARE": {
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: false } })
          );
          inputRef.current?.blur();
          setIsFocused(false);

          const shareTitle = `${APP_NAME} — ${HERO_HEADLINE}`;
          const shareText = `${HERO_HEADLINE} Check job and internship offers before you pay or share documents with ${APP_NAME}.`;
          const shareUrl =
            typeof window !== "undefined"
              ? window.location.origin
              : PRODUCTION_DOMAIN;

          if (typeof navigator !== "undefined" && navigator.share) {
            try {
              await navigator.share({
                title: shareTitle,
                text: shareText,
                url: shareUrl,
              });
            } catch {
              // Share dismissed
            }
          } else if (typeof navigator !== "undefined" && navigator.clipboard) {
            try {
              await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
              showAnnouncement("Link copied to clipboard", 4000);
            } catch {
              // fallback
            }
          }
          break;
        }

        case "NAVIGATE": {
          // If sidebar is open, close it so navigated page or section is visible
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: false } })
          );

          if (cmd.target === "/" && pathname === "/") {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            if (typeof window !== "undefined" && window.location.hash) {
              window.history.pushState(null, "", "/");
            }
          } else if (cmd.target.startsWith("/#") && pathname === "/") {
            const hash = cmd.target.split("#")[1];
            const el = document.getElementById(hash);
            if (el) {
              setTimeout(() => {
                el.scrollIntoView({ behavior: "smooth" });
              }, 50);
              window.history.pushState(null, "", `#${hash}`);
            }
          } else {
            router.push(cmd.target);
            if (cmd.target.includes("#")) {
              const hash = cmd.target.split("#")[1];
              setTimeout(() => {
                const el = document.getElementById(hash);
                el?.scrollIntoView({ behavior: "smooth" });
              }, 120);
            }
          }
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
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
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar", { detail: { open: false } })
          );
          const el = document.getElementById(cmd.sectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
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
      pathname,
      router,
      setStep,
      setStepSkipped,
      showAnnouncement,
      closeHelp,
      openHelp,
    ]
  );

  // User canceled the pending command
  const handleCancel = useCallback(() => {
    clearCountdown();
    clearUnrecognisedTimer();
    clearAnnouncementTimer();
    setRawInput("");
    setAnnouncement("");
    inputRef.current?.focus();
    setIsFocused(true);
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
        let timeLeft = 1;
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

  // Keyboard navigation: Space cancels pending countdown (Enter runs immediately), Escape blurs, "/" or Cmd+K focuses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If a command is pending/counting down, Space cancels, Enter executes immediately
      if (pendingCommand) {
        if (e.key === "Enter") {
          e.preventDefault();
          clearCountdown();
          executeCommand(pendingCommand);
          return;
        }
        if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
          e.preventDefault();
          handleCancel();
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          handleCancel();
          return;
        }
      }

      if (e.key === "Escape") {
        if (isHelpOpen) {
          e.preventDefault();
          closeHelp();
          return;
        }
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
          setIsFocused(false);
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
  }, [pendingCommand, handleCancel, clearCountdown, executeCommand, isHelpOpen, closeHelp]);

  // Sync help dialog modal state and lock background scroll
  useEffect(() => {
    const dialog = helpDialogRef.current;
    if (!dialog) return;

    if (isHelpOpen) {
      if (!dialog.open) {
        if (typeof dialog.show === "function") {
          dialog.show();
        } else {
          dialog.showModal();
        }
      }
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }, 50);
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isHelpOpen]);

  // Close What can I say modal when clicking anywhere outside it
  useEffect(() => {
    if (!isHelpOpen) return;

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest?.("#command-help-dialog") ||
        target?.closest?.('button[data-help-trigger="true"]') ||
        target?.closest?.('aside[aria-label="Command bar"]')
      ) {
        return;
      }
      closeHelp();
    };

    window.addEventListener("click", handleWindowClick, true);
    return () => window.removeEventListener("click", handleWindowClick, true);
  }, [isHelpOpen, closeHelp]);

  // If sidebar is opened, close the help dialog so they do not overlap
  useEffect(() => {
    const handleSidebarToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open?: boolean }>;
      if (customEvent.detail?.open) {
        closeHelp();
      }
    };

    window.addEventListener("toggle-sidebar", handleSidebarToggle);
    return () => window.removeEventListener("toggle-sidebar", handleSidebarToggle);
  }, [closeHelp]);

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
      case "OPEN_GITHUB":
        return "GitHub repository";
      case "SHARE":
        return "Share OfferClara";
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

  // Set --dock-offset on root so pages and fixed/sticky elements avoid overlapping the command bar
  useEffect(() => {
    if (!isCommandBarEnabled) {
      document.documentElement.style.setProperty("--dock-offset", "0px");
      return;
    }

    const updateDockOffset = () => {
      const asideEl = asideRef.current;
      const barHeight = asideEl ? asideEl.offsetHeight : DOCK_BAR_DEFAULT_HEIGHT_PX;
      const offset = computeDockOffset(true, barHeight);
      document.documentElement.style.setProperty("--dock-offset", `${offset}px`);
    };

    updateDockOffset();

    const asideEl = asideRef.current;
    if (!asideEl) return;

    const observer = new ResizeObserver(() => {
      updateDockOffset();
    });
    observer.observe(asideEl);

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--dock-offset", "0px");
    };
  }, [isCommandBarEnabled, pendingCommand, announcement, isHelpOpen]);

  // When enabled / shown, automatically focus the input field
  useEffect(() => {
    if (isCommandBarEnabled) {
      inputRef.current?.focus();
    }
  }, [isCommandBarEnabled]);

  // Hidden on 404, error, print, or when toggled off
  if (pathname === "/_not-found" || pathname === "/not-found" || !isCommandBarEnabled) {
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

      {/* Backdrop overlay for What can I say modal */}
      {isHelpOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={closeHelp}
          className="fixed inset-0 bg-[rgba(0,0,0,0.45)] backdrop-blur-xs z-40 transition-opacity duration-200 pointer-events-auto print:hidden"
        />
      )}

      {/* Docked Command Bar Container */}
      <aside
        ref={asideRef}
        aria-label="Command bar"
        className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[min(340px,92vw)] sm:max-w-[min(480px,94vw)] px-2 sm:px-0 pointer-events-none pb-[calc(env(safe-area-inset-bottom,0px))] print:hidden"
      >
        {/* Status Line: Countdown or Announcement */}
        {pendingCommand && countdown !== null && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-1.5 sm:mb-2 flex items-center justify-between text-xs font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-xs gap-1.5 sm:gap-2"
          >
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="font-semibold text-[var(--text)]">
                Running {getCommandDisplayLabel(pendingCommand)}...
              </span>
              <span className="text-xs text-[var(--text-muted)] font-normal">
                (press space bar to cancel)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded px-1.5 py-0.5 min-h-[32px] sm:min-h-[36px] inline-flex items-center shrink-0 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {!pendingCommand && announcement && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-1.5 sm:mb-2 flex items-center justify-between text-xs font-medium text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-xs gap-1.5 sm:gap-2"
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
        <div
          className={`pointer-events-auto rounded-xl bg-[var(--surface)] p-1 sm:p-1.5 flex items-center gap-1 sm:gap-2 transition-all duration-300 ${
            isActive
              ? "border-2 border-[var(--command-active-border)] ring-2 sm:ring-3 ring-[var(--command-active-border)]/25 shadow-[0_0_18px_var(--command-active-glow)] sm:shadow-[0_0_24px_var(--command-active-glow)]"
              : "border border-[var(--border)] shadow-md"
          }`}
        >
          {/* Active Status Indicator Light */}
          <div className="pl-1.5 sm:pl-2 shrink-0 flex items-center justify-center">
            {isActive ? (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5" title="Command bar active">
                <span className="sr-only">Command bar active</span>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--command-active-border)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[var(--command-active-border)]" />
              </span>
            ) : (
              <>
                <span className="sr-only">Command bar ready</span>
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={rawInput}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              if (e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                return;
              }
              setIsFocused(false);
            }}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (pendingCommand) {
                if (e.key === "Enter") {
                  e.preventDefault();
                  clearCountdown();
                  executeCommand(pendingCommand);
                  return;
                }
                if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
                  e.preventDefault();
                  handleCancel();
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancel();
                  return;
                }
              }

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
            placeholder="Dictate a Command"
            title="Voice commands: dictate with Wispr Flow or any dictation tool"
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none min-h-[38px] sm:min-h-[44px] px-1.5 sm:px-3 rounded-lg"
            aria-label="Dictate a Command"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            aria-hidden="true"
            tabIndex={-1}
            title="Voice commands: dictate with Wispr Flow or any dictation tool"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--surface-muted)]/70 hover:bg-[var(--surface-muted)] border border-[var(--border)] rounded-md px-2 py-1 shrink-0 font-medium select-none cursor-pointer transition-colors"
          >
            Press <kbd className="font-sans font-semibold text-[var(--text)] text-xs bg-[var(--surface)] px-1 py-0.5 rounded border border-[var(--border)]">/</kbd> to start
          </button>

          <button
            type="button"
            data-help-trigger="true"
            aria-expanded={isHelpOpen}
            onClick={() => {
              if (isHelpOpen) {
                closeHelp();
              } else {
                openHelp();
              }
            }}
            className={`shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[38px] sm:min-h-[44px] transition-colors border ${
              highlightHelp || isHelpOpen
                ? "border-[var(--color-primary)] ring-2 ring-[var(--focus-ring)] text-[var(--color-primary)] font-semibold"
                : "border-transparent"
            }`}
          >
            <span className="hidden min-[360px]:inline">What can I say?</span>
            <span className="min-[360px]:hidden">Help</span>
          </button>
        </div>
      </aside>

      {/* Accessible Help Panel Dialog */}
      <dialog
        ref={helpDialogRef}
        id="command-help-dialog"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 m-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl max-w-lg w-[min(512px,calc(100vw-32px))] max-h-[85vh] text-[var(--text)] space-y-4 print:hidden"
        onCancel={(e) => {
          e.preventDefault();
          closeHelp();
        }}
        onClose={() => {
          if (isHelpOpen) {
            setIsHelpOpen(false);
          }
        }}
        onClick={(e) => {
          const rect = helpDialogRef.current?.getBoundingClientRect();
          if (rect) {
            const isInside =
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom;
            if (!isInside) {
              closeHelp();
            }
          }
        }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-semibold text-[var(--text)]">
            What can I say?
          </h2>
          <button
            type="button"
            onClick={closeHelp}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] inline-flex items-center cursor-pointer"
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
            OfferClara does not use your microphone. Use Wispr Flow or any dictation tool to type into this box. To enter your offer or your question, click that text box and dictate there.
          </p>
        </div>
      </dialog>
    </>
  );
}
