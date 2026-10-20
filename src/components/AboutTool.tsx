import React from "react";
import { CheckIcon, XIcon, ChevronDownIcon } from "./Icons";

export function AboutTool() {
  return (
    <details
      id="about-this-tool"
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors"
    >
      <summary className="cursor-pointer font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 rounded-md min-h-[44px] list-none select-none">
        <span>About this tool</span>
        <ChevronDownIcon className="w-4 h-4 text-slate-500 transition-transform duration-150 group-open:rotate-180" />
      </summary>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-full bg-slate-200/70 p-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <CheckIcon className="w-3 h-3" size={12} />
            </span>
            <span>What this tool does</span>
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Helps students review internship offers by highlighting questionable
            requests (such as training fees or equipment deposits), spotting
            missing or ambiguous terms, and drafting concrete verification
            questions before you pay money or share sensitive documents.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-full bg-slate-200/70 p-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <XIcon className="w-3 h-3" size={12} />
            </span>
            <span>What this tool does not do</span>
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
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
