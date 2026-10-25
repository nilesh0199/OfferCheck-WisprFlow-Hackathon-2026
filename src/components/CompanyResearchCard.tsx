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

export interface CompanyResearchCardProps {
  offerText: string;
  entities?: ValidatedEntities;
  level?: "recommended" | "optional";
  reasons?: readonly string[];
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
  level = "optional",
  reasons = [],
  defaultCollapsed = true,
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
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(!defaultCollapsed);
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
      companyName: companyName.trim(),
      website: website.trim(),
      senderDomain: senderDomain.trim(),
      role: role.trim(),
      location: location.trim(),
    }),
    [companyName, website, senderDomain, role, location]
  );

  const generatedPrompt = useMemo(
    () => buildResearchPrompt(promptDetails, mode),
    [promptDetails, mode]
  );

  const isCompanyMissing = !companyName.trim();

  const handleCopy = async () => {
    if (isCompanyMissing) return;
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

  const isRecommended = level === "recommended";

  return (
    <div
      id="section-research"
      className={`rounded border border-t-[3px] border-t-[var(--color-primary)] transition-colors overflow-hidden ${
        isRecommended
          ? "border-[var(--color-tint-action-border)] bg-[var(--tint-action-bg)] shadow-2xs"
          : "border-[var(--border)] bg-[var(--surface)] shadow-2xs"
      }`}
    >
      {/* Live announcement region for copy status */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Card Header */}
      <div className="p-4 sm:p-5 space-y-3 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${
                  isRecommended
                    ? "bg-[var(--surface)] text-[var(--text)] border-[var(--border)]"
                    : "bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border)]"
                }`}
              >
                {isRecommended ? "Recommended next step" : "Optional next step"}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
              {isRecommended
                ? "Research the company before taking action"
                : "Research the company (optional)"}
            </h3>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
              {isRecommended
                ? "Before you sign or pay, spend two minutes looking up who sent this offer."
                : "Prepare a structured research prompt using confirmed details to look up public company records in an external assistant like Perplexity."}
            </p>
          </div>
        </div>

        {/* Recommended Reasons List */}
        {isRecommended && reasons.length > 0 && (
          <div className="rounded border border-[var(--tint-attention-border)] bg-[var(--tint-attention-bg)] p-3 text-xs text-[var(--text)] space-y-1.5">
            <div className="font-semibold text-xs text-[var(--text)] flex items-center gap-1.5">
              <InfoIcon className="w-3.5 h-3.5 text-[var(--tint-attention-accent)]" />
              <span>Why research is recommended for this offer:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-[var(--text)]">
              {reasons.map((reason, idx) => (
                <li key={idx} className="leading-relaxed">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Always-Visible Actions & Summary Section */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* 1-Line Key-Value Summary */}
        <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono">
          <span className="truncate">
            <strong className="text-[var(--text)] font-sans font-semibold">Company:</strong>{" "}
            {companyName.trim() || <span className="italic text-[var(--text-muted)] opacity-70">Not provided</span>}
          </span>
          <span className="truncate">
            <strong className="text-[var(--text)] font-sans font-semibold">Website:</strong>{" "}
            {website.trim() || <span className="italic text-[var(--text-muted)] opacity-70">Not provided</span>}
          </span>
          <span className="truncate">
            <strong className="text-[var(--text)] font-sans font-semibold">Sender domain:</strong>{" "}
            {senderDomain.trim() || <span className="italic text-[var(--text-muted)] opacity-70">Not provided</span>}
          </span>
          <span className="truncate">
            <strong className="text-[var(--text)] font-sans font-semibold">Role:</strong>{" "}
            {role.trim() || <span className="italic text-[var(--text-muted)] opacity-70">Not provided</span>}
          </span>
        </div>

        {/* Required Inline Company Name Input if Missing */}
        {isCompanyMissing && (
          <div className="rounded border border-[var(--border-strong)] bg-[var(--tint-attention-bg)] p-3 space-y-1.5">
            <label
              htmlFor="inline-company-input"
              className="block text-xs font-semibold text-[var(--text)]"
            >
              Company name <span className="font-normal text-[var(--text-muted)]">(required to generate research prompt)</span>:
            </label>
            <input
              id="inline-company-input"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Technologies Pvt. Ltd."
              maxLength={100}
              className="w-full rounded-xs border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
            />
            <p className="text-xs text-[var(--text-muted)]">
              Enter the company name stated in the communication or interview.
            </p>
          </div>
        )}

        {/* Depth Selector & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          {/* Depth Mode Segmented Control */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] font-medium text-xs">Depth:</span>
            <div className="inline-flex items-center rounded border border-[var(--border)] bg-[var(--surface-muted)] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMode("short")}
                className={`rounded-xs px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  mode === "short"
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-2xs font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Short (~300 words)
              </button>
              <button
                type="button"
                onClick={() => setMode("detailed")}
                className={`rounded-xs px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  mode === "detailed"
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-2xs font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Detailed (~600 words)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isCompanyMissing}
              className="inline-flex items-center justify-center gap-1.5 rounded-xs bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-3.5 py-1.5 text-xs font-medium shadow-2xs hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
              aria-label={
                isCompanyMissing
                  ? "Enter a company name above to generate the research prompt"
                  : "Copy research prompt to clipboard"
              }
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-current" />
                  <span>Prompt copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3.5 h-3.5 text-current" />
                  <span>Copy research prompt</span>
                </>
              )}
            </button>

            <a
              href="https://www.perplexity.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-3 py-1.5 text-xs font-medium shadow-2xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
            >
              <span>Open Perplexity</span>
              <ExternalLinkIcon className="w-3 h-3 opacity-70" />
            </a>

            <button
              type="button"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline underline-offset-2 py-1 px-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
              aria-expanded={isDetailsExpanded}
            >
              <span>{isDetailsExpanded ? "Hide details" : "Edit details"}</span>
              {isDetailsExpanded ? (
                <ChevronUpIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {isCompanyMissing && (
          <p className="text-xs text-[var(--text-muted)] italic">
            Enter a company name above to enable prompt copying.
          </p>
        )}

        {/* Clipboard Fallback Textarea if navigator.clipboard fails */}
        {showFallbackTextarea && (
          <div className="space-y-2 p-3 rounded border border-[var(--border)] bg-[var(--surface-muted)]">
            <p className="text-xs text-[var(--text-muted)]">
              Clipboard access was blocked. Please select and copy the prompt manually:
            </p>
            <textarea
              ref={fallbackTextareaRef}
              readOnly
              value={generatedPrompt}
              rows={5}
              className="w-full rounded-xs border border-[var(--border)] bg-[var(--surface)] p-2 text-xs font-mono text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            />
          </div>
        )}
      </div>

      {/* Collapsible Details Form */}
      {isDetailsExpanded && (
        <div className="p-4 sm:p-5 space-y-5 border-t border-[var(--border)] bg-[var(--surface-alt)]">
          <div className="space-y-3">
            <h4 className="text-xs font-sans text-[var(--text-muted)] font-semibold">
              Edit research details (included in prompt)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Company Name */}
              <div className="space-y-1">
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
                  className="w-full rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                />
              </div>

              {/* Claimed Website */}
              <div className="space-y-1">
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
                  className="w-full rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                />
              </div>

              {/* Sender Email Domain */}
              <div className="space-y-1">
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
                  className="w-full rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
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
                  className="w-full rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                />
              </div>

              {/* Location (Optional) */}
              <div className="space-y-1 sm:col-span-2">
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
                  className="w-full rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                />
              </div>
            </div>
          </div>

          {/* Observations on Supplied Channels */}
          {observations.length > 0 && (
            <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3 space-y-1 text-xs text-[var(--text)]">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)] text-xs">
                <InfoIcon className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span>Observations on supplied channels</span>
              </div>
              <ul className="space-y-0.5 pl-4 list-disc text-xs text-[var(--text-muted)]">
                {observations.map((obs, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prompt Preview Toggle */}
          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsPromptPreviewOpen(!isPromptPreviewOpen)}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline underline-offset-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
              aria-expanded={isPromptPreviewOpen}
            >
              <span>{isPromptPreviewOpen ? "Hide prompt preview" : "View generated prompt preview"}</span>
              {isPromptPreviewOpen ? (
                <ChevronUpIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              )}
            </button>

            {isPromptPreviewOpen && (
              <pre className="p-3 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-[var(--text)] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar select-text">
                {generatedPrompt}
              </pre>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text)] font-semibold">Privacy notice: </strong>
            Perplexity is an external service with its own terms and may ask you to
            sign in. Only the details above are included in the prompt, never your
            offer text. Check them before you copy, and do not add personal information.
          </div>

          {/* Static Guide: How to Read the Answer */}
          <div className="pt-1">
            <details className="group rounded border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors">
              <summary className="flex items-center justify-between gap-3 font-semibold text-xs text-[var(--text)] cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded">
                <div className="flex items-center gap-1.5">
                  <HelpCircleIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>How to read the research answer</span>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-[var(--text-muted)] group-open:rotate-180 transition-transform duration-200 motion-reduce:transition-none shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2.5 pt-2.5 border-t border-[var(--border)] space-y-1.5 text-xs text-[var(--text-muted)] leading-relaxed">
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
