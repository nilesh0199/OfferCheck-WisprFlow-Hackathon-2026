/**
 * Guardrail checks for model-generated content.
 *
 * NOTE: This is a best-effort deterministic backstop to prevent dangerous,
 * hyperbolic, or legally problematic claims from reaching students.
 * It is NOT a replacement for strict system prompt rules, but acts as a final
 * safeguard before findings are displayed.
 */

export interface GuardrailCheckResult {
  flagged: boolean;
  reason?: string;
  matchedPhrase?: string;
}

interface GuardrailPattern {
  name: string;
  regex: RegExp;
  description: string;
}

/**
 * Small, focused list of prohibited overclaiming patterns.
 * Designed to avoid false positives on hedged phrases like:
 * - "may not be verified"
 * - "does not prove it is safe"
 * - "verify whether the stipend is guaranteed"
 */
const FORBIDDEN_PATTERNS: readonly GuardrailPattern[] = [
  {
    name: "verified_safe",
    regex: /\bverified\s+safe\b/i,
    description: "Claims that an offer or organisation is 'verified safe'",
  },
  {
    name: "definitely_scam_or_fraud",
    regex: /\b(definitely|certainly)\s+(a\s+)?(scam|fraud|fraudulent)\b/i,
    description:
      "Definitive fraud or scam accusations ('definitely/certainly a scam or fraud')",
  },
  {
    name: "this_is_a_scam",
    regex: /\bthis\s+is\s+(a\s+)?(scam|fraud)\b/i,
    description: "Absolute scam assertion ('this is a scam' or 'this is fraud')",
  },
  {
    name: "guaranteed_safe_or_legitimate",
    regex: /\bguaranteed\s+(to\s+be\s+)?(safe|legitimate)\b/i,
    description: "Guarantees of safety or legitimacy",
  },
  {
    name: "numeric_probability_phrase",
    regex:
      /\b\d+(?:\.\d+)?%\s*(chance|probability|likelihood|risk|certain|confidence)\b/i,
    description:
      "Numerical likelihood or risk score (e.g. '85% chance/probability/likelihood')",
  },
  {
    name: "probability_of_percentage",
    regex: /\b(chance|probability|likelihood|risk)\s+(of\s+)?\d+(?:\.\d+)?%/i,
    description:
      "Numerical probability phrasing (e.g. 'probability of 85%')",
  },
];

/**
 * Checks a single text string against the forbidden overclaiming patterns.
 */
export function detectOverclaiming(text: string): GuardrailCheckResult {
  if (typeof text !== "string" || !text.trim()) {
    return { flagged: false };
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      return {
        flagged: true,
        reason: pattern.description,
        matchedPhrase: match[0],
      };
    }
  }

  return { flagged: false };
}

/**
 * Checks multiple model-written fields. Returns flagged: true if any field contains overclaiming language.
 */
export function checkFieldsForOverclaiming(
  fields: Record<string, string | undefined>
): GuardrailCheckResult {
  for (const [fieldName, val] of Object.entries(fields)) {
    if (!val) continue;
    const result = detectOverclaiming(val);
    if (result.flagged) {
      return {
        flagged: true,
        reason: `Field '${fieldName}' tripped guardrail: ${result.reason}`,
        matchedPhrase: result.matchedPhrase,
      };
    }
  }
  return { flagged: false };
}
