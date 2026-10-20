import { describe, it, expect } from "vitest";
import {
  INITIAL_SESSION_STATE,
  offerSessionReducer,
  OfferSessionState,
} from "@/lib/session-reducer";
import { ValidatedAnalysis } from "@/lib/analysis/schema";

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

describe("Session Reducer (In-Memory Tab State)", () => {
  it("initializes with empty, idle state", () => {
    expect(INITIAL_SESSION_STATE).toEqual({
      offerText: "",
      analyzedSnapshotText: "",
      analysis: null,
      status: "idle",
      errorState: null,
      elapsedSeconds: 0,
      activeTab: "paste",
      selectedFiles: [],
      transcribeStatus: "idle",
      transcribeError: null,
      transcribeWarnings: [],
      transcribeElapsedSeconds: 0,
      transcriptBannerDismissed: false,
    });
  });

  it("updates offerText on SET_OFFER_TEXT", () => {
    const updated = offerSessionReducer(INITIAL_SESSION_STATE, {
      type: "SET_OFFER_TEXT",
      payload: "Dear Candidate, congratulations...",
    });

    expect(updated.offerText).toBe("Dear Candidate, congratulations...");
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
      payload: { type: "RATE_LIMITED", message: "Too many requests" },
    });

    expect(nextState.status).toBe("error");
    expect(nextState.errorState).toEqual({
      type: "RATE_LIMITED",
      message: "Too many requests",
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

  it("handles tab switching and file selection actions", () => {
    let state = offerSessionReducer(INITIAL_SESSION_STATE, {
      type: "SET_ACTIVE_TAB",
      payload: "upload",
    });
    expect(state.activeTab).toBe("upload");

    const dummyFile = new File(["dummy"], "offer.png", { type: "image/png" });
    const items = [
      { id: "1", file: dummyFile },
      { id: "2", file: dummyFile },
    ];
    state = offerSessionReducer(state, {
      type: "ADD_SELECTED_FILES",
      payload: items,
    });
    expect(state.selectedFiles.length).toBe(2);

    state = offerSessionReducer(state, {
      type: "REMOVE_SELECTED_FILE",
      payload: "1",
    });
    expect(state.selectedFiles.length).toBe(1);
    expect(state.selectedFiles[0].id).toBe("2");
  });

  it("handles transcribe lifecycle (start -> success -> switch tab)", () => {
    let state = offerSessionReducer(INITIAL_SESSION_STATE, {
      type: "START_TRANSCRIBE",
    });
    expect(state.transcribeStatus).toBe("loading");
    expect(state.transcribeElapsedSeconds).toBe(0);

    state = offerSessionReducer(state, {
      type: "TICK_TRANSCRIBE_ELAPSED",
      payload: 4,
    });
    expect(state.transcribeElapsedSeconds).toBe(4);

    state = offerSessionReducer(state, {
      type: "TRANSCRIBE_SUCCESS",
      payload: {
        transcript: "Extracted offer details",
        warnings: ["File 1 was clear"],
      },
    });
    expect(state.transcribeStatus).toBe("success");
    expect(state.offerText).toBe("Extracted offer details");
    expect(state.activeTab).toBe("paste");
    expect(state.transcriptBannerDismissed).toBe(false);

    state = offerSessionReducer(state, {
      type: "DISMISS_TRANSCRIPT_BANNER",
    });
    expect(state.transcriptBannerDismissed).toBe(true);
  });
});
