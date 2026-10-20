import React from "react";
import { APP_NAME, TAGLINE } from "@/lib/config";

export function Header() {
  return (
    <header className="mb-6 sm:mb-8 text-center sm:text-left">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 mb-3">
        <span>Solo Hackathon Prototype</span>
        <span aria-hidden="true">•</span>
        <span>Phase 4 Results UI</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {APP_NAME}
      </h1>
      <p className="mt-2 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
        {TAGLINE}
      </p>
    </header>
  );
}
