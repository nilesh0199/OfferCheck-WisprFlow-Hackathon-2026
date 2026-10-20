import {
  ModelOutput,
  ModelOutputSchema,
  ValidatedAnalysis,
  ValidatedConcern,
  ValidatedMissingInfo,
  ValidatedVerificationQuestion,
} from "./schema";
import { validateQuote } from "./quote-validator";
import { detectOverclaiming } from "./guardrails";

/**
 * Standardized review limitations attached from code (never from model output).
 */
export const REVIEW_LIMITS: readonly string[] = [
  "Reviews supplied text only; terms or conditions not provided in the input have not been assessed.",
  "Cannot establish that the sender legitimately represents or is authorized by the claimed organization.",
  "Absence of identified warnings is not proof of safety or legitimacy.",
  "Polished writing is not proof of legitimacy, and poor grammar is not proof of fraud.",
  "'Not stated in the provided text' is an observation about the text, not proof that a term does not exist in the actual offer.",
];

export type ParseModelOutputResult =
  | { ok: true; data: ModelOutput }
  | { ok: false; error: string };

/**
 * Safely parses untrusted model output into a typed ModelOutput object.
 * Guaranteed to NEVER throw on any input (null, string, wrong shape, extra fields, circular refs).
 */
export function parseModelOutput(raw: unknown): ParseModelOutputResult {
  try {
    if (raw === null || raw === undefined) {
      return { ok: false, error: "Model output is null or undefined" };
    }

    let candidate: unknown = raw;
    if (typeof raw === "string") {
      try {
        candidate = JSON.parse(raw);
      } catch (jsonErr) {
        return {
          ok: false,
          error: `Failed to parse JSON string: ${
            jsonErr instanceof Error ? jsonErr.message : String(jsonErr)
          }`,
        };
      }
    }

    // Clean up nulls on optional arrays and properties commonly emitted by LLM structured outputs
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const obj = candidate as Record<string, unknown>;
      if (obj.concerns === null) obj.concerns = [];
      if (obj.missingInfo === null) obj.missingInfo = [];
      if (obj.verificationQuestions === null) obj.verificationQuestions = [];
      if (obj.overallNote === null) delete obj.overallNote;
      if (Array.isArray(obj.missingInfo)) {
        for (const item of obj.missingInfo) {
          if (
            item &&
            typeof item === "object" &&
            (item as Record<string, unknown>).relatedQuote === null
          ) {
            delete (item as Record<string, unknown>).relatedQuote;
          }
        }
      }
      if (Array.isArray(obj.verificationQuestions)) {
        for (const q of obj.verificationQuestions) {
          if (
            q &&
            typeof q === "object" &&
            (q as Record<string, unknown>).relatedConcernId === null
          ) {
            delete (q as Record<string, unknown>).relatedConcernId;
          }
        }
      }
    }

    const parseResult = ModelOutputSchema.safeParse(candidate);
    if (!parseResult.success) {
      const issueDetails = parseResult.error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      return {
        ok: false,
        error: `Model output schema validation failed: ${issueDetails}`,
      };
    }

    return {
      ok: true,
      data: parseResult.data,
    };
  } catch (err) {
    return {
      ok: false,
      error: `Unexpected error during parsing: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

/**
 * Validates parsed model findings against the raw sourceText and safety guardrails.
 *
 * Rules:
 * - Drops any concern whose quote fails verbatim validation in sourceText OR trips overclaiming guardrails.
 * - Increments droppedCount for each dropped item.
 * - Retains missingInfo and verificationQuestions, dropping only those that trip overclaiming guardrails.
 * - If a question references a dropped concern, clears relatedConcernId.
 * - If relatedQuote is present on missingInfo but fails quotation validation, removes only the relatedQuote.
 * - If overallNote trips guardrails, removes it and increments droppedCount.
 * - Always attaches the immutable REVIEW_LIMITS array from application code.
 */
export function validateAnalysis(
  parsed: ModelOutput,
  sourceText: string
): ValidatedAnalysis {
  let droppedCount = 0;

  // 1. Overall note guardrail check
  let overallNote: string | undefined = parsed.overallNote;
  if (overallNote) {
    const noteGuard = detectOverclaiming(overallNote);
    if (noteGuard.flagged) {
      overallNote = undefined;
      droppedCount++;
    }
  }

  // 2. Validate concerns
  const validatedConcerns: ValidatedConcern[] = [];
  const keptConcernIds = new Set<string>();

  for (const concern of parsed.concerns) {
    // Check overclaiming guardrails on observation and interpretation
    const obsGuard = detectOverclaiming(concern.observation);
    const intGuard = detectOverclaiming(concern.interpretation);
    if (obsGuard.flagged || intGuard.flagged) {
      droppedCount++;
      continue;
    }

    // Validate quote against original source text
    const quoteResult = validateQuote(concern.quote, sourceText);
    if (
      !quoteResult.valid ||
      quoteResult.start === undefined ||
      quoteResult.end === undefined
    ) {
      droppedCount++;
      continue;
    }

    validatedConcerns.push({
      id: concern.id,
      category: concern.category,
      observation: concern.observation,
      interpretation: concern.interpretation,
      quote: concern.quote,
      span: {
        start: quoteResult.start,
        end: quoteResult.end,
      },
    });
    keptConcernIds.add(concern.id);
  }

  // 3. Validate missing information items
  const validatedMissingInfo: ValidatedMissingInfo[] = [];

  for (const item of parsed.missingInfo) {
    const noteGuard = detectOverclaiming(item.note);
    if (noteGuard.flagged) {
      droppedCount++;
      continue;
    }

    let relatedQuote: string | undefined = item.relatedQuote;
    if (relatedQuote) {
      const qResult = validateQuote(relatedQuote, sourceText);
      if (!qResult.valid) {
        // Remove only the invalid relatedQuote; the missing info item itself is kept
        relatedQuote = undefined;
      }
    }

    validatedMissingInfo.push({
      id: item.id,
      topic: item.topic,
      note: item.note,
      relatedQuote,
    });
  }

  // 4. Validate verification questions
  const validatedQuestions: ValidatedVerificationQuestion[] = [];

  for (const q of parsed.verificationQuestions) {
    const qGuard = detectOverclaiming(q.question);
    if (qGuard.flagged) {
      droppedCount++;
      continue;
    }

    let relatedConcernId: string | undefined = q.relatedConcernId;
    if (relatedConcernId && !keptConcernIds.has(relatedConcernId)) {
      // Clear reference if the referenced concern was dropped
      relatedConcernId = undefined;
    }

    validatedQuestions.push({
      id: q.id,
      question: q.question,
      relatedConcernId,
    });
  }

  return {
    concerns: validatedConcerns,
    missingInfo: validatedMissingInfo,
    verificationQuestions: validatedQuestions,
    overallNote,
    droppedCount,
    limits: [...REVIEW_LIMITS],
  };
}
