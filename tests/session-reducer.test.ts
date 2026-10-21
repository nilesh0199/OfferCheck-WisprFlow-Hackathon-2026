import { describe, it, expect } from "vitest";
import {
  INITIAL_SESSION_STATE,
  offerSessionReducer,
  OfferSessionState,
} from "@/lib/session-reducer";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { appendTranscript } from "@/lib/upload/transcribe";

const mockAnalysis: ValidatedAnalysis = {
  overallNote: "One observation requiring verification.",
  concerns: [
    {
      id: "concern-1",
      category: "upfront_payment",
      observation: "Upfront fee requested.",
      interpretation: "Legitimate internships do not ask for upfront fees.",
      quote: "refundable deposit of ₹4,500",
      span: { start: 10, end: 37 },
    },
  ],
  missingInfo: [],
  verificationQuestions: [
    {
      id: "vq-1",
      question: "Will equipment be provided?",
    },
  ],
  droppedCount: 0,
  limits: ["Analysis is based solely on the text provided."],
};

describe("Session Reducer (In-Memory Combined Input & Undo State)", () => {
  it("initializes with empty, idle state and null undo", () => {
    expect(INITIAL_SESSION_STATE).toEqual({
      offerText: "",
      undoOfferText: null,
      addedFileCount: 0,
      analyzedSnapshotText: "",
      analysis: null,
      status: "idle",
      errorState: null,
      elapsedSeconds: 0,
      selectedFiles: [],
      transcribeStatus: "idle",
      transcribeError: null,
      transcribeErrorCode: null,
      transcribeWarnings: [],
      transcribeElapsedSeconds: 0,
      transcriptBannerDismissed: false,
    });
  });

  it("updates offerText on SET_OFFER_TEXT and clears undoOfferText", () => {
    const stateWithUndo: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      offerText: "Initial appended text",
      undoOfferText: "Original text before append",
    };

    const updated = offerSessionReducer(stateWithUndo, {
      type: "SET_OFFER_TEXT",
      payload: "User edited this text manually",
    });

    expect(updated.offerText).toBe("User edited this text manually");
    expect(updated.undoOfferText).toBeNull(); // Discarded on manual edit
    expect(updated.status).toBe("idle");
  });

  it("handles START_ANALYSIS by setting loading and resetting timers/errors", () => {
    const stateWithOldError: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      offerText: "Some text",
      errorState: { type: "TOO_SHORT" },
      elapsedSeconds: 15,
    };

    const nextState = offerSessionReducer(stateWithOldError, {
      type: "START_ANALYSIS",
      payload: { snapshotText: "Some text" },
    });

    expect(nextState.status).toBe("loading");
    expect(nextState.errorState).toBeNull();
    expect(nextState.elapsedSeconds).toBe(0);
  });

  it("updates elapsed seconds via TICK_ELAPSED", () => {
    const loadingState: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      status: "loading",
      elapsedSeconds: 0,
    };

    const nextState = offerSessionReducer(loadingState, {
      type: "TICK_ELAPSED",
      payload: 7,
    });

    expect(nextState.elapsedSeconds).toBe(7);
  });

  it("transitions to success and records analysis result on ANALYSIS_SUCCESS", () => {
    const loadingState: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      offerText: "Offer text being reviewed",
      status: "loading",
      elapsedSeconds: 12,
    };

    const nextState = offerSessionReducer(loadingState, {
      type: "ANALYSIS_SUCCESS",
      payload: {
        analysis: mockAnalysis,
        snapshotText: "Offer text being reviewed",
      },
    });

    expect(nextState.status).toBe("success");
    expect(nextState.analysis).toEqual(mockAnalysis);
    expect(nextState.analyzedSnapshotText).toBe("Offer text being reviewed");
    expect(nextState.errorState).toBeNull();
  });

  it("transitions to error on ANALYSIS_ERROR", () => {
    const loadingState: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      status: "loading",
    };

    const nextState = offerSessionReducer(loadingState, {
      type: "ANALYSIS_ERROR",
      payload: { type: "RATE_LIMITED", message: "Too many requests", code: "RATE_LIMITED" },
    });

    expect(nextState.status).toBe("error");
    expect(nextState.errorState).toEqual({
      type: "RATE_LIMITED",
      message: "Too many requests",
      code: "RATE_LIMITED",
    });
  });

  it("handles CANCEL_ANALYSIS with CANCELLED error type", () => {
    const loadingState: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      status: "loading",
    };

    const nextState = offerSessionReducer(loadingState, {
      type: "CANCEL_ANALYSIS",
    });

    expect(nextState.status).toBe("error");
    expect(nextState.errorState?.type).toBe("CANCELLED");
  });

  it("resets to initial state on CLEAR_SESSION", () => {
    const stateWithData: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      offerText: "Some text",
      analyzedSnapshotText: "Some text",
      analysis: mockAnalysis,
      status: "success",
      errorState: null,
      elapsedSeconds: 5,
    };

    const nextState = offerSessionReducer(stateWithData, {
      type: "CLEAR_SESSION",
    });

    expect(nextState).toEqual(INITIAL_SESSION_STATE);
  });

  it("handles TRANSCRIBE_SUCCESS: appends to empty text, clears files, sets undo", () => {
    const dummyFile = new File(["dummy"], "offer.png", { type: "image/png" });
    const initialState: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      offerText: "",
      selectedFiles: [{ id: "1", file: dummyFile }],
      transcribeStatus: "loading",
    };

    const state = offerSessionReducer(initialState, {
      type: "TRANSCRIBE_SUCCESS",
      payload: {
        transcript: "Dear Candidate, Welcome to Acme Corp.",
        warnings: [],
        fileCount: 1,
      },
    });

    expect(state.offerText).toBe("Dear Candidate, Welcome to Acme Corp.");
    expect(state.undoOfferText).toBe("");
    expect(state.addedFileCount).toBe(1);
    expect(state.selectedFiles).toEqual([]); // Files cleared after success
    expect(state.transcribeStatus).toBe("success");
    expect(state.transcriptBannerDismissed).toBe(false);
  });

  it("handles TRANSCRIBE_SUCCESS: appends to existing text with exactly one blank line separator", () => {
    const existing = "Pasted header notes from email.";
    const dummyFile = new File(["dummy"], "page2.pdf", { type: "application/pdf" });
    const initialState: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      offerText: existing,
      selectedFiles: [{ id: "2", file: dummyFile }],
      transcribeStatus: "loading",
    };

    const state = offerSessionReducer(initialState, {
      type: "TRANSCRIBE_SUCCESS",
      payload: {
        transcript: "Compensation: 30,000 INR per month.",
        warnings: [],
        fileCount: 1,
      },
    });

    expect(state.offerText).toBe(
      "Pasted header notes from email.\n\nCompensation: 30,000 INR per month."
    );
    expect(state.undoOfferText).toBe(existing); // Exact prior text
    expect(state.selectedFiles).toHaveLength(0); // Files cleared after success
  });

  it("preserves multi-file markers inside appended block and never reorders text", () => {
    const existing = "My pasted preliminary text.";
    const multiFileTranscript =
      "[File 1 of 2]\nPage one content.\n\n[File 2 of 2]\nPage two content.";

    const state = offerSessionReducer(
      {
        ...INITIAL_SESSION_STATE,
        offerText: existing,
        selectedFiles: [
          { id: "1", file: new File([], "f1.png") },
          { id: "2", file: new File([], "f2.png") },
        ],
      },
      {
        type: "TRANSCRIBE_SUCCESS",
        payload: {
          transcript: multiFileTranscript,
          warnings: [],
          fileCount: 2,
        },
      }
    );

    expect(state.offerText).toBe(
      `My pasted preliminary text.\n\n[File 1 of 2]\nPage one content.\n\n[File 2 of 2]\nPage two content.`
    );
    expect(state.offerText.startsWith("My pasted preliminary text.")).toBe(true);
    expect(state.addedFileCount).toBe(2);
  });

  it("handles UNDO_APPEND_TRANSCRIPT: restores exactly previous text and dismisses banner", () => {
    const previous = "Original text before transcription.";
    const stateWithUndo: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      offerText: "Original text before transcription.\n\nAppended file content.",
      undoOfferText: previous,
      addedFileCount: 1,
      transcriptBannerDismissed: false,
    };

    const restored = offerSessionReducer(stateWithUndo, {
      type: "UNDO_APPEND_TRANSCRIPT",
    });

    expect(restored.offerText).toBe(previous);
    expect(restored.undoOfferText).toBeNull();
    expect(restored.addedFileCount).toBe(0);
    expect(restored.transcriptBannerDismissed).toBe(true);
  });

  it("handles limit-exceeded append: appends text even when total exceeds MAX_INPUT_CHARS", () => {
    const hugeText = "A".repeat(7990);
    const addedText = "B".repeat(500); // Total will be 8492 (> 8000)

    const state = offerSessionReducer(
      {
        ...INITIAL_SESSION_STATE,
        offerText: hugeText,
      },
      {
        type: "TRANSCRIBE_SUCCESS",
        payload: {
          transcript: addedText,
          warnings: ["Review limit exceeded"],
          fileCount: 1,
        },
      }
    );

    expect(state.offerText.length).toBe(7990 + 2 + 500);
    expect(state.offerText.endsWith(addedText)).toBe(true);
  });

  it("keeps files on TRANSCRIBE_ERROR and records error and errorCode", () => {
    const dummyFile = new File(["dummy"], "offer.png", { type: "image/png" });
    const initialState: OfferSessionState = {
      ...INITIAL_SESSION_STATE,
      selectedFiles: [{ id: "1", file: dummyFile }],
      transcribeStatus: "loading",
    };

    const state = offerSessionReducer(initialState, {
      type: "TRANSCRIBE_ERROR",
      payload: { message: "The service is busy.", code: "BUSY" },
    });

    expect(state.transcribeStatus).toBe("error");
    expect(state.transcribeError).toBe("The service is busy.");
    expect(state.transcribeErrorCode).toBe("BUSY");
    expect(state.selectedFiles).toHaveLength(1); // Files KEPT after failure
  });
});

describe("appendTranscript pure function", () => {
  it("returns transcript when existingText is empty or whitespace", () => {
    expect(appendTranscript("", "New transcript")).toBe("New transcript");
    expect(appendTranscript("   ", "New transcript")).toBe("New transcript");
  });

  it("returns existingText unchanged when transcript is empty or whitespace", () => {
    expect(appendTranscript("Existing text", "")).toBe("Existing text");
    expect(appendTranscript("Existing text", "   ")).toBe("Existing text");
  });

  it("inserts exactly one blank line (\\n\\n) between existing and appended text", () => {
    expect(appendTranscript("Hello", "World")).toBe("Hello\n\nWorld");
    expect(appendTranscript("Hello\n", "World")).toBe("Hello\n\nWorld");
    expect(appendTranscript("Hello\n\n\n", "World")).toBe("Hello\n\nWorld");
  });
});
