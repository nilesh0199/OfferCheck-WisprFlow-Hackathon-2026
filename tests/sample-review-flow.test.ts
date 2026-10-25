import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/analyze/route";
import { FULL_WIZARD_SAMPLES } from "@/data/wizard-samples";
import { getStoredSampleAnalysis } from "@/data/stored-sample-analysis";
import { buildCombinedText } from "@/lib/combined-text";
import { offerSessionReducer, INITIAL_SESSION_STATE } from "@/lib/session-reducer";

describe("Sample Review Flow", () => {
  const courseSample = FULL_WIZARD_SAMPLES.find(
    (s) => s.id === "full-sample-course-as-internship"
  )!;

  it("loads full wizard sample into reducer state at step 5", () => {
    const loadedState = offerSessionReducer(INITIAL_SESSION_STATE, {
      type: "LOAD_WIZARD_SAMPLE",
      payload: courseSample,
    });

    expect(loadedState.currentStep).toBe(5);
    expect(loadedState.offerText).toContain("HelixBrattice Skillcraft");
    expect(loadedState.source.channel).toBe("messaging");
    expect(loadedState.payment.asked).toBe("yes_unpaid");
    expect(loadedState.payment.amount).toBe("Rs 3,499");
    expect(loadedState.analysis).toBeNull();
    expect(loadedState.status).toBe("idle");
  });

  it("produces valid stored analysis for the loaded sample combined text", () => {
    const { text: combinedText } = buildCombinedText(courseSample);
    const analysis = getStoredSampleAnalysis(combinedText);

    expect(analysis).not.toBeNull();
    expect(analysis!.droppedCount).toBe(0);
    expect(analysis!.concerns.length).toBe(3);

    // Verify all quotes match verbatim
    for (const concern of analysis!.concerns) {
      const extracted = combinedText.slice(concern.span.start, concern.span.end);
      expect(extracted).toBe(concern.quote);
    }
  });

  it("route /api/analyze returns 200 with stored analysis instantly without LLM calls", async () => {
    const { text: combinedText } = buildCombinedText(courseSample);

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: combinedText }),
    });

    const startTime = Date.now();
    const res = await POST(req);
    const elapsed = Date.now() - startTime;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(1000); // Instant, well under 5 seconds

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.analysis).toBeDefined();
    expect(body.analysis.entities?.companyName).toBe("HelixBrattice Skillcraft");
    expect(body.analysis.concerns.length).toBe(3);
    expect(body.analysis.droppedCount).toBe(0);
  });
});
