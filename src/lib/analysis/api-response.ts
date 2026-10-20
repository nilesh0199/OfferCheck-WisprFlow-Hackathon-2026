import { ValidatedAnalysis } from "./schema";

export interface AnalyzeApiSuccessResponse {
  ok: true;
  analysis: ValidatedAnalysis;
}

export interface AnalyzeApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type AnalyzeApiResponse =
  | AnalyzeApiSuccessResponse
  | AnalyzeApiErrorResponse;

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/**
 * Validates whether an untrusted value matches the ValidatedAnalysis contract.
 */
export function isValidatedAnalysis(val: unknown): val is ValidatedAnalysis {
  if (!isObject(val)) return false;

  // 1. concerns array validation
  if (!Array.isArray(val.concerns)) return false;
  for (const c of val.concerns) {
    if (!isObject(c)) return false;
    if (typeof c.id !== "string" || !c.id) return false;
    if (typeof c.category !== "string") return false;
    if (typeof c.observation !== "string") return false;
    if (typeof c.interpretation !== "string") return false;
    if (typeof c.quote !== "string") return false;
    if (!isObject(c.span)) return false;
    if (
      typeof c.span.start !== "number" ||
      typeof c.span.end !== "number" ||
      !Number.isFinite(c.span.start) ||
      !Number.isFinite(c.span.end)
    ) {
      return false;
    }
  }

  // 2. missingInfo array validation
  if (!Array.isArray(val.missingInfo)) return false;
  for (const m of val.missingInfo) {
    if (!isObject(m)) return false;
    if (typeof m.id !== "string" || !m.id) return false;
    if (typeof m.topic !== "string") return false;
    if (typeof m.note !== "string") return false;
    if (m.relatedQuote !== undefined && typeof m.relatedQuote !== "string") {
      return false;
    }
  }

  // 3. verificationQuestions array validation
  if (!Array.isArray(val.verificationQuestions)) return false;
  for (const q of val.verificationQuestions) {
    if (!isObject(q)) return false;
    if (typeof q.id !== "string" || !q.id) return false;
    if (typeof q.question !== "string") return false;
    if (
      q.relatedConcernId !== undefined &&
      typeof q.relatedConcernId !== "string"
    ) {
      return false;
    }
  }

  // 4. limits array validation
  if (!Array.isArray(val.limits)) return false;
  for (const lim of val.limits) {
    if (typeof lim !== "string") return false;
  }

  // 5. droppedCount number validation
  if (
    typeof val.droppedCount !== "number" ||
    !Number.isFinite(val.droppedCount) ||
    val.droppedCount < 0
  ) {
    return false;
  }

  // 6. overallNote optional string validation
  if (val.overallNote !== undefined && typeof val.overallNote !== "string") {
    return false;
  }

  // 7. entities optional object validation
  if (val.entities !== undefined) {
    if (!isObject(val.entities)) return false;
    if (
      val.entities.companyName !== null &&
      val.entities.companyName !== undefined &&
      typeof val.entities.companyName !== "string"
    ) {
      return false;
    }
    if (
      val.entities.roleTitle !== null &&
      val.entities.roleTitle !== undefined &&
      typeof val.entities.roleTitle !== "string"
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard for success response from POST /api/analyze.
 */
export function isAnalyzeSuccessResponse(
  data: unknown
): data is AnalyzeApiSuccessResponse {
  if (!isObject(data)) return false;
  if (data.ok !== true) return false;
  return isValidatedAnalysis(data.analysis);
}

/**
 * Type guard for error response from POST /api/analyze.
 */
export function isAnalyzeErrorResponse(
  data: unknown
): data is AnalyzeApiErrorResponse {
  if (!isObject(data)) return false;
  if (data.ok !== false) return false;
  if (!isObject(data.error)) return false;
  if (typeof data.error.code !== "string" || !data.error.code) return false;
  if (typeof data.error.message !== "string") return false;
  return true;
}

/**
 * Comprehensive type guard verifying that the response is either a valid success or valid error.
 */
export function isAnalyzeApiResponse(
  data: unknown
): data is AnalyzeApiResponse {
  return isAnalyzeSuccessResponse(data) || isAnalyzeErrorResponse(data);
}
