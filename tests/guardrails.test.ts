import { describe, it, expect } from "vitest";
import {
  detectOverclaiming,
  checkFieldsForOverclaiming,
} from "@/lib/analysis/guardrails";

describe("detectOverclaiming guardrails", () => {
  it("flags 'verified safe' assertions", () => {
    expect(
      detectOverclaiming("This internship is verified safe to accept.").flagged
    ).toBe(true);
    expect(
      detectOverclaiming("The recruiter is verified safe by our checks.")
        .flagged
    ).toBe(true);
  });

  it("flags 'definitely/certainly a scam or fraud'", () => {
    expect(detectOverclaiming("This is definitely a scam.").flagged).toBe(true);
    expect(detectOverclaiming("This is definitely fraud.").flagged).toBe(true);
    expect(
      detectOverclaiming("The offer is definitely fraudulent.").flagged
    ).toBe(true);
    expect(detectOverclaiming("This is certainly a scam.").flagged).toBe(true);
    expect(detectOverclaiming("This is certainly fraud.").flagged).toBe(true);
  });

  it("flags 'this is a scam/fraud'", () => {
    expect(detectOverclaiming("Warning: this is a scam.").flagged).toBe(true);
    expect(detectOverclaiming("Alert: this is fraud.").flagged).toBe(true);
  });

  it("flags 'guaranteed safe/legitimate'", () => {
    expect(
      detectOverclaiming("The opportunity is guaranteed safe.").flagged
    ).toBe(true);
    expect(
      detectOverclaiming("This position is guaranteed legitimate.").flagged
    ).toBe(true);
    expect(
      detectOverclaiming("The position is guaranteed to be safe.").flagged
    ).toBe(true);
  });

  it("flags numeric likelihood / probability scores", () => {
    expect(
      detectOverclaiming("There is an 85% chance this is illegitimate.").flagged
    ).toBe(true);
    expect(
      detectOverclaiming("Our model calculated a 92% probability of fraud.")
        .flagged
    ).toBe(true);
    expect(
      detectOverclaiming("We assess a 75% likelihood of a misleading offer.")
        .flagged
    ).toBe(true);
    expect(
      detectOverclaiming("There is a 90% risk associated with this payment.")
        .flagged
    ).toBe(true);
    expect(
      detectOverclaiming("Assessed with probability of 80%.").flagged
    ).toBe(true);
  });

  it("flags normative claims containing 'standard', 'typical', 'normal', or 'usual'", () => {
    expect(
      detectOverclaiming("This is not standard practice for hiring.").flagged
    ).toBe(true);
    expect(
      detectOverclaiming("A typical internship does not ask for fees.").flagged
    ).toBe(true);
    expect(
      detectOverclaiming("This is normal for startup offers.").flagged
    ).toBe(true);
    expect(
      detectOverclaiming("This departs from usual employment terms.").flagged
    ).toBe(true);
  });

  it("does NOT flag hedged or objective observations (no false positives)", () => {
    expect(
      detectOverclaiming("The company website may not be verified yet.").flagged
    ).toBe(false);
    expect(
      detectOverclaiming("A lack of warnings does not prove it is safe.").flagged
    ).toBe(false);
    expect(
      detectOverclaiming("Students should check if the stipend is guaranteed.")
        .flagged
    ).toBe(false);
    expect(
      detectOverclaiming(
        "This may indicate a risk, but there is not enough information to assess."
      ).flagged
    ).toBe(false);
    expect(
      detectOverclaiming(
        "The offer mentions an additional 10% commission on sales performance."
      ).flagged
    ).toBe(false);
    expect(
      detectOverclaiming("Not stated in the provided text.").flagged
    ).toBe(false);
  });

  it("checks multiple fields via checkFieldsForOverclaiming", () => {
    const cleanFields = {
      observation: "The sender asks for ₹4,500 equipment deposit.",
      interpretation: "Upfront deposits are unconventional for internships.",
    };
    expect(checkFieldsForOverclaiming(cleanFields).flagged).toBe(false);

    const dirtyFields = {
      observation: "The sender asks for ₹4,500 equipment deposit.",
      interpretation: "This is definitely a scam.",
    };
    const checkResult = checkFieldsForOverclaiming(dirtyFields);
    expect(checkResult.flagged).toBe(true);
    expect(checkResult.reason).toContain("interpretation");
  });
});
