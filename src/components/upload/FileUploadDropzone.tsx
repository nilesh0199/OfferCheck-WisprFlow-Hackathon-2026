"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_TOTAL_BYTES,
  ALLOWED_UPLOAD_TYPES,
} from "@/lib/config";

interface FileUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  currentCount: number;
  disabled?: boolean;
}

export function FileUploadDropzone({
  onFilesSelected,
  currentCount,
  disabled = false,
}: FileUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const remainingSlots = Math.max(0, MAX_UPLOAD_FILES - currentCount);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      setDropError(null);
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;

      if (remainingSlots <= 0) {
        setDropError(`You have already selected the maximum of ${MAX_UPLOAD_FILES} files.`);
        return;
      }

      if (incoming.length > remainingSlots) {
        setDropError(
          `You can only add ${remainingSlots} more file${
            remainingSlots === 1 ? "" : "s"
          } (maximum ${MAX_UPLOAD_FILES}).`
        );
      }

      const filesToAdd = incoming.slice(0, remainingSlots);

      // Validate allowed extensions and declared MIME types
      const invalidFiles = filesToAdd.filter((f) => {
        const type = f.type.toLowerCase();
        const name = f.name.toLowerCase();
        const hasValidExt =
          name.endsWith(".png") ||
          name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".webp") ||
          name.endsWith(".pdf");
        const hasValidMime = (ALLOWED_UPLOAD_TYPES as readonly string[]).includes(type);
        return !hasValidExt && !hasValidMime;
      });

      if (invalidFiles.length > 0) {
        setDropError(
          `Only PNG, JPEG, WebP images and PDF documents are supported. Invalid: ${invalidFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }

      // Check total size
      const totalBytes = filesToAdd.reduce((acc, f) => acc + f.size, 0);
      if (totalBytes > MAX_UPLOAD_TOTAL_BYTES) {
        setDropError("Selected files exceed the 4 MB total upload limit.");
        return;
      }

      onFilesSelected(filesToAdd);
    },
    [onFilesSelected, remainingSlots]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && remainingSlots > 0) {
        setIsDragOver(true);
      }
    },
    [disabled, remainingSlots]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled || remainingSlots <= 0) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, remainingSlots, processFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so the same file can be selected again if removed
      e.target.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && remainingSlots > 0) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || remainingSlots <= 0) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  // Clipboard paste listener: allows candidate to paste screenshots directly with Ctrl+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || remainingSlots <= 0) return;
      // Only capture if dropzone or child has focus or no active form element is focused
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl?.tagName === "TEXTAREA" || activeEl?.tagName === "INPUT";

      if (isInputFocused && activeEl !== dropzoneRef.current) {
        return;
      }

      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length > 0) {
          e.preventDefault();
          processFiles(imageFiles);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, remainingSlots, processFiles]);

  return (
    <div className="space-y-2">
      <div
        ref={dropzoneRef}
        role="button"
        tabIndex={disabled || remainingSlots <= 0 ? -1 : 0}
        aria-label="Upload offer screenshots or PDF files"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
          disabled || remainingSlots <= 0
            ? "border-[var(--border)] bg-[var(--surface-muted)] opacity-60 cursor-not-allowed"
            : isDragOver
            ? "border-[var(--primary-ledger)] bg-[var(--surface-muted)]"
            : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-muted)] hover:bg-[var(--surface)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={handleInputChange}
          disabled={disabled || remainingSlots <= 0}
          className="sr-only"
          tabIndex={-1}
        />

        {/* Upload Icon */}
        <div className="mb-3 rounded-full bg-[var(--surface)] p-2.5 shadow-xs border border-[var(--border)]">
          <svg
            className="w-6 h-6 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <p className="text-xs sm:text-sm font-medium text-[var(--text)]">
          {remainingSlots > 0 ? (
            <>
              <span className="underline underline-offset-2">Choose files</span> or drag and drop
            </>
          ) : (
            "Maximum 5 files reached"
          )}
        </p>

        <p className="mt-1 text-2xs sm:text-xs text-[var(--text-muted)] max-w-xs leading-normal">
          PNG, JPEG, WebP images or PDF documents up to 4 MB total.
        </p>

        <p className="mt-2 text-2xs text-[var(--text-muted)] opacity-80">
          Tip: You can also paste screenshots with Ctrl+V.
        </p>
      </div>

      {dropError && (
        <div
          role="alert"
          className="rounded-lg border border-[var(--border)] bg-[var(--tint-attention-bg)] p-2.5 text-xs text-[var(--tint-attention-text)]"
        >
          {dropError}
        </div>
      )}
    </div>
  );
}
