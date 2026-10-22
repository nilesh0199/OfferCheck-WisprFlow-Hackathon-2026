import { ValidatedAnalysis } from "./analysis/schema";
import { ErrorType } from "@/components/ErrorAlert";
import { buildAppendBlock, TranscribedItem } from "./upload/markers";

export type AnalysisStatus = "idle" | "loading" | "success" | "error";
export type TranscribeStatus = "idle" | "loading" | "success" | "error";

export interface SelectedFileItem {
  id: string;
  file: File;
  previewUrl?: string;
}

export interface SessionErrorState {
  type: ErrorType;
  message?: string;
  code?: string;
}

export interface OfferSessionState {
  offerText: string;
  undoOfferText: string | null;
  addedFileCount: number;
  analyzedSnapshotText: string;
  analysis: ValidatedAnalysis | null;
  status: AnalysisStatus;
  errorState: SessionErrorState | null;
  elapsedSeconds: number;
  selectedFiles: SelectedFileItem[];
  transcribeStatus: TranscribeStatus;
  transcribeError: string | null;
  transcribeErrorCode: string | null;
  transcribeWarnings: string[];
  transcribeElapsedSeconds: number;
  transcriptBannerDismissed: boolean;
}

export const INITIAL_SESSION_STATE: OfferSessionState = {
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
  | { type: "ADD_SELECTED_FILES"; payload: SelectedFileItem[] }
  | { type: "REMOVE_SELECTED_FILE"; payload: string }
  | { type: "CLEAR_SELECTED_FILES" }
  | { type: "START_TRANSCRIBE" }
  | { type: "TICK_TRANSCRIBE_ELAPSED"; payload: number }
  | {
      type: "TRANSCRIBE_SUCCESS";
      payload: { items: TranscribedItem[]; warnings: string[]; fileCount?: number };
    }
  | { type: "TRANSCRIBE_ERROR"; payload: { message: string; code?: string } | string }
  | { type: "CANCEL_TRANSCRIBE" }
  | { type: "DISMISS_TRANSCRIPT_BANNER" }
  | { type: "UNDO_APPEND_TRANSCRIPT" };

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
        undoOfferText: null, // User manual edit clears the single-level undo
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

    case "ADD_SELECTED_FILES": {
      // Append files up to maximum limit of 5
      const combined = [...state.selectedFiles, ...action.payload].slice(0, 5);
      return {
        ...state,
        selectedFiles: combined,
        transcribeError: null,
        transcribeErrorCode: null,
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
        transcribeErrorCode: null,
      };

    case "START_TRANSCRIBE":
      return {
        ...state,
        transcribeStatus: "loading",
        transcribeError: null,
        transcribeErrorCode: null,
        transcribeElapsedSeconds: 0,
      };

    case "TICK_TRANSCRIBE_ELAPSED":
      return {
        ...state,
        transcribeElapsedSeconds: action.payload,
      };

    case "TRANSCRIBE_SUCCESS": {
      const fileCount = action.payload.fileCount ?? action.payload.items.length ?? 1;
      const combined = buildAppendBlock(state.offerText, action.payload.items);
      return {
        ...state,
        transcribeStatus: "success",
        undoOfferText: state.offerText, // Store pre-append state for 1-level undo
        offerText: combined,
        addedFileCount: fileCount,
        transcribeWarnings: action.payload.warnings,
        selectedFiles: [], // Pending files are cleared on success
        transcriptBannerDismissed: false,
        transcribeError: null,
        transcribeErrorCode: null,
      };
    }

    case "UNDO_APPEND_TRANSCRIPT":
      if (state.undoOfferText === null) {
        return state;
      }
      return {
        ...state,
        offerText: state.undoOfferText,
        undoOfferText: null,
        addedFileCount: 0,
        transcriptBannerDismissed: true,
      };

    case "TRANSCRIBE_ERROR": {
      const message =
        typeof action.payload === "string" ? action.payload : action.payload.message;
      const code =
        typeof action.payload === "object" ? action.payload.code ?? null : null;
      return {
        ...state,
        transcribeStatus: "error",
        transcribeError: message,
        transcribeErrorCode: code,
        // Files kept after failure as specified
      };
    }

    case "CANCEL_TRANSCRIBE":
      return {
        ...state,
        transcribeStatus: "idle",
        transcribeError: "File transcription was cancelled.",
        transcribeErrorCode: "CANCELLED",
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
