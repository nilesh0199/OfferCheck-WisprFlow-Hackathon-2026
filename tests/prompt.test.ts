import { describe, it, expect } from "vitest";
import {
  SYSTEM_INSTRUCTION,
  OFFER_DELIMITER_START,
  OFFER_DELIMITER_END,
  buildUserContent,
} from "@/lib/analysis/prompt";

describe("SYSTEM_INSTRUCTION prompt rules and additions", () => {
  it("preserves epistemic and untrusted data boundary rules", () => {
    expect(SYSTEM_INSTRUCTION).toContain(OFFER_DELIMITER_START);
    expect(SYSTEM_INSTRUCTION).toContain(OFFER_DELIMITER_END);
    expect(SYSTEM_INSTRUCTION).toContain("UNTRUSTED DATA BOUNDARY");
    expect(SYSTEM_INSTRUCTION).toContain("EVIDENCE & QUOTATIONS");
    expect(SYSTEM_INSTRUCTION).toContain("FORBIDDEN LANGUAGE & CLAIMS");
  });

  it("instructs model that (your answers) and (your description) are user statements, not documents", () => {
    expect(SYSTEM_INSTRUCTION).toContain(
      'Sections headed "(your answers)" or "(your description)" are the user\'s own statements, not documents'
    );
    expect(SYSTEM_INSTRUCTION).toContain('word such observations as "You say ..." or "You describe ..."');
    expect(SYSTEM_INSTRUCTION).toContain("never treat them as proof");
  });

  it("instructs model that channel and applied answers are context only", () => {
    expect(SYSTEM_INSTRUCTION).toContain(
      "The channel and whether the user applied are CONTEXT ONLY and must never by themselves produce a concern."
    );
  });

  it("instructs model that section heading lines and source markers must never be quoted", () => {
    expect(SYSTEM_INSTRUCTION).toContain("---- Offer text ----");
    expect(SYSTEM_INSTRUCTION).toContain("---- How you received it (your answers) ----");
    expect(SYSTEM_INSTRUCTION).toContain("---- Call or conversation (your description) ----");
    expect(SYSTEM_INSTRUCTION).toContain("---- Money and documents (your answers) ----");
    expect(SYSTEM_INSTRUCTION).toContain("are markers added by the app to show where text came from; they are not part of the offer, must never be quoted, and must not be treated as content");
  });

  it("instructs model that company name entity must come from offer text or conversation, not answers", () => {
    expect(SYSTEM_INSTRUCTION).toContain(
      "The company name entity must come from the offer text or conversation, never from the answers."
    );
  });

  it("instructs model that bracketed privacy placeholders represent scrubbed personal data, not template artifacts", () => {
    expect(SYSTEM_INSTRUCTION).toContain("CLIENT-SIDE PRIVACY REDACTION TOKENS");
    expect(SYSTEM_INSTRUCTION).toContain("[CANDIDATE_NAME]");
    expect(SYSTEM_INSTRUCTION).toContain("[PHONE_REDACTED]");
    expect(SYSTEM_INSTRUCTION).toContain("[EMAIL_REDACTED]");
    expect(SYSTEM_INSTRUCTION).toContain("[AADHAAR_REDACTED]");
    expect(SYSTEM_INSTRUCTION).toContain("[PAN_REDACTED]");
    expect(SYSTEM_INSTRUCTION).toContain("DO NOT treat these placeholders as suspicious template artifacts");
  });
});

describe("buildUserContent helper", () => {
  it("encloses submitted text within explicit delimiters", () => {
    const raw = "Sample offer communication";
    const content = buildUserContent(raw);
    expect(content).toContain(OFFER_DELIMITER_START);
    expect(content).toContain(OFFER_DELIMITER_END);
    expect(content).toContain(raw);
  });
});
