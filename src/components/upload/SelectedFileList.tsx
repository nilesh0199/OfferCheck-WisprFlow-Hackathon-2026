"use client";

import React from "react";
import { SelectedFileItem } from "@/lib/session-reducer";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_TOTAL_BYTES } from "@/lib/config";

interface SelectedFileListProps {
  files: readonly SelectedFileItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SelectedFileList({
  files,
  onRemove,
  onClearAll,
  disabled = false,
}: SelectedFileListProps) {
  if (files.length === 0) return null;

  const totalBytes = files.reduce((acc, item) => acc + item.file.size, 0);

  return (
    <div className="space-y-3">
      {/* File Items */}
      <ul className="space-y-2" aria-label="Selected upload files">
        {files.map((item, index) => {
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Thumbnail or Document Icon */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--border)] bg-[var(--surface-muted)]">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-5 w-5 text-[var(--text-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[var(--text)]">
                    {item.file.name}
                  </p>
                  <p className="text-2xs text-[var(--text-muted)]">
                    File {index + 1} of {files.length} • {formatBytes(item.file.size)}
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={disabled}
                aria-label={`Remove file ${item.file.name}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-30 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Header and counter summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
        <span>
          {files.length} of {MAX_UPLOAD_FILES} files ({formatBytes(totalBytes)} / {formatBytes(MAX_UPLOAD_TOTAL_BYTES)})
        </span>
        <button
          type="button"
          onClick={onClearAll}
          disabled={disabled}
          className="text-2xs underline underline-offset-2 hover:text-[var(--text)] disabled:opacity-40"
        >
          Remove all files
        </button>
      </div>
    </div>
  );
}
