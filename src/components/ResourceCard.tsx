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
        className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors"
      >
        <summary className="cursor-pointer font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 rounded-md min-h-[44px] list-none select-none">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" size={16} />
            <span>{resource.title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{internalOpen ? "Hide" : "Show"}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-150 ${
                internalOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </summary>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {resource.summary}
          </p>

          <ActionRow
            actions={resource.actions}
            copiedValue={copiedValue}
            onCopy={handleCopy}
          />

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-2xs text-slate-400 dark:text-slate-500">
            <span className="break-all">Official portal: {resource.sourceUrl}</span>
            <span>Last checked 20 Oct 2026</span>
          </div>
        </div>
      </details>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3 transition-colors">
      <div className="space-y-0.5">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
          {resource.title}
        </h3>
        {matchedTerm && (
          <p className="text-2xs text-slate-500 dark:text-slate-400">
            Shown because your text mentions &quot;{matchedTerm}&quot;.
          </p>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {resource.summary}
      </p>

      <ActionRow
        actions={resource.actions}
        copiedValue={copiedValue}
        onCopy={handleCopy}
      />

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-2xs text-slate-400 dark:text-slate-500">
        <span className="break-all">Official portal: {resource.sourceUrl}</span>
        <span>Last checked 20 Oct 2026</span>
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
    <div className="flex flex-wrap items-center gap-2.5 pt-1">
      {actions.map((act, idx) => {
        if (act.type === "link") {
          return (
            <a
              key={idx}
              href={act.value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 min-h-[44px]"
            >
              <span>{act.label}</span>
              <span className="text-2xs text-slate-400 dark:text-slate-500">
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
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 min-h-[44px]"
          >
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {act.label}:
            </span>
            <span className="font-mono text-slate-900 dark:text-slate-100 select-all font-semibold">
              {act.value}
            </span>
            <button
              type="button"
              onClick={() => onCopy(act.value, act.label)}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-2xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 min-h-[32px]"
              aria-label={`Copy ${act.label} ${act.value}`}
            >
              {isCopied ? (
                <>
                  <CheckIcon className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" />
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
