import { z } from "zod";

/**
 * Concern categories identifying specific patterns that warrant student caution.
 */
export const ConcernCategoryEnum = z.enum([
  "upfront_payment",
  "refundable_deposit",
  "payment_urgency",
  "sensitive_information_request",
  "off_platform_communication",
  "other",
]);
export type ConcernCategory = z.infer<typeof ConcernCategoryEnum>;

/**
 * Topics for standard employment terms that may be missing or unstated.
 */
export const MissingInfoTopicEnum = z.enum([
  "stipend_or_pay",
  "working_hours",
  "duration",
  "start_date",
  "responsibilities",
  "work_mode_or_location",
  "reporting_contact",
  "company_details",
  "selection_process",
  "other",
]);
export type MissingInfoTopic = z.infer<typeof MissingInfoTopicEnum>;

/**
 * Schema for an individual concern returned by the model.
 * Note: Must include an exact quote from the user's input.
 */
export const ModelConcernSchema = z.object({
  id: z.string().min(1),
  category: ConcernCategoryEnum,
  observation: z
    .string()
    .min(1)
    .max(400, "Observation must not exceed 400 characters"),
  interpretation: z
    .string()
    .min(1)
    .max(400, "Interpretation must not exceed 400 characters"),
  quote: z.string().min(1, "Quote is required"),
});
export type ModelConcern = z.infer<typeof ModelConcernSchema>;

/**
 * Schema for an individual missing or unclear info item returned by the model.
 * Note: Must be phrased as unstated in the text, not proof of non-existence.
 */
export const ModelMissingInfoSchema = z.object({
  id: z.string().min(1),
  topic: MissingInfoTopicEnum,
  note: z
    .string()
    .min(1)
    .max(300, "Note must not exceed 300 characters"),
  relatedQuote: z.string().optional(),
});
export type ModelMissingInfo = z.infer<typeof ModelMissingInfoSchema>;

/**
 * Schema for a verification question returned by the model.
 */
export const ModelVerificationQuestionSchema = z.object({
  id: z.string().min(1),
  question: z
    .string()
    .min(1)
    .max(300, "Question must not exceed 300 characters"),
  relatedConcernId: z.string().optional(),
});
export type ModelVerificationQuestion = z.infer<
  typeof ModelVerificationQuestionSchema
>;

/**
 * Optional extracted entity details returned by the model.
 */
export const ModelEntitiesSchema = z.object({
  companyName: z.string().nullable().optional(),
  roleTitle: z.string().nullable().optional(),
});
export type ModelEntities = z.infer<typeof ModelEntitiesSchema>;

/**
 * Schema for the complete raw model output before client/server validation.
 * Explicitly excludes any numerical risk score, probability, or safe/unsafe verdict.
 */
export const ModelOutputSchema = z.object({
  concerns: z.array(ModelConcernSchema).max(10, "At most 10 concerns allowed"),
  missingInfo: z
    .array(ModelMissingInfoSchema)
    .max(10, "At most 10 missing info items allowed"),
  verificationQuestions: z
    .array(ModelVerificationQuestionSchema)
    .max(10, "At most 10 verification questions allowed"),
  overallNote: z
    .string()
    .max(400, "Overall note must not exceed 400 characters")
    .optional(),
  entities: ModelEntitiesSchema.optional(),
});
export type ModelOutput = z.infer<typeof ModelOutputSchema>;

/**
 * Character span offsets pointing into the ORIGINAL unnormalized input text.
 */
export interface TextSpan {
  start: number;
  end: number;
}

/**
 * Validated concern structure for the UI.
 * Guaranteed to have a verified quote whose span points into the original source text.
 */
export interface ValidatedConcern {
  id: string;
  category: ConcernCategory;
  observation: string;
  interpretation: string;
  quote: string;
  span: TextSpan;
}

/**
 * Validated missing or unclear information item.
 */
export interface ValidatedMissingInfo {
  id: string;
  topic: MissingInfoTopic;
  note: string;
  relatedQuote?: string;
}

/**
 * Validated verification question item.
 */
export interface ValidatedVerificationQuestion {
  id: string;
  question: string;
  relatedConcernId?: string;
}

export interface ValidatedEntities {
  companyName: string | null;
  roleTitle: string | null;
}

/**
 * Final validated analysis payload delivered to the presentation layer.
 */
export interface ValidatedAnalysis {
  concerns: ValidatedConcern[];
  missingInfo: ValidatedMissingInfo[];
  verificationQuestions: ValidatedVerificationQuestion[];
  overallNote?: string;
  entities?: ValidatedEntities;
  droppedCount: number;
  limits: readonly string[];
}
