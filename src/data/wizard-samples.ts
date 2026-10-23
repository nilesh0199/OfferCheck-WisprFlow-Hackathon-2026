import { SYNTHETIC_EXAMPLES } from "./examples";
import {
  WizardSourceState,
  WizardConversationState,
  WizardPaymentState,
  WizardStep,
} from "@/lib/combined-text";

export interface FullWizardSample {
  id: string;
  title: string;
  subtitle: string;
  label: "Synthetic example, not a real offer";
  offerText: string;
  source: WizardSourceState;
  conversation: WizardConversationState;
  payment: WizardPaymentState;
  targetStep: WizardStep;
}

const example5 = SYNTHETIC_EXAMPLES.find((e) => e.id === "example-5-phone-call-account")!;
const example6 = SYNTHETIC_EXAMPLES.find((e) => e.id === "example-6-course-as-internship")!;

export const FULL_WIZARD_SAMPLES: readonly FullWizardSample[] = [
  {
    id: "full-sample-course-as-internship",
    title: "Course sold as an internship",
    subtitle: "Training fee and WhatsApp group link sent to applicant",
    label: "Synthetic example, not a real offer",
    offerText: example6.text,
    source: {
      channel: "messaging",
      applied: "no",
      note: "",
    },
    conversation: {
      text: "",
    },
    payment: {
      asked: "yes_unpaid",
      purposes: ["registration", "training"],
      amount: "Rs 3,499",
      deadline: "Tonight",
      docsAsked: ["identity"],
      docsShared: [],
      note: "",
    },
    targetStep: 5,
  },
  {
    id: "full-sample-phone-call-account",
    title: "A phone call described in my own words",
    subtitle: "Informal account of a call requesting upfront UPI registration fee",
    label: "Synthetic example, not a real offer",
    offerText: "",
    source: {
      channel: "call",
      applied: "no",
      note: "",
    },
    conversation: {
      text: example5.text,
    },
    payment: {
      asked: "yes_unpaid",
      purposes: ["registration"],
      amount: "Rs 2,000",
      deadline: "Today 6 pm",
      docsAsked: ["identity", "bank"],
      docsShared: [],
      note: "",
    },
    targetStep: 5,
  },
];
