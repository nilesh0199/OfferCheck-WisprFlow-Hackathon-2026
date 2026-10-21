"use client";

import React, { useState } from "react";
import { VerificationResource, VerificationResourceAction } from "@/data/verification-resources";
import {
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
} from "./Icons";

export interface ResourceCardProps {
  resource: VerificationResource;
  matchedTerm?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  copiedValue?: string | null;
  onCopy?: (value: string, label: string) => void;
}

export function ResourceCard({
  resource,
  matchedTerm,
  isCollapsible = false,
  defaultExpanded = true,
  copiedValue: externalCopiedValue,
  onCopy: externalOnCopy,
}: ResourceCardProps) {
  const [internalCopiedValue, setInternalCopiedValue] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultExpanded);

  const copiedValue = externalCopiedValue !== undefined ? externalCopiedValue : internalCopiedValue;

  const handleCopy = async (value: string, label: string) => {
    if (externalOnCopy) {
      externalOnCopy(value, label);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setInternalCopiedValue(value);
      setTimeout(() => {
        setInternalCopiedValue(null);
      }, 2000);
    } catch {
      prompt(`Copy ${label}:`, value);
    }
  };

  if (isCollapsible) {
    return (
      <details
        open={internalOpen}
        onToggle={(e) => setInternalOpen(e.currentTarget.open)}
        className="group rounded border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-2xs transition-colors"
      >
        <summary className="cursor-pointer font-bold text-xs sm:text-sm text-[var(--text)] flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[36px] list-none select-none">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-[var(--text-muted)] shrink-0" size={16} />
            <span>{resource.title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span>{internalOpen ? "Hide" : "Show"}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-150 ${
                internalOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </summary>

        <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2.5">
          {matchedTerm && (
            <p className="text-2xs text-[var(--text-muted)]">
              Shown because your text mentions &quot;{matchedTerm}&quot;.
            </p>
          )}

          <p className="text-xs text-[var(--text)] leading-relaxed">
            {resource.summary}
          </p>

          <ActionRow
            actions={resource.actions}
            copiedValue={copiedValue}
            onCopy={handleCopy}
          />

          <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-1 text-2xs text-[var(--text-muted)]">
            <span className="break-all font-mono">Official portal: {resource.sourceUrl}</span>
            <span>Verified resource</span>
          </div>
        </div>
      </details>
    );
  }

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-2xs space-y-2.5 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text)]">
            {resource.title}
          </h3>
          {matchedTerm && (
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">
              Shown because your text mentions &quot;{matchedTerm}&quot;.
            </p>
          )}
        </div>
        <span className="inline-flex items-center rounded-xs bg-[var(--surface-muted)] px-1.5 py-0.5 text-2xs font-mono font-medium text-[var(--text-muted)] border border-[var(--border)]">
          Official
        </span>
      </div>

      <p className="text-xs text-[var(--text)] leading-relaxed">
        {resource.summary}
      </p>

      <ActionRow
        actions={resource.actions}
        copiedValue={copiedValue}
        onCopy={handleCopy}
      />

      <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-1 text-2xs text-[var(--text-muted)]">
        <span className="break-all font-mono">Official portal: {resource.sourceUrl}</span>
        <span>Verified resource</span>
      </div>
    </div>
  );
}

interface ActionRowProps {
  actions: readonly VerificationResourceAction[];
  copiedValue: string | null;
  onCopy: (value: string, label: string) => void;
}

function ActionRow({ actions, copiedValue, onCopy }: ActionRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      {actions.map((act, idx) => {
        if (act.type === "link") {
          return (
            <a
              key={idx}
              href={act.value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[34px]"
            >
              <span>{act.label}</span>
              <span className="text-2xs text-[var(--text-muted)]">
                (opens in a new tab)
              </span>
              <ExternalLinkIcon className="w-3.5 h-3.5 opacity-70" />
            </a>
          );
        }

        const isCopied = copiedValue === act.value;

        return (
          <div
            key={idx}
            className="inline-flex items-center gap-2 rounded-xs border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--text)] min-h-[34px]"
          >
            <span className="text-[var(--text-muted)] text-2xs font-medium">
              {act.label}:
            </span>
            <span className="font-mono text-[var(--text)] font-semibold select-all">
              {act.value}
            </span>
            <button
              type="button"
              onClick={() => onCopy(act.value, act.label)}
              className="inline-flex items-center gap-1 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-2xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[26px]"
              aria-label={`Copy ${act.label} ${act.value}`}
            >
              {isCopied ? (
                <>
                  <CheckIcon className="w-3 h-3 text-[var(--primary-ledger)]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
