import { ValidatedAnalysis } from "./analysis/schema";
import { ErrorType } from "@/components/ErrorAlert";
import { buildAppendBlock, TranscribedItem } from "./upload/markers";
import {
  WizardStep,
  SourceChannel,
  AppliedStatus,
  WizardSourceState,
  WizardConversationState,
  PaymentAskedStatus,
  PaymentPurpose,
  DocumentType,
  WizardPaymentState,
  INITIAL_WIZARD_SOURCE,
  INITIAL_WIZARD_CONVERSATION,
  INITIAL_WIZARD_PAYMENT,
} from "./combined-text";

export * from "./combined-text";

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
  // Wizard steps & state
  currentStep: WizardStep;
  visitedSteps: Record<number, boolean>;
  skippedSteps: Record<number, boolean>;

  // Step 1: Offer text & files
  offerText: string;
  undoOfferText: string | null;
  addedFileCount: number;
  selectedFiles: SelectedFileItem[];

  // Step 2: Source
  source: WizardSourceState;

  // Step 3: Conversation
  conversation: WizardConversationState;

  // Step 4: Money & documents
  payment: WizardPaymentState;

  // Analysis state & snapshot
  analyzedSnapshotText: string;
  analysis: ValidatedAnalysis | null;
  status: AnalysisStatus;
  errorState: SessionErrorState | null;
  elapsedSeconds: number;

  // Transcription state
  transcribeStatus: TranscribeStatus;
  transcribeError: string | null;
  transcribeErrorCode: string | null;
  transcribeWarnings: string[];
  transcribeElapsedSeconds: number;
  transcriptBannerDismissed: boolean;
}

export const INITIAL_SESSION_STATE: OfferSessionState = {
  currentStep: 1,
  visitedSteps: { 1: true, 2: false, 3: false, 4: false, 5: false },
  skippedSteps: { 1: false, 2: false, 3: false, 4: false, 5: false },
  offerText: "",
  undoOfferText: null,
  addedFileCount: 0,
  selectedFiles: [],
  source: { ...INITIAL_WIZARD_SOURCE },
  conversation: { ...INITIAL_WIZARD_CONVERSATION },
  payment: {
    ...INITIAL_WIZARD_PAYMENT,
    purposes: [],
    docsAsked: [],
    docsShared: [],
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
};

export type OfferSessionAction =
  | { type: "SET_STEP"; payload: WizardStep }
  | { type: "SET_STEP_VISITED"; payload: { step: number; visited?: boolean } }
  | { type: "SET_STEP_SKIPPED"; payload: { step: number; skipped?: boolean } }
  | { type: "SET_OFFER_TEXT"; payload: string }
  | { type: "SET_SOURCE_CHANNEL"; payload: SourceChannel }
  | { type: "SET_SOURCE_APPLIED"; payload: AppliedStatus }
  | { type: "SET_SOURCE_NOTE"; payload: string }
  | { type: "SET_CONVERSATION_TEXT"; payload: string }
  | { type: "SET_PAYMENT_ASKED"; payload: PaymentAskedStatus }
  | { type: "SET_PAYMENT_PURPOSES"; payload: PaymentPurpose[] }
  | { type: "TOGGLE_PAYMENT_PURPOSE"; payload: PaymentPurpose }
  | { type: "SET_PAYMENT_AMOUNT"; payload: string }
  | { type: "SET_PAYMENT_DEADLINE"; payload: string }
  | { type: "SET_DOCS_ASKED"; payload: DocumentType[] }
  | { type: "TOGGLE_DOCS_ASKED"; payload: DocumentType }
  | { type: "SET_DOCS_SHARED"; payload: DocumentType[] }
  | { type: "TOGGLE_DOCS_SHARED"; payload: DocumentType }
  | { type: "SET_PAYMENT_NOTE"; payload: string }
  | {
      type: "LOAD_WIZARD_SAMPLE";
      payload: Partial<{
        offerText: string;
        source: Partial<WizardSourceState>;
        conversation: Partial<WizardConversationState>;
        payment: Partial<WizardPaymentState>;
        step?: WizardStep;
      }>;
    }
  | { type: "START_ANALYSIS"; payload: { snapshotText: string } }
  | { type: "TICK_ELAPSED"; payload: number }
  | {
      type: "ANALYSIS_SUCCESS";
      payload: { analysis: ValidatedAnalysis; snapshotText: string };
    }
  | { type: "ANALYSIS_ERROR"; payload: SessionErrorState }
  | { type: "CANCEL_ANALYSIS" }
  | { type: "CLEAR_SESSION" }
  | { type: "CLEAR_ALL" }
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
 * Pure reducer for managing offer analysis session state and wizard in memory.
 * No data is persisted across browser refreshes or stored in any client storage.
 */
export function offerSessionReducer(
  state: OfferSessionState,
  action: OfferSessionAction
): OfferSessionState {
  switch (action.type) {
    case "SET_STEP": {
      const step = Math.max(1, Math.min(5, action.payload)) as WizardStep;
      return {
        ...state,
        currentStep: step,
        visitedSteps: {
          ...state.visitedSteps,
          [step]: true,
        },
      };
    }

    case "SET_STEP_VISITED": {
      return {
        ...state,
        visitedSteps: {
          ...state.visitedSteps,
          [action.payload.step]: action.payload.visited ?? true,
        },
      };
    }

    case "SET_STEP_SKIPPED": {
      return {
        ...state,
        skippedSteps: {
          ...state.skippedSteps,
          [action.payload.step]: action.payload.skipped ?? true,
        },
      };
    }

    case "SET_OFFER_TEXT":
      return {
        ...state,
        offerText: action.payload,
        undoOfferText: null, // User manual edit clears single-level undo
      };

    case "SET_SOURCE_CHANNEL":
      return {
        ...state,
        source: {
          ...state.source,
          channel: action.payload,
        },
      };

    case "SET_SOURCE_APPLIED":
      return {
        ...state,
        source: {
          ...state.source,
          applied: action.payload,
        },
      };

    case "SET_SOURCE_NOTE":
      return {
        ...state,
        source: {
          ...state.source,
          note: action.payload.slice(0, 200),
        },
      };

    case "SET_CONVERSATION_TEXT":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          text: action.payload.slice(0, 4000),
        },
      };

    case "SET_PAYMENT_ASKED":
      return {
        ...state,
        payment: {
          ...state.payment,
          asked: action.payload,
        },
      };

    case "SET_PAYMENT_PURPOSES":
      return {
        ...state,
        payment: {
          ...state.payment,
          purposes: [...action.payload],
        },
      };

    case "TOGGLE_PAYMENT_PURPOSE": {
      const purpose = action.payload;
      const exists = state.payment.purposes.includes(purpose);
      const updated = exists
        ? state.payment.purposes.filter((p) => p !== purpose)
        : [...state.payment.purposes, purpose];
      return {
        ...state,
        payment: {
          ...state.payment,
          purposes: updated,
        },
      };
    }

    case "SET_PAYMENT_AMOUNT":
      return {
        ...state,
        payment: {
          ...state.payment,
          amount: action.payload.slice(0, 40),
        },
      };

    case "SET_PAYMENT_DEADLINE":
      return {
        ...state,
        payment: {
          ...state.payment,
          deadline: action.payload.slice(0, 100),
        },
      };

    case "SET_DOCS_ASKED":
      return {
        ...state,
        payment: {
          ...state.payment,
          docsAsked: [...action.payload],
        },
      };

    case "TOGGLE_DOCS_ASKED": {
      const doc = action.payload;
      if (doc === "none") {
        return {
          ...state,
          payment: {
            ...state.payment,
            docsAsked: state.payment.docsAsked.includes("none") ? [] : ["none"],
          },
        };
      }
      const filtered = state.payment.docsAsked.filter((d) => d !== "none");
      const exists = filtered.includes(doc);
      const updated = exists ? filtered.filter((d) => d !== doc) : [...filtered, doc];
      return {
        ...state,
        payment: {
          ...state.payment,
          docsAsked: updated,
        },
      };
    }

    case "SET_DOCS_SHARED":
      return {
        ...state,
        payment: {
          ...state.payment,
          docsShared: [...action.payload],
        },
      };

    case "TOGGLE_DOCS_SHARED": {
      const doc = action.payload;
      if (doc === "none") {
        return {
          ...state,
          payment: {
            ...state.payment,
            docsShared: state.payment.docsShared.includes("none") ? [] : ["none"],
          },
        };
      }
      const filtered = state.payment.docsShared.filter((d) => d !== "none");
      const exists = filtered.includes(doc);
      const updated = exists ? filtered.filter((d) => d !== doc) : [...filtered, doc];
      return {
        ...state,
        payment: {
          ...state.payment,
          docsShared: updated,
        },
      };
    }

    case "SET_PAYMENT_NOTE":
      return {
        ...state,
        payment: {
          ...state.payment,
          note: action.payload.slice(0, 200),
        },
      };

    case "LOAD_WIZARD_SAMPLE": {
      const payload = action.payload;
      const targetStep = payload.step ?? 5;
      return {
        ...state,
        currentStep: targetStep,
        visitedSteps: {
          1: true,
          2: true,
          3: true,
          4: true,
          5: true,
        },
        skippedSteps: {
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
        },
        offerText: payload.offerText ?? "",
        undoOfferText: null,
        source: {
          channel: payload.source?.channel ?? null,
          applied: payload.source?.applied ?? null,
          note: (payload.source?.note ?? "").slice(0, 200),
        },
        conversation: {
          text: (payload.conversation?.text ?? "").slice(0, 4000),
        },
        payment: {
          asked: payload.payment?.asked ?? null,
          purposes: [...(payload.payment?.purposes ?? [])],
          amount: (payload.payment?.amount ?? "").slice(0, 40),
          deadline: (payload.payment?.deadline ?? "").slice(0, 100),
          docsAsked: [...(payload.payment?.docsAsked ?? [])],
          docsShared: [...(payload.payment?.docsShared ?? [])],
          note: (payload.payment?.note ?? "").slice(0, 200),
        },
        analysis: null,
        status: "idle",
        errorState: null,
      };
    }

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

    case "CLEAR_ALL":
    case "CLEAR_SESSION":
      return {
        ...INITIAL_SESSION_STATE,
        visitedSteps: { 1: true, 2: false, 3: false, 4: false, 5: false },
        skippedSteps: { 1: false, 2: false, 3: false, 4: false, 5: false },
        source: { ...INITIAL_WIZARD_SOURCE },
        conversation: { ...INITIAL_WIZARD_CONVERSATION },
        payment: {
          ...INITIAL_WIZARD_PAYMENT,
          purposes: [],
          docsAsked: [],
          docsShared: [],
        },
      };

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
        selectedFiles: [], // Pending files cleared on success
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
