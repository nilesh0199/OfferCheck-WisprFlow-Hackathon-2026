"use client";

import React, { useState, useMemo, useRef } from "react";
import { ValidatedEntities } from "@/lib/analysis/schema";
import { extractContactDetails, isFreeEmailDomain } from "@/lib/research/extract";
import {
  buildResearchPrompt,
  ResearchPromptMode,
  ResearchDetails,
} from "@/lib/research/prompt";
import {
  CopyIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  HelpCircleIcon,
  InfoIcon,
} from "./Icons";

interface CompanyResearchCardProps {
  offerText: string;
  entities?: ValidatedEntities;
  defaultCollapsed?: boolean;
}

function getDomainFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    let clean = url.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `http://${clean}`;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function CompanyResearchCard({
  offerText,
  entities,
  defaultCollapsed = false,
}: CompanyResearchCardProps) {
  // Extract contact items from offerText
  const extracted = useMemo(
    () => extractContactDetails(offerText),
    [offerText]
  );

  // Editable fields prefilled from analysis entities and extracted contacts
  const [companyName, setCompanyName] = useState(() => entities?.companyName || "");
  const [website, setWebsite] = useState(() => extracted.urls[0] || "");
  const [senderDomain, setSenderDomain] = useState(() => extracted.senderDomains[0] || "");
  const [role, setRole] = useState(() => entities?.roleTitle || "");
  const [location, setLocation] = useState("");

  // Track previous entities and extracted contacts to sync prefill during render without useEffect
  const [prevEntities, setPrevEntities] = useState(entities);
  const [prevExtracted, setPrevExtracted] = useState(extracted);

  if (entities !== prevEntities) {
    setPrevEntities(entities);
    if (entities?.companyName) {
      setCompanyName(entities.companyName);
    }
    if (entities?.roleTitle) {
      setRole(entities.roleTitle);
    }
  }

  if (extracted !== prevExtracted) {
    setPrevExtracted(extracted);
    if (extracted.urls.length > 0 && !website) {
      setWebsite(extracted.urls[0]);
    }
    if (extracted.senderDomains.length > 0 && !senderDomain) {
      setSenderDomain(extracted.senderDomains[0]);
    }
  }

  // Mode and view state
  const [mode, setMode] = useState<ResearchPromptMode>("short");
  const [isCardOpen, setIsCardOpen] = useState(!defaultCollapsed);
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFallbackTextarea, setShowFallbackTextarea] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const fallbackTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Observations on supplied communication channels (never claims about company)
  const cleanSenderDomain = senderDomain.trim().toLowerCase().replace(/^@/, "");
  const websiteDomain = getDomainFromUrl(website);

  const observations = useMemo(() => {
    const list: string[] = [];

    if (cleanSenderDomain && isFreeEmailDomain(cleanSenderDomain)) {
      list.push(
        `The sender address uses a free email service (${cleanSenderDomain}). That is a reason to ask more questions, not proof of anything.`
      );
    }

    if (
      websiteDomain &&
      cleanSenderDomain &&
      !isFreeEmailDomain(cleanSenderDomain) &&
      websiteDomain !== cleanSenderDomain
    ) {
      list.push(
        "The website and the sender address use different domains. Worth checking; not proof of anything."
      );
    }

    return list;
  }, [cleanSenderDomain, websiteDomain]);

  // Build the generated prompt text
  const promptDetails: ResearchDetails = useMemo(
    () => ({
      companyName,
      website,
      senderDomain,
      role,
      location,
    }),
    [companyName, website, senderDomain, role, location]
  );

  const generatedPrompt = useMemo(
    () => buildResearchPrompt(promptDetails, mode),
    [promptDetails, mode]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setShowFallbackTextarea(false);
      setLiveAnnouncement("Research prompt copied to clipboard.");
      setTimeout(() => {
        setCopied(false);
        setLiveAnnouncement("");
      }, 2500);
    } catch {
      setShowFallbackTextarea(true);
      setTimeout(() => {
        fallbackTextareaRef.current?.select();
      }, 50);
    }
  };

  return (
    <div
      id="section-research"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs transition-colors overflow-hidden"
    >
      {/* Live announcement region for copy status */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Card Header with Expand/Collapse toggle */}
      <div className="p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-mono font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
              Optional Step
            </span>
            <span className="text-2xs font-mono text-[var(--text-muted)]">
              External Handoff
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-serif text-[var(--text)]">
            Research the company (optional)
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Prepare a structured research prompt using confirmed details to look
            up public company records in an external assistant like Perplexity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCardOpen(!isCardOpen)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-xs hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] shrink-0"
          aria-expanded={isCardOpen}
          aria-label={isCardOpen ? "Collapse research card" : "Expand research card"}
        >
          <span>{isCardOpen ? "Collapse" : "Expand"}</span>
          {isCardOpen ? (
            <ChevronUpIcon className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
      </div>

      {/* Collapsible Card Body */}
      {isCardOpen && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Editable Details Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Confirmed Details (Included in Prompt)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="research-company-name"
                  className="block text-xs font-medium text-[var(--text)]"
                >
                  Company name
                </label>
                <input
                  id="research-company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Technologies Pvt. Ltd."
                  maxLength={100}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[40px]"
                />
                <p className="text-2xs text-[var(--text-muted)]">
                  As stated in the communication.
                </p>
              </div>

              {/* Claimed Website (Plain Text Input, Never Rendered as a Link) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="research-website"
                  className="block text-xs font-medium text-[var(--text)]"
                >
                  Claimed website (plain text)
                </label>
                <input
                  id="research-website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://www.example.com"
                  maxLength={200}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[40px]"
                />
                <p className="text-2xs text-[var(--text-muted)]">
                  Plain text only; not clicked or opened by OfferCheck.
                </p>
              </div>

              {/* Sender Email Domain */}
              <div className="space-y-1.5">
                <label
                  htmlFor="research-sender-domain"
                  className="block text-xs font-medium text-[var(--text)]"
                >
                  Sender email domain
                </label>
                <input
                  id="research-sender-domain"
                  type="text"
                  value={senderDomain}
                  onChange={(e) => setSenderDomain(e.target.value)}
                  placeholder="e.g. example.com or gmail.com"
                  maxLength={100}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[40px]"
                />
                <p className="text-2xs text-[var(--text-muted)]">
                  The domain following the @ symbol.
                </p>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label
                  htmlFor="research-role"
                  className="block text-xs font-medium text-[var(--text)]"
                >
                  Role title
                </label>
                <input
                  id="research-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer or Intern"
                  maxLength={100}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[40px]"
                />
                <p className="text-2xs text-[var(--text-muted)]">
                  The position or role mentioned in the offer.
                </p>
              </div>

              {/* Location (Optional) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="research-location"
                  className="block text-xs font-medium text-[var(--text)]"
                >
                  Location (optional)
                </label>
                <input
                  id="research-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India or Remote"
                  maxLength={100}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[40px]"
                />
                <p className="text-2xs text-[var(--text-muted)]">
                  City, state, or remote classification if specified.
                </p>
              </div>
            </div>
          </div>

          {/* Observations on Supplied Details (Plain text, non-alarmist) */}
          {observations.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 space-y-2 text-xs text-[var(--text)]">
              <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                <InfoIcon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span>Observations on supplied channels</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-[var(--text-muted)]">
                {observations.map((obs, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Depth Selector */}
          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <label className="block text-xs font-medium text-[var(--text)]">
              Research Prompt Depth
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs text-[var(--text)] cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="research-depth"
                  value="short"
                  checked={mode === "short"}
                  onChange={() => setMode("short")}
                  className="text-[var(--primary-ledger)] focus:ring-[var(--focus-ring)]"
                />
                <span>Short (about 300 words, focused overview)</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs text-[var(--text)] cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="research-depth"
                  value="detailed"
                  checked={mode === "detailed"}
                  onChange={() => setMode("detailed")}
                  className="text-[var(--primary-ledger)] focus:ring-[var(--focus-ring)]"
                />
                <span>Detailed (about 600 words, comprehensive check)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary-ledger)] text-white px-4 py-2.5 text-xs font-medium shadow-xs hover:bg-[var(--primary-ledger-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-white" />
                  <span>Prompt copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4 text-white" />
                  <span>Copy research prompt</span>
                </>
              )}
            </button>

            <a
              href="https://www.perplexity.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-4 py-2.5 text-xs font-medium shadow-xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
            >
              <span>Open Perplexity</span>
              <ExternalLinkIcon className="w-3.5 h-3.5 opacity-70" />
              <span className="text-2xs text-[var(--text-muted)] font-normal">
                (opens in a new tab)
              </span>
            </a>

            <button
              type="button"
              onClick={() => setIsPromptPreviewOpen(!isPromptPreviewOpen)}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline underline-offset-2 py-2 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
              aria-expanded={isPromptPreviewOpen}
            >
              <span>{isPromptPreviewOpen ? "Hide prompt preview" : "View prompt preview"}</span>
              {isPromptPreviewOpen ? (
                <ChevronUpIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Clipboard Fallback Textarea if navigator.clipboard fails */}
          {showFallbackTextarea && (
            <div className="space-y-2 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <p className="text-xs text-[var(--text-muted)]">
                Clipboard access was blocked. Please select and copy the prompt manually:
              </p>
              <textarea
                ref={fallbackTextareaRef}
                readOnly
                value={generatedPrompt}
                rows={6}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs font-mono text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              />
            </div>
          )}

          {/* Collapsible Read-only Prompt Preview */}
          {isPromptPreviewOpen && (
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-2xs text-[var(--text-muted)]">
                <span className="font-mono uppercase font-semibold">
                  Prompt Preview ({mode} mode)
                </span>
                <span>Read-only text</span>
              </div>
              <pre className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs font-mono text-[var(--text)] leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar select-text">
                {generatedPrompt}
              </pre>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="pt-3 border-t border-[var(--border)] text-2xs text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text)] font-semibold">Privacy notice: </strong>
            Perplexity is an external service with its own terms and may ask you to
            sign in. Only the details above are included in the prompt, never your
            offer text. Check them before you copy, and do not add personal information.
          </div>

          {/* Static Guide: How to Read the Answer */}
          <div className="pt-2 border-t border-[var(--border)]">
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 transition-colors">
              <summary className="flex items-center justify-between gap-3 font-semibold text-xs text-[var(--text)] cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded">
                <div className="flex items-center gap-2">
                  <HelpCircleIcon className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>How to read the research answer</span>
                </div>
                <span className="text-[var(--text-muted)] group-open:rotate-180 transition-transform duration-200 font-mono text-2xs">
                  ▼
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
                <p>
                  <strong className="text-[var(--text)]">Ambiguous or several candidates: </strong>
                  Confirm which organisation sent this, using contact details you find on its official site.
                </p>
                <p>
                  <strong className="text-[var(--text)]">Domain mismatch or Cannot tell: </strong>
                  Ask the sender to confirm from an official address you found independently; a mismatch is a reason to ask, not proof.
                </p>
                <p>
                  <strong className="text-[var(--text)]">Not found: </strong>
                  It means the assistant could not find it, not that something is wrong; check the official site yourself.
                </p>
                <p>
                  <strong className="text-[var(--text)]">Reports: </strong>
                  Open the linked source and read it; an allegation is not a finding.
                </p>
                <p>
                  <strong className="text-[var(--text)]">Evidence strength Very limited: </strong>
                  Treat the research as inconclusive.
                </p>
                <p>
                  <strong className="text-[var(--text)]">Important reminder: </strong>
                  Even if everything matches, it does not prove that this sender or offer is genuine. AI answers can be wrong, so open the links.
                </p>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
