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
    <div className="space-y-2.5 w-full">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
        <label
          htmlFor="sample-select"
          className="text-xs font-medium text-[var(--text-muted)] shrink-0"
        >
          Try a sample:
        </label>
        <div className="flex items-center gap-1.5 flex-1 min-w-0 w-full sm:w-auto">
          <select
            id="sample-select"
            value={selectedExampleId}
            onChange={(e) => {
              setSelectedExampleId(e.target.value);
              setConfirmPending(false);
            }}
            disabled={disabled}
            className="flex-1 min-w-0 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text)] truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
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
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-50 min-h-[36px] shrink-0"
          >
            Load
          </button>
        </div>
      </div>

      {/* Synthetic offer badge */}
      {isSyntheticBadgeVisible && (
        <div className="flex justify-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-2xs font-medium text-[var(--text-muted)] border border-[var(--border)]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] opacity-60"
              aria-hidden="true"
            />
            Synthetic example, not a real offer
          </span>
        </div>
      )}

      {/* Inline confirmation when custom text exists */}
      {confirmPending && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text)]"
        >
          <span className="font-medium">Replace your text?</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleConfirmReplace}
              className="rounded bg-[var(--accent)] text-[var(--accent-contrast)] px-2.5 py-1 text-2xs font-semibold hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[32px]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleCancelReplace}
              className="rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-2.5 py-1 text-2xs font-medium hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[32px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
