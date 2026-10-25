import { z } from "zod";

export const AskResourceIdEnum = z.enum([
  "cybercrime",
  "aicte",
  "ncs",
  "mca",
  "advisories",
  "resources_page",
  "check_page",
  "research_prompt",
]);

export type AskResourceId = z.infer<typeof AskResourceIdEnum>;

export const AskResponseSchema = z.object({
  language: z.enum(["en", "hi", "other"]),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(500, "Summary must not exceed 500 characters"),
  whatThisMayMean: z
    .array(z.string().min(1).max(350))
    .max(4, "At most 4 points allowed for what this may mean"),
  doNow: z
    .array(z.string().min(1).max(350))
    .max(4, "At most 4 action steps allowed"),
  askOrCheck: z
    .array(z.string().min(1).max(350))
    .max(4, "At most 4 verification questions or checks allowed"),
  resources: z
    .array(AskResourceIdEnum)
    .max(5, "At most 5 resource references allowed"),
  clarifyingQuestion: z
    .string()
    .max(350, "Clarifying question must not exceed 350 characters")
    .nullable()
    .optional(),
});

export type AskResponse = z.infer<typeof AskResponseSchema>;

export interface AskThreadMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: AskResponse;
  error?: {
    code: string;
    message: string;
  };
  createdAt: number;
}

export interface AskReviewContext {
  categories?: string[];
  topics?: string[];
  verificationQuestions?: string[];
}
