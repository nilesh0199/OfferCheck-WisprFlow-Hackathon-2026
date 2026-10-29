import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  detectSensitiveEntities,
  applyRedactions,
  buildPreviewSegments,
  ENTITY_PLACEHOLDERS,
} from "@/lib/scrubber";

describe("Step 5 Privacy Scrubber & Visual Preview", () => {
  const step5Path = path.resolve(
    process.cwd(),
    "src/components/wizard/Step5Review.tsx"
  );
  const step5Content = fs.readFileSync(step5Path, "utf-8");

  it("replaces prominent character boundary checks with privacy shield status", () => {
    // Header should feature client-side protection and masked count
    expect(step5Content).toContain("Client-side protected");
    expect(step5Content).toContain("masked");
    expect(step5Content).toContain("ShieldCheckIcon");
    // Verify technical character boundary counter is not in the header spot
    expect(step5Content).not.toContain("{charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} characters");
  });

  it("contains the client-side privacy popup with short, clear explanation", () => {
    expect(step5Content).toContain("Client-side Privacy Shield");
    expect(step5Content).toContain(
      "Your personal identifiers (names, phone numbers, email addresses, Aadhaar, PAN) are scrubbed directly on your device."
    );
    expect(step5Content).toContain("your real identity never leaves your browser");
    expect(step5Content).toContain("Got it");
  });

  it("includes interactive scrubber controls directly in Step 1 and Step 3 review cards", () => {
    // Top-level Step 1 Offer text scrubber
    expect(step5Content).toContain("Step 1.");
    expect(step5Content).toContain("offerSegments.map");
    expect(step5Content).toContain("handleRedactOffer");
    expect(step5Content).toContain("handleKeepOffer");

    // Top-level Step 3 Conversation scrubber
    expect(step5Content).toContain("Step 3.");
    expect(step5Content).toContain("convSegments.map");
    expect(step5Content).toContain("handleRedactConv");
    expect(step5Content).toContain("handleKeepConv");

    expect(step5Content).toContain("handleToggleEntity");

    // Helpful reminder to double-check for any missed sensitive info
    expect(step5Content).toContain("Check for any sensitive info we may have missed.");
  });

  it("scrubs candidate details while retaining offer context for AI evaluation", () => {
    const rawOffer = `Dear Ananya Sen,
We are pleased to offer you the internship at TechCorp.
Please submit your PAN ABCDE5678G and Aadhaar 9876 5432 1098.
Contact hr@techcorp.in or +91 91234 56789.
Security deposit of Rs 10,000 to be paid to recruiter@okaxis.`;

    const entities = detectSensitiveEntities(rawOffer);
    expect(entities.length).toBeGreaterThanOrEqual(4);

    const scrubbed = applyRedactions(rawOffer, entities, {});

    // Personal details masked
    expect(scrubbed).not.toContain("Ananya Sen");
    expect(scrubbed).not.toContain("ABCDE5678G");
    expect(scrubbed).not.toContain("9876 5432 1098");
    expect(scrubbed).not.toContain("+91 91234 56789");

    // Semantic placeholders inserted
    expect(scrubbed).toContain(ENTITY_PLACEHOLDERS.name);
    expect(scrubbed).toContain(ENTITY_PLACEHOLDERS.pan);
    expect(scrubbed).toContain(ENTITY_PLACEHOLDERS.aadhaar);
    expect(scrubbed).toContain(ENTITY_PLACEHOLDERS.phone);

    // Critical scam/offer context fully preserved for evaluation
    expect(scrubbed).toContain("Security deposit of Rs 10,000");
    expect(scrubbed).toContain("internship at TechCorp");
  });
});
