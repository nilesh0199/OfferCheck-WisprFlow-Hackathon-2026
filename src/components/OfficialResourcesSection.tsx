"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ConcernCategory } from "@/lib/analysis/schema";
import { selectResources } from "@/lib/analysis/resources";
import { ResourceCard } from "./ResourceCard";

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
          className="text-base sm:text-lg font-semibold text-[var(--text)] flex items-center gap-2"
        >
          <span>Next steps and official resources</span>
          <span className="inline-flex items-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium">
            {selected.length} {selected.length === 1 ? "resource" : "resources"}
          </span>
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          These are links to official sites. OfferCheck does not check or vouch for any sender.
        </p>
      </div>

      <div className="space-y-4">
        {selected.map((item) => (
          <ResourceCard
            key={item.resource.id}
            resource={item.resource}
            matchedTerm={item.matchedTerm}
            isCollapsible={item.resource.id === "cybercrime"}
            defaultExpanded={Boolean(item.expanded)}
            copiedValue={copiedValue}
            onCopy={handleCopy}
          />
        ))}
      </div>

      <div className="pt-2">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
        >
          <span>View all official resources &amp; reporting guides</span>
        </Link>
      </div>
    </section>
  );
}
