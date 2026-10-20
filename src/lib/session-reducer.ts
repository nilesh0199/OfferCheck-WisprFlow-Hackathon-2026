import { ValidatedAnalysis } from "./analysis/schema";
import { ErrorType } from "@/components/ErrorAlert";

export type AnalysisStatus = "idle" | "loading" | "success" | "error";
export type InputTab = "paste" | "upload";
export type TranscribeStatus = "idle" | "loading" | "success" | "error";

export interface SelectedFileItem {
  id: string;
  file: File;
  previewUrl?: string;
}

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
  activeTab: InputTab;
  selectedFiles: SelectedFileItem[];
  transcribeStatus: TranscribeStatus;
  transcribeError: string | null;
  transcribeWarnings: string[];
  transcribeElapsedSeconds: number;
  transcriptBannerDismissed: boolean;
}

export const INITIAL_SESSION_STATE: OfferSessionState = {
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
  | { type: "CLEAR_SESSION" }
  | { type: "SET_ACTIVE_TAB"; payload: InputTab }
  | { type: "ADD_SELECTED_FILES"; payload: SelectedFileItem[] }
  | { type: "REMOVE_SELECTED_FILE"; payload: string }
  | { type: "CLEAR_SELECTED_FILES" }
  | { type: "START_TRANSCRIBE" }
  | { type: "TICK_TRANSCRIBE_ELAPSED"; payload: number }
  | {
      type: "TRANSCRIBE_SUCCESS";
      payload: { transcript: string; warnings: string[] };
    }
  | { type: "TRANSCRIBE_ERROR"; payload: string }
  | { type: "CANCEL_TRANSCRIBE" }
  | { type: "DISMISS_TRANSCRIPT_BANNER" };

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

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
      };

    case "ADD_SELECTED_FILES": {
      // Append files up to maximum limit of 5
      const combined = [...state.selectedFiles, ...action.payload].slice(0, 5);
      return {
        ...state,
        selectedFiles: combined,
        transcribeError: null,
      };
    }

    case "REMOVE_SELECTED_FILE":
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter((item) => item.id !== action.payload),
      };

    case "CLEAR_SELECTED_FILES":
      return {
        ...state,
        selectedFiles: [],
        transcribeError: null,
      };

    case "START_TRANSCRIBE":
      return {
        ...state,
        transcribeStatus: "loading",
        transcribeError: null,
        transcribeElapsedSeconds: 0,
      };

    case "TICK_TRANSCRIBE_ELAPSED":
      return {
        ...state,
        transcribeElapsedSeconds: action.payload,
      };

    case "TRANSCRIBE_SUCCESS":
      return {
        ...state,
        transcribeStatus: "success",
        offerText: action.payload.transcript,
        transcribeWarnings: action.payload.warnings,
        activeTab: "paste",
        transcriptBannerDismissed: false,
        transcribeError: null,
      };

    case "TRANSCRIBE_ERROR":
      return {
        ...state,
        transcribeStatus: "error",
        transcribeError: action.payload,
      };

    case "CANCEL_TRANSCRIBE":
      return {
        ...state,
        transcribeStatus: "idle",
        transcribeError: "File transcription was cancelled.",
      };

    case "DISMISS_TRANSCRIPT_BANNER":
      return {
        ...state,
        transcriptBannerDismissed: true,
      };

    default:
      return state;
  }
}
