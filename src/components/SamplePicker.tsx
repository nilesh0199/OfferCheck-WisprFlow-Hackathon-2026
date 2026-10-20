import React, { useState } from "react";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";

interface SamplePickerProps {
  currentText: string;
  onSelectSample: (text: string) => void;
  disabled?: boolean;
}

export function SamplePicker({
  currentText,
  onSelectSample,
  disabled = false,
}: SamplePickerProps) {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    SYNTHETIC_EXAMPLES[0].id
  );
  const [confirmPending, setConfirmPending] = useState(false);

  // Check if current textarea content matches any of the synthetic examples
  const matchingExample = SYNTHETIC_EXAMPLES.find(
    (ex) => ex.text.trim() === currentText.trim()
  );
  const isSyntheticBadgeVisible = Boolean(matchingExample);

  const handleLoadClick = () => {
    const exampleToLoad = SYNTHETIC_EXAMPLES.find(
      (ex) => ex.id === selectedExampleId
    );
    if (!exampleToLoad) return;

    // If there's text already and it differs from the sample, require confirmation
    const hasCustomText =
      currentText.trim().length > 0 &&
      currentText.trim() !== exampleToLoad.text.trim();

    if (hasCustomText && !confirmPending) {
      setConfirmPending(true);
      return;
    }

    onSelectSample(exampleToLoad.text);
    setConfirmPending(false);
  };

  const handleConfirmReplace = () => {
    const exampleToLoad = SYNTHETIC_EXAMPLES.find(
      (ex) => ex.id === selectedExampleId
    );
    if (exampleToLoad) {
      onSelectSample(exampleToLoad.text);
    }
    setConfirmPending(false);
  };

  const handleCancelReplace = () => {
    setConfirmPending(false);
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-zinc-200 bg-zinc-100/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="sample-select"
            className="font-medium text-zinc-700 dark:text-zinc-300"
          >
            Load a sample offer:
          </label>
          <select
            id="sample-select"
            value={selectedExampleId}
            onChange={(e) => {
              setSelectedExampleId(e.target.value);
              setConfirmPending(false);
            }}
            disabled={disabled}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 shadow-2xs focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 min-h-[38px]"
          >
            {SYNTHETIC_EXAMPLES.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleLoadClick}
            disabled={disabled}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 min-h-[38px]"
          >
            Load example
          </button>
        </div>

        {/* Visible badge when current text matches a synthetic example */}
        {isSyntheticBadgeVisible && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/90 px-2.5 py-1 text-2xs sm:text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span
              className="h-1.5 w-1.5 rounded-full bg-zinc-500"
              aria-hidden="true"
            />
            Synthetic example, not a real offer
          </span>
        )}
      </div>

      {/* Inline confirmation when text already exists in textarea */}
      {confirmPending && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
        >
          <span className="font-medium">
            Replace your current text with this sample?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmReplace}
              className="rounded-md bg-zinc-800 px-2.5 py-1 text-2xs sm:text-xs font-semibold text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 min-h-[34px]"
            >
              Confirm replace
            </button>
            <button
              type="button"
              onClick={handleCancelReplace}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-2xs sm:text-xs font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 min-h-[34px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
