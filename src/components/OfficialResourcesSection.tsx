import React, { useState } from "react";
import { ConcernCategory } from "@/lib/analysis/schema";
import { selectResources, SelectedResource } from "@/lib/analysis/resources";
import {
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
} from "./Icons";

interface OfficialResourcesSectionProps {
  categories: readonly ConcernCategory[];
  sourceText: string;
}

export function OfficialResourcesSection({
  categories,
  sourceText,
}: OfficialResourcesSectionProps) {
  const selected = selectResources(categories, sourceText);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setLiveAnnouncement(`${label} copied to clipboard`);
      setTimeout(() => {
        setCopiedValue(null);
        setLiveAnnouncement("");
      }, 2000);
    } catch {
      prompt(`Copy ${label}:`, value);
    }
  };

  return (
    <section
      id="section-resources"
      aria-labelledby="resources-heading"
      className="space-y-4"
    >
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      <div>
        <h3
          id="resources-heading"
          className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
        >
          <span>Next steps and official resources</span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {selected.length} {selected.length === 1 ? "resource" : "resources"}
          </span>
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          These are links to official sites. OfferCheck does not check or vouch for any sender.
        </p>
      </div>

      <div className="space-y-4">
        {selected.map((item) => {
          if (item.resource.id === "cybercrime") {
            return (
              <CybercrimeCard
                key={item.resource.id}
                item={item}
                copiedValue={copiedValue}
                onCopy={handleCopy}
              />
            );
          }

          return (
            <StandardResourceCard
              key={item.resource.id}
              item={item}
              copiedValue={copiedValue}
              onCopy={handleCopy}
            />
          );
        })}
      </div>
    </section>
  );
}

interface CardProps {
  item: SelectedResource;
  copiedValue: string | null;
  onCopy: (value: string, label: string) => void;
}

function CybercrimeCard({ item, copiedValue, onCopy }: CardProps) {
  const [isOpen, setIsOpen] = useState(Boolean(item.expanded));

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
      className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors"
    >
      <summary className="cursor-pointer font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 rounded-md min-h-[44px] list-none select-none">
        <div className="flex items-center gap-2">
          <InfoIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" size={16} />
          <span>If you have already paid or shared documents</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>{isOpen ? "Hide" : "Show"}</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </summary>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {item.resource.summary}
        </p>

        <ActionRow
          actions={item.resource.actions}
          copiedValue={copiedValue}
          onCopy={onCopy}
        />

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-2xs text-slate-400 dark:text-slate-500">
          <span className="break-all">Official portal: {item.resource.sourceUrl}</span>
          <span>Last checked 20 Oct 2026</span>
        </div>
      </div>
    </details>
  );
}

function StandardResourceCard({ item, copiedValue, onCopy }: CardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3 transition-colors">
      <div className="space-y-0.5">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {item.resource.title}
        </h4>
        {item.matchedTerm && (
          <p className="text-2xs text-slate-500 dark:text-slate-400">
            Shown because your text mentions &quot;{item.matchedTerm}&quot;.
          </p>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {item.resource.summary}
      </p>

      <ActionRow
        actions={item.resource.actions}
        copiedValue={copiedValue}
        onCopy={onCopy}
      />

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-2xs text-slate-400 dark:text-slate-500">
        <span className="break-all">Official portal: {item.resource.sourceUrl}</span>
        <span>Last checked 20 Oct 2026</span>
      </div>
    </div>
  );
}

interface ActionRowProps {
  actions: SelectedResource["resource"]["actions"];
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
