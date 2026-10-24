import { describe, it, expect } from "vitest";
import { selectResources } from "@/lib/analysis/resources";

describe("selectResources", () => {
  it("always includes cybercrime and mca for empty text and empty categories with no matchedTerm", () => {
    const selected = selectResources([], "");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "mca"]);
    expect(selected[0].expanded).toBe(false);
    expect(selected[0].matchedTerm).toBeUndefined();
    expect(selected[1].matchedTerm).toBeUndefined();
  });

  it("flags cybercrime as expanded when upfront_payment category is present", () => {
    const selected = selectResources(["upfront_payment"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("flags cybercrime as expanded when refundable_deposit category is present", () => {
    const selected = selectResources(["refundable_deposit"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("flags cybercrime as expanded when payment_urgency category is present", () => {
    const selected = selectResources(["payment_urgency"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("flags cybercrime as expanded when sensitive_information_request is present", () => {
    const selected = selectResources(["sensitive_information_request"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("leaves cybercrime non-expanded for other or off_platform_communication categories", () => {
    const selected = selectResources(
      ["off_platform_communication", "other"],
      "Standard offer text."
    );
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(false);
  });

  it("includes aicte when text contains word AICTE and populates matchedTerm", () => {
    const selected = selectResources([], "Registered under the AICTE internship scheme.");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "aicte", "mca"]);
    const aicte = selected.find((s) => s.resource.id === "aicte");
    expect(aicte?.matchedTerm).toBe("AICTE");
  });

  it("does not include aicte for partial word matches like 'Aicted'", () => {
    const selected = selectResources([], "The student was Aicted by the mentor.");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "mca"]);
  });

  it("includes ncs when text contains word NCS or National Career Service and populates matchedTerm", () => {
    const selectedWithNCS = selectResources([], "Found on the NCS portal.");
    expect(selectedWithNCS.map((s) => s.resource.id)).toEqual(["cybercrime", "ncs", "mca"]);
    const ncsItem = selectedWithNCS.find((s) => s.resource.id === "ncs");
    expect(ncsItem?.matchedTerm).toBe("NCS");

    const selectedWithFullName = selectResources(
      [],
      "Post verified via National Career Service database."
    );
    expect(selectedWithFullName.map((s) => s.resource.id)).toEqual([
      "cybercrime",
      "ncs",
      "mca",
    ]);
    const ncsFullNameItem = selectedWithFullName.find((s) => s.resource.id === "ncs");
    expect(ncsFullNameItem?.matchedTerm).toBe("National Career Service");
  });

  it("selects NCS card with matchedTerm 'NCS' when text is 'NCS Group offers a role'", () => {
    const selected = selectResources([], "NCS Group offers a role to the candidate.");
    const ncs = selected.find((s) => s.resource.id === "ncs");
    expect(ncs).toBeDefined();
    expect(ncs?.matchedTerm).toBe("NCS");
  });

  it("does not include ncs for partial word matches like 'NCSU'", () => {
    const selected = selectResources([], "Student studied at NCSU university.");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "mca"]);
  });

  it("returns stable order [cybercrime, aicte, ncs, mca] when all are triggered with matchedTerm for conditional cards", () => {
    const text = "AICTE affiliated programme partnered with National Career Service (NCS).";
    const selected = selectResources(["upfront_payment"], text);
    expect(selected.map((s) => s.resource.id)).toEqual([
      "cybercrime",
      "aicte",
      "ncs",
      "mca",
    ]);
    expect(selected[0].expanded).toBe(true);
    expect(selected[0].matchedTerm).toBeUndefined();
    expect(selected[1].matchedTerm).toBe("AICTE");
    expect(selected[2].matchedTerm).toBe("National Career Service");
    expect(selected[3].matchedTerm).toBeUndefined();
  });
});

describe("VERIFICATION_RESOURCES and allowed hostnames", () => {
  const ALLOWED_HOSTS = new Set([
    "internship.aicte-india.org",
    "aicte-india.org",
    "ncs.gov.in",
    "www.ncs.gov.in",
    "mca.gov.in",
    "www.mca.gov.in",
    "cybercrime.gov.in",
  ]);

  it("contains exactly the four official verification resources", async () => {
    const { VERIFICATION_RESOURCES } = await import("@/data/verification-resources");
    expect(VERIFICATION_RESOURCES.map((r) => r.id)).toEqual([
      "cybercrime",
      "aicte",
      "ncs",
      "mca",
    ]);
  });

  it("ensures every resource has HTTPS sourceUrl within allowed government hostnames", async () => {
    const { VERIFICATION_RESOURCES } = await import("@/data/verification-resources");
    for (const res of VERIFICATION_RESOURCES) {
      expect(res.sourceUrl.startsWith("https://")).toBe(true);
      const url = new URL(res.sourceUrl);
      expect(ALLOWED_HOSTS.has(url.hostname)).toBe(true);
      expect(res.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("ensures all link action URLs use HTTPS and are strictly within allowed host list", async () => {
    const { VERIFICATION_RESOURCES } = await import("@/data/verification-resources");
    for (const res of VERIFICATION_RESOURCES) {
      for (const action of res.actions) {
        if (action.type === "link") {
          expect(action.value.startsWith("https://")).toBe(true);
          const parsed = new URL(action.value);
          expect(ALLOWED_HOSTS.has(parsed.hostname)).toBe(true);
        } else if (action.type === "email") {
          expect(action.value).toMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
        } else if (action.type === "phone") {
          expect(action.value).toMatch(/^\d{3,10}$/);
        }
      }
    }
  });
});

describe("Resources page structure and post-payment steps", () => {
  it("exports POST_PAYMENT_STEPS with exactly 4 calm, numbered steps with exact required text", async () => {
    const { POST_PAYMENT_STEPS } = await import("@/data/post-payment-steps");
    expect(POST_PAYMENT_STEPS).toHaveLength(4);
    expect(POST_PAYMENT_STEPS).toEqual([
      {
        step: 1,
        text: "Contact your bank or payment provider as soon as you can.",
      },
      {
        step: 2,
        text: "Report the incident on the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call the 1930 helpline.",
      },
      {
        step: 3,
        text: "Keep screenshots, messages and payment proofs.",
      },
      {
        step: 4,
        text: "Avoid sending more money or documents until you have confirmed the offer independently.",
      },
    ]);
  });

  it("ensures user-facing text of /resources, post-payment steps, and FAQ contains none of the forbidden words", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const forbiddenWords = [
      "freeze",
      "dispute",
      "statutory",
      "immediately",
      "police report",
    ];

    const filesToCheck = [
      path.resolve(process.cwd(), "src/data/post-payment-steps.ts"),
      path.resolve(process.cwd(), "src/app/resources/page.tsx"),
      path.resolve(process.cwd(), "src/components/landing/FaqSection.tsx"),
    ];

    for (const file of filesToCheck) {
      const content = fs.readFileSync(file, "utf8").toLowerCase();
      for (const word of forbiddenWords) {
        expect(content).not.toContain(word.toLowerCase());
      }
    }
  });

  it("ensures MCA action links to exact verified URL with label 'Open the MCA company or LLP name search'", async () => {
    const { VERIFICATION_RESOURCES } = await import("@/data/verification-resources");
    const mca = VERIFICATION_RESOURCES.find((r) => r.id === "mca");
    expect(mca).toBeDefined();
    const linkAction = mca?.actions.find((a) => a.type === "link");
    expect(linkAction?.label).toBe("Open the MCA company or LLP name search");
    expect(linkAction?.value).toBe(
      "https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html"
    );
  });

  it("parses docs/resources-verification.md and asserts each verified URL appears in the data", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const { VERIFICATION_RESOURCES } = await import("@/data/verification-resources");

    const recordPath = path.resolve(process.cwd(), "docs/resources-verification.md");
    const content = fs.readFileSync(recordPath, "utf-8");

    const urlMatches = Array.from(
      content.matchAll(/-\s+\*\*Verified URL:\*\*\s+`([^`]+)`/g)
    ).map((m) => m[1]);

    expect(urlMatches.length).toBeGreaterThanOrEqual(4);

    const allDataUrls = new Set<string>();
    for (const r of VERIFICATION_RESOURCES) {
      allDataUrls.add(r.sourceUrl);
      for (const a of r.actions) {
        if (a.type === "link") {
          allDataUrls.add(a.value);
        }
      }
    }

    for (const expectedUrl of urlMatches) {
      expect(
        allDataUrls.has(expectedUrl),
        `Expected verified URL "${expectedUrl}" from docs/resources-verification.md to exist in VERIFICATION_RESOURCES`
      ).toBe(true);
    }
  });

  it("ensures Privacy links in UI navigate to the /privacy route", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const filesWithPrivacyLink = [
      path.resolve(process.cwd(), "src/app/resources/page.tsx"),
      path.resolve(process.cwd(), "src/components/landing/LandingFooter.tsx"),
      path.resolve(process.cwd(), "src/components/landing/PrivacySection.tsx"),
      path.resolve(process.cwd(), "src/app/check/CheckClient.tsx"),
    ];

    for (const file of filesWithPrivacyLink) {
      const fileContent = fs.readFileSync(file, "utf8");
      expect(
        fileContent.includes('href="/privacy"'),
        `Expected ${file} to contain Link with href="/privacy"`
      ).toBe(true);
    }
  });

  it("verifies click-to-load video embeds and questionnaire architecture on /resources (Milestone Q3)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const resourcesPagePath = path.resolve(process.cwd(), "src/app/resources/page.tsx");
    const afterPaymentCardPath = path.resolve(
      process.cwd(),
      "src/components/resources/AfterPaymentCard.tsx"
    );
    const clickToLoadVideoPath = path.resolve(
      process.cwd(),
      "src/components/resources/ClickToLoadVideo.tsx"
    );

    expect(fs.existsSync(resourcesPagePath)).toBe(true);
    expect(fs.existsSync(afterPaymentCardPath)).toBe(true);
    expect(fs.existsSync(clickToLoadVideoPath)).toBe(true);

    const resourcesContent = fs.readFileSync(resourcesPagePath, "utf-8");
    const afterPaymentContent = fs.readFileSync(afterPaymentCardPath, "utf-8");
    const videoContent = fs.readFileSync(clickToLoadVideoPath, "utf-8");

    // Video IDs
    expect(resourcesContent).toContain("Kr-B8sAE6ek");
    expect(afterPaymentContent).toContain("3S47zE8cWCI");

    // Direct YouTube thumbnail and links (not played on website)
    expect(videoContent).toContain("https://img.youtube.com/vi/");
    expect(videoContent).toContain("https://www.youtube.com/");
    expect(videoContent).not.toContain("<iframe");
    expect(videoContent).toContain("loading=\"lazy\"");
    expect(videoContent).toContain("target=\"_blank\"");

    // ID already-paid exists
    expect(afterPaymentContent).toContain('id="already-paid"');

    // Questionnaire questions present
    expect(afterPaymentContent).toContain("What did they tell you that you were getting?");
    expect(afterPaymentContent).toContain("What exactly did you pay for?");
    expect(afterPaymentContent).toContain("Did they promise an internship, stipend or job after the course?");
    expect(afterPaymentContent).toContain("What documents did you share?");
  });
});
