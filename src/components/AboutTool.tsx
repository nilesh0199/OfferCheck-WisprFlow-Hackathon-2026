import React from "react";

export function AboutTool() {
  return (
    <details className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
      <summary className="cursor-pointer font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-zinc-900 rounded-md min-h-[44px]">
        <span>About this tool</span>
        <span className="text-xs text-zinc-500 transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>

      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span aria-hidden="true" className="text-zinc-600 dark:text-zinc-400 font-bold">
              ✓
            </span>
            <span>What this tool does</span>
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Helps students review internship offers by highlighting questionable
            requests (such as training fees or equipment deposits), spotting
            missing or ambiguous terms, and drafting concrete verification
            questions before you pay money or share sensitive documents.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span aria-hidden="true" className="text-zinc-600 dark:text-zinc-400 font-bold">
              ✕
            </span>
            <span>What this tool does NOT do</span>
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This is <strong>not</strong> a scam detector, company authentication
            service, legal review, or safety guarantee. It cannot verify whether
            a sender legitimately represents a company or whether an opportunity
            is risk-free.
          </p>
        </div>
      </div>
    </details>
  );
}
