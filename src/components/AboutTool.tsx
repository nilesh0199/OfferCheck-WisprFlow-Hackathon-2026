import React from "react";
import { CheckIcon, XIcon, ChevronDownIcon } from "./Icons";

export function AboutTool() {
  return (
    <details
      id="about-this-tool"
      className="group rounded border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs transition-colors"
    >
      <summary className="cursor-pointer font-bold text-xs sm:text-sm text-[var(--text)] flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[36px] list-none select-none [&::-webkit-details-marker]:hidden">
        <span>About this tool</span>
        <ChevronDownIcon className="w-4 h-4 text-[var(--text-muted)] transition-transform duration-150 group-open:rotate-180" />
      </summary>

      <div className="mt-3 pt-3 border-t border-[var(--border)] grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 space-y-1.5">
          <h4 className="text-xs font-semibold text-[var(--text)] flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-full bg-[var(--surface)] p-1 text-[var(--color-primary)] border border-[var(--border)]"
            >
              <CheckIcon className="w-3 h-3" size={12} />
            </span>
            <span>What this tool does</span>
          </h4>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            Helps students and first-time job seekers review internship or job
            offers by highlighting questionable requests (such as training fees
            or equipment deposits), spotting missing or ambiguous terms, and
            drafting concrete verification questions before you pay money or
            share sensitive documents.
          </p>
        </div>

        <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 space-y-1.5">
          <h4 className="text-xs font-semibold text-[var(--text)] flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-full bg-[var(--surface)] p-1 text-[var(--text-muted)] border border-[var(--border)]"
            >
              <XIcon className="w-3 h-3" size={12} />
            </span>
            <span>What this tool does not do</span>
          </h4>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            This is <strong>not</strong> a scam detector, company authentication
            service, legal review, or safety guarantee. It cannot verify whether
            a sender actually represents an organisation or whether an opportunity
            is risk-free.
          </p>
        </div>
      </div>
    </details>
  );
}
