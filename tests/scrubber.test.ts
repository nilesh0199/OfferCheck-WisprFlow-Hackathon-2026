import { describe, it, expect } from "vitest";
import {
  detectSensitiveEntities,
  buildPreviewSegments,
  applyRedactions,
  ENTITY_PLACEHOLDERS,
} from "@/lib/scrubber";

describe("Client-Side Sensitive Data Scrubber", () => {
  it("detects candidate names in greeting formats", () => {
    const text = "Dear Rahul Sharma, we welcome you to the company.";
    const entities = detectSensitiveEntities(text);
    expect(entities.some((e) => e.type === "name" && e.original === "Rahul Sharma")).toBe(true);
  });

  it("detects personal email addresses", () => {
    const text = "Please send questions to candidate.test@gmail.com by tomorrow.";
    const entities = detectSensitiveEntities(text);
    expect(entities.some((e) => e.type === "email" && e.original === "candidate.test@gmail.com")).toBe(true);
  });

  it("detects phone numbers with country codes and spaced digits", () => {
    const text = "Call candidate on +91 98765 43210 or 9876543210 for verification.";
    const entities = detectSensitiveEntities(text);
    expect(entities.filter((e) => e.type === "phone").length).toBe(2);
  });

  it("detects PAN card numbers and Aadhaar numbers", () => {
    const text = "Candidate PAN is ABCDE1234F and Aadhaar number is 2345 6789 0123.";
    const entities = detectSensitiveEntities(text);
    expect(entities.some((e) => e.type === "pan" && e.original === "ABCDE1234F")).toBe(true);
    expect(entities.some((e) => e.type === "aadhaar" && e.original === "2345 6789 0123")).toBe(true);
  });

  it("detects UPI handles while preserving dot-domains as emails", () => {
    const text = "Send money to hr@okhdfcbank or 9876543210@upi.";
    const entities = detectSensitiveEntities(text);
    expect(entities.some((e) => e.type === "upi" && e.original === "hr@okhdfcbank")).toBe(true);
    expect(entities.some((e) => e.type === "upi" && e.original === "9876543210@upi")).toBe(true);
  });

  it("does not flag salary amounts or stipend figures as phone numbers", () => {
    const text = "Stipend of Rs 25,000 per month with ₹50000 deposit.";
    const entities = detectSensitiveEntities(text);
    expect(entities.some((e) => e.original.includes("25,000"))).toBe(false);
  });

  it("builds preview segments and applies redactions cleanly", () => {
    const text = "Dear Rohan Verma, your PAN is ABCDE1234F.";
    const entities = detectSensitiveEntities(text);
    expect(entities.length).toBe(2);

    // Default: all redacted
    const scrubbed = applyRedactions(text, entities, {});
    expect(scrubbed).toContain(ENTITY_PLACEHOLDERS.name);
    expect(scrubbed).toContain(ENTITY_PLACEHOLDERS.pan);
    expect(scrubbed).not.toContain("Rohan Verma");
    expect(scrubbed).not.toContain("ABCDE1234F");

    // Partial toggle: unmask PAN, keep name redacted
    const partialState = { [entities[1].id]: false };
    const partialScrubbed = applyRedactions(text, entities, partialState);
    expect(partialScrubbed).toContain(ENTITY_PLACEHOLDERS.name);
    expect(partialScrubbed).toContain("ABCDE1234F");
  });
});
