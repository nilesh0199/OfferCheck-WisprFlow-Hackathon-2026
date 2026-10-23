import { describe, it, expect } from "vitest";
import {
  INITIAL_SESSION_STATE,
  offerSessionReducer,
  OfferSessionState,
  WizardStep,
} from "@/lib/session-reducer";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { appendTranscript } from "@/lib/upload/transcribe";
import { TranscribedItem } from "@/lib/upload/markers";

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
      currentStep: 1,
      visitedSteps: { 1: true, 2: false, 3: false, 4: false, 5: false },
      skippedSteps: { 1: false, 2: false, 3: false, 4: false, 5: false },
      offerText: "",
      undoOfferText: null,
      addedFileCount: 0,
      selectedFiles: [],
      source: {
        channel: null,
        applied: null,
        note: "",
      },
      conversation: {
        text: "",
      },
      payment: {
        asked: null,
        purposes: [],
        amount: "",
        deadline: "",
        docsAsked: [],
        docsShared: [],
        note: "",
      },
      analyzedSnapshotText: "",
      analysis: null,
      status: "idle",
      errorState: null,
      elapsedSeconds: 0,
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
        items: [
          {
            kind: "Screenshot",
            transcript: "Dear Candidate, Welcome to Acme Corp.",
            readable: true,
          },
        ],
        warnings: [],
        fileCount: 1,
      },
    });

    expect(state.offerText).toBe(
      "---- Text from Screenshot 1 ----\nDear Candidate, Welcome to Acme Corp."
    );
    expect(state.undoOfferText).toBe("");
    expect(state.addedFileCount).toBe(1);
    expect(state.selectedFiles).toEqual([]); // Files cleared after success
    expect(state.transcribeStatus).toBe("success");
    expect(state.transcriptBannerDismissed).toBe(false);
  });

  it("handles TRANSCRIBE_SUCCESS: appends to existing text with exactly one blank line separator and generic marker", () => {
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
        items: [
          { kind: "PDF", transcript: "Compensation: 30,000 INR per month.", readable: true },
        ],
        warnings: [],
        fileCount: 1,
      },
    });

    expect(state.offerText).toBe(
      "Pasted header notes from email.\n\n---- Text from PDF 1 ----\nCompensation: 30,000 INR per month."
    );
    expect(state.undoOfferText).toBe(existing); // Exact prior text
    expect(state.selectedFiles).toHaveLength(0); // Files cleared after success
  });

  it("preserves multi-file markers inside appended block and never reorders text", () => {
    const existing = "My pasted preliminary text.";
    const items: TranscribedItem[] = [
      { kind: "Screenshot", transcript: "Page one content.", readable: true },
      { kind: "PDF", transcript: "Page two content.", readable: true },
    ];

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
          items,
          warnings: [],
          fileCount: 2,
        },
      }
    );

    expect(state.offerText).toBe(
      `My pasted preliminary text.\n\n---- Text from Screenshot 1 ----\nPage one content.\n\n---- Text from PDF 1 ----\nPage two content.`
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
    const addedText = "B".repeat(500);

    const state = offerSessionReducer(
      {
        ...INITIAL_SESSION_STATE,
        offerText: hugeText,
      },
      {
        type: "TRANSCRIBE_SUCCESS",
        payload: {
          items: [{ kind: "Screenshot", transcript: addedText, readable: true }],
          warnings: ["Review limit exceeded"],
          fileCount: 1,
        },
      }
    );

    expect(state.offerText.length).toBeGreaterThan(8000);
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

  describe("Wizard step transitions and field caps", () => {
    it("handles SET_STEP and clamps within bounds (1-5), marking visited", () => {
      let state = offerSessionReducer(INITIAL_SESSION_STATE, {
        type: "SET_STEP",
        payload: 3,
      });
      expect(state.currentStep).toBe(3);
      expect(state.visitedSteps[3]).toBe(true);

      // Clamping over 5
      state = offerSessionReducer(state, {
        type: "SET_STEP",
        payload: 9 as unknown as WizardStep,
      });
      expect(state.currentStep).toBe(5);
      expect(state.visitedSteps[5]).toBe(true);

      // Clamping below 1
      state = offerSessionReducer(state, {
        type: "SET_STEP",
        payload: 0 as unknown as WizardStep,
      });
      expect(state.currentStep).toBe(1);
    });

    it("handles SET_STEP_VISITED and SET_STEP_SKIPPED", () => {
      let state = offerSessionReducer(INITIAL_SESSION_STATE, {
        type: "SET_STEP_VISITED",
        payload: { step: 2, visited: true },
      });
      expect(state.visitedSteps[2]).toBe(true);

      state = offerSessionReducer(state, {
        type: "SET_STEP_SKIPPED",
        payload: { step: 3, skipped: true },
      });
      expect(state.skippedSteps[3]).toBe(true);
    });

    it("handles Source step updates and caps source note at 200 characters", () => {
      let state = offerSessionReducer(INITIAL_SESSION_STATE, {
        type: "SET_SOURCE_CHANNEL",
        payload: "messaging",
      });
      expect(state.source.channel).toBe("messaging");

      state = offerSessionReducer(state, {
        type: "SET_SOURCE_APPLIED",
        payload: "no",
      });
      expect(state.source.applied).toBe("no");

      const longNote = "a".repeat(250);
      state = offerSessionReducer(state, {
        type: "SET_SOURCE_NOTE",
        payload: longNote,
      });
      expect(state.source.note).toHaveLength(200);
      expect(state.source.note).toBe("a".repeat(200));
    });

    it("handles Conversation step updates and caps conversation text at 4000 characters", () => {
      const longConv = "c".repeat(4500);
      const state = offerSessionReducer(INITIAL_SESSION_STATE, {
        type: "SET_CONVERSATION_TEXT",
        payload: longConv,
      });
      expect(state.conversation.text).toHaveLength(4000);
      expect(state.conversation.text).toBe("c".repeat(4000));
    });

    it("handles Money and documents step updates and field caps", () => {
      let state = offerSessionReducer(INITIAL_SESSION_STATE, {
        type: "SET_PAYMENT_ASKED",
        payload: "yes_unpaid",
      });
      expect(state.payment.asked).toBe("yes_unpaid");

      state = offerSessionReducer(state, {
        type: "SET_PAYMENT_PURPOSES",
        payload: ["registration", "training"],
      });
      expect(state.payment.purposes).toEqual(["registration", "training"]);

      state = offerSessionReducer(state, {
        type: "TOGGLE_PAYMENT_PURPOSE",
        payload: "equipment",
      });
      expect(state.payment.purposes).toContain("equipment");

      state = offerSessionReducer(state, {
        type: "TOGGLE_PAYMENT_PURPOSE",
        payload: "registration",
      });
      expect(state.payment.purposes).not.toContain("registration");

      // Amount cap (40)
      state = offerSessionReducer(state, {
        type: "SET_PAYMENT_AMOUNT",
        payload: "Rs 5,000 via UPI ".repeat(5), // > 40 chars
      });
      expect(state.payment.amount.length).toBeLessThanOrEqual(40);

      // Deadline cap (100)
      state = offerSessionReducer(state, {
        type: "SET_PAYMENT_DEADLINE",
        payload: "Within 24 hours of receiving this message ".repeat(5), // > 100 chars
      });
      expect(state.payment.deadline.length).toBeLessThanOrEqual(100);

      // Payment note cap (200)
      state = offerSessionReducer(state, {
        type: "SET_PAYMENT_NOTE",
        payload: "x".repeat(250),
      });
      expect(state.payment.note).toHaveLength(200);

      // Documents asked and toggle
      state = offerSessionReducer(state, {
        type: "SET_DOCS_ASKED",
        payload: ["identity", "bank"],
      });
      expect(state.payment.docsAsked).toEqual(["identity", "bank"]);

      // Toggling "none" clears other options
      state = offerSessionReducer(state, {
        type: "TOGGLE_DOCS_ASKED",
        payload: "none",
      });
      expect(state.payment.docsAsked).toEqual(["none"]);

      // Toggling another option clears "none"
      state = offerSessionReducer(state, {
        type: "TOGGLE_DOCS_ASKED",
        payload: "photo",
      });
      expect(state.payment.docsAsked).toEqual(["photo"]);

      // Documents shared
      state = offerSessionReducer(state, {
        type: "SET_DOCS_SHARED",
        payload: ["identity"],
      });
      expect(state.payment.docsShared).toEqual(["identity"]);

      state = offerSessionReducer(state, {
        type: "TOGGLE_DOCS_SHARED",
        payload: "bank",
      });
      expect(state.payment.docsShared).toEqual(["identity", "bank"]);
    });

    it("handles LOAD_WIZARD_SAMPLE and sets wizard fields, navigating to step 5", () => {
      const state = offerSessionReducer(INITIAL_SESSION_STATE, {
        type: "LOAD_WIZARD_SAMPLE",
        payload: {
          offerText: "Offer text from sample",
          source: { channel: "email", applied: "yes", note: "Sample note" },
          conversation: { text: "Spoke on phone" },
          payment: { asked: "yes_unpaid", amount: "Rs 2,000", purposes: ["registration"] },
          step: 5,
        },
      });

      expect(state.currentStep).toBe(5);
      expect(state.visitedSteps[5]).toBe(true);
      expect(state.offerText).toBe("Offer text from sample");
      expect(state.source.channel).toBe("email");
      expect(state.source.applied).toBe("yes");
      expect(state.conversation.text).toBe("Spoke on phone");
      expect(state.payment.asked).toBe("yes_unpaid");
      expect(state.payment.amount).toBe("Rs 2,000");
    });

    it("handles CLEAR_ALL and resets entire wizard state and analysis to initial", () => {
      const modifiedState = offerSessionReducer(INITIAL_SESSION_STATE, {
        type: "LOAD_WIZARD_SAMPLE",
        payload: {
          offerText: "Some text",
          source: { channel: "call", applied: "no", note: "Called me" },
          conversation: { text: "Described call" },
          payment: { asked: "yes_paid", amount: "Rs 3,000" },
        },
      });

      const cleared = offerSessionReducer(modifiedState, { type: "CLEAR_ALL" });
      expect(cleared.offerText).toBe("");
      expect(cleared.currentStep).toBe(1);
      expect(cleared.source.channel).toBeNull();
      expect(cleared.conversation.text).toBe("");
      expect(cleared.payment.asked).toBeNull();
      expect(cleared.analysis).toBeNull();
    });
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
