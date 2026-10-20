import { ValidatedAnalysis } from "./analysis/schema";
import { ErrorType } from "@/components/ErrorAlert";

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface SessionErrorState {
  type: ErrorType;
  message?: string;
}

export interface OfferSessionState {
  offerText: string;
  analyzedSnapshotText: string;
  analysis: ValidatedAnalysis | null;
  status: AnalysisStatus;
  errorState: SessionErrorState | null;
  elapsedSeconds: number;
}

export const INITIAL_SESSION_STATE: OfferSessionState = {
  offerText: "",
  analyzedSnapshotText: "",
  analysis: null,
  status: "idle",
  errorState: null,
  elapsedSeconds: 0,
};

export type OfferSessionAction =
  | { type: "SET_OFFER_TEXT"; payload: string }
  | { type: "START_ANALYSIS"; payload: { snapshotText: string } }
  | { type: "TICK_ELAPSED"; payload: number }
  | {
      type: "ANALYSIS_SUCCESS";
      payload: { analysis: ValidatedAnalysis; snapshotText: string };
    }
  | { type: "ANALYSIS_ERROR"; payload: SessionErrorState }
  | { type: "CANCEL_ANALYSIS" }
  | { type: "CLEAR_SESSION" };

/**
 * Pure reducer for managing offer analysis session state in memory.
 * No data is persisted across browser refreshes or stored in any client storage.
 */
export function offerSessionReducer(
  state: OfferSessionState,
  action: OfferSessionAction
): OfferSessionState {
  switch (action.type) {
    case "SET_OFFER_TEXT":
      return {
        ...state,
        offerText: action.payload,
      };

    case "START_ANALYSIS":
      return {
        ...state,
        status: "loading",
        errorState: null,
        elapsedSeconds: 0,
      };

    case "TICK_ELAPSED":
      return {
        ...state,
        elapsedSeconds: action.payload,
      };

    case "ANALYSIS_SUCCESS":
      return {
        ...state,
        status: "success",
        analysis: action.payload.analysis,
        analyzedSnapshotText: action.payload.snapshotText,
        errorState: null,
      };

    case "ANALYSIS_ERROR":
      return {
        ...state,
        status: "error",
        errorState: action.payload,
      };

    case "CANCEL_ANALYSIS":
      return {
        ...state,
        status: "error",
        errorState: { type: "CANCELLED" },
      };

    case "CLEAR_SESSION":
      return INITIAL_SESSION_STATE;

    default:
      return state;
  }
}
