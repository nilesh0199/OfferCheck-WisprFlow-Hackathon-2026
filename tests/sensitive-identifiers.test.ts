import { describe, it, expect } from "vitest";
import {
  detectSensitiveIdentifiers,
  SENSITIVE_IDENTIFIER_WARNING,
} from "@/lib/sensitive-identifiers";

describe("detectSensitiveIdentifiers pure function", () => {
  it("exports a calm, non-blocking warning message", () => {
    expect(SENSITIVE_IDENTIFIER_WARNING).toBe(
      "This looks like an account, UPI or ID number. Remove it before you continue; OfferClara does not need it."
    );
  });

  it("detects UPI addresses (name@bank) and ignores standard email addresses", () => {
    // UPI addresses
    expect(detectSensitiveIdentifiers("Please pay to user@okaxis today")).toContain("upi");
    expect(detectSensitiveIdentifiers("UPI ID: merchant@ybl")).toContain("upi");
    expect(detectSensitiveIdentifiers("Send Rs 2000 to rahul@paytm")).toContain("upi");
    expect(detectSensitiveIdentifiers("9876543210@upi")).toContain("upi");

    // Standard email addresses with dots in domain MUST NOT be flagged as UPI
    expect(detectSensitiveIdentifiers("Contact recruiter@example.com")).toEqual([]);
    expect(detectSensitiveIdentifiers("Send your CV to careers@company.co.in")).toEqual([]);
    expect(detectSensitiveIdentifiers("Write to talent@example.org for questions")).toEqual([]);
    expect(detectSensitiveIdentifiers("Email us at hr@startup.io")).toEqual([]);
  });

  it("detects 12-digit Aadhaar numbers in spaced, hyphenated, and continuous formats", () => {
    expect(detectSensitiveIdentifiers("Aadhaar: 2345 6789 0123")).toContain("aadhaar");
    expect(detectSensitiveIdentifiers("My ID is 2345-6789-0123")).toContain("aadhaar");
    expect(detectSensitiveIdentifiers("Number: 234567890123")).toContain("aadhaar");
  });

  it("detects PAN format (5 letters, 4 digits, 1 letter)", () => {
    expect(detectSensitiveIdentifiers("PAN card: ABCDE1234F")).toContain("pan");
    expect(detectSensitiveIdentifiers("Attached pan card bzxpq9876k for verification")).toContain(
      "pan"
    );
  });

  it("detects long digit runs of 10 or more (e.g. bank account numbers)", () => {
    expect(detectSensitiveIdentifiers("Account number: 123456789012345")).toContain(
      "account_or_id"
    );
    expect(detectSensitiveIdentifiers("Transfer to 0001234567890")).toContain(
      "account_or_id"
    );
  });

  describe("False-positive resilience", () => {
    it("does NOT flag salary amounts or currency figures", () => {
      const text = "Stipend of Rs 22,000 per month with ₹4,500 deposit and 3499 fee";
      expect(detectSensitiveIdentifiers(text)).toEqual([]);
    });

    it("does NOT flag dates", () => {
      const text = "Start date: 2026-10-23, joining on 23/10/2026 or Nov 10, 2026";
      expect(detectSensitiveIdentifiers(text)).toEqual([]);
    });

    it("does NOT flag formatted phone numbers with spaces or prefixes", () => {
      expect(detectSensitiveIdentifiers("Call us at +91 98000 00000")).toEqual([]);
      expect(detectSensitiveIdentifiers("WhatsApp at +91 98000 00001")).toEqual([]);
      expect(detectSensitiveIdentifiers("Phone: 98000 00002")).toEqual([]);
    });

    it("returns empty array for clean, typical offer text", () => {
      const cleanOffer = `Dear Candidate,
We are pleased to offer you the position of Software Intern at Example Corp.
Your monthly stipend will be Rs 25,000 for 3 months starting Nov 1, 2026.
Please reply to careers@example.com or call +91 98000 00000.`;
      expect(detectSensitiveIdentifiers(cleanOffer)).toEqual([]);
    });
  });

  describe("Step 1 Sensitive Information Warning", () => {
    it("verifies Step 1 shows a bold red warning beside the document fallback button", () => {
      const fs = require("fs");
      const path = require("path");
      const step1Path = path.resolve(
        process.cwd(),
        "src/components/wizard/Step1Offer.tsx"
      );
      const content = fs.readFileSync(step1Path, "utf-8");

      // Verify the warning text exists in Step 1
      expect(content).toContain("Warning: Please remove personal / sensitive information");
      // Verify it's styled bold, red (danger text variable), and text-sm (1 size bigger than text-xs button)
      expect(content).toContain("font-bold text-[var(--color-danger-text)]");
      expect(content).toContain("text-sm font-bold");
      // Verify it's alongside the 'I don't have a document' button
      expect(content).toContain("I don&apos;t have a document (describe a call or conversation instead)");
    });
  });
});
