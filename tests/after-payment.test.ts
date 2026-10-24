import { describe, it, expect } from "vitest";
import {
  normalizeQuestionnaireAnswers,
  buildAfterPaymentChecklist,
  QuestionnaireAnswers,
  Q1Option,
  Q2Option,
  Q3Option,
  Q4Option,
} from "@/lib/resources/after-payment";

describe("After-payment questionnaire normalization (Milestone Q3)", () => {
  it("enforces mutual exclusivity for nothing_yet in Q2", () => {
    const raw: QuestionnaireAnswers = {
      q1: "internship_or_job",
      q2: ["nothing_yet", "training_fee"],
      q3: "no",
      q4: ["nothing_sensitive"],
    };

    const norm = normalizeQuestionnaireAnswers(raw);
    expect(norm.q2).not.toContain("nothing_yet");
    expect(norm.q2).toContain("training_fee");
  });

  it("enforces mutual exclusivity for nothing_sensitive in Q4", () => {
    const raw: QuestionnaireAnswers = {
      q1: "course_or_training",
      q2: ["nothing_yet"],
      q3: "not_sure",
      q4: ["nothing_sensitive", "aadhaar_pan_or_id"],
    };

    const norm = normalizeQuestionnaireAnswers(raw);
    expect(norm.q4).not.toContain("nothing_sensitive");
    expect(norm.q4).toContain("aadhaar_pan_or_id");
  });

  it("defaults empty arrays to safe neutral options", () => {
    const raw: QuestionnaireAnswers = {
      q1: "internship_plus_training",
      q2: [],
      q3: "yes_in_writing",
      q4: [],
    };

    const norm = normalizeQuestionnaireAnswers(raw);
    expect(norm.q2).toEqual(["nothing_yet"]);
    expect(norm.q4).toEqual(["nothing_sensitive"]);
  });
});

describe("Deterministic checklist generation rules and priorities", () => {
  it("places bank contact first in doNow if OTP, UPI PIN, card details, or remote app was shared", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "internship_or_job",
      q2: ["registration_fee"],
      q3: "no",
      q4: ["otp_pin_card_or_remote_app"],
    });

    expect(checklist.doNow.length).toBeGreaterThan(0);
    expect(checklist.doNow[0].id).toBe("do-contact-bank-shared-credentials");
    expect(checklist.doNow[0].title).toBe(
      "Contact your bank or payment provider as soon as you can and tell them what you shared"
    );
  });

  it("includes bank contact and avoiding more payments if any payment was made", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "internship_or_job",
      q2: ["registration_fee"],
      q3: "no",
      q4: ["nothing_sensitive"],
    });

    const contactBank = checklist.doNow.find((i) => i.id === "do-contact-bank-payment");
    const avoidMore = checklist.doNow.find((i) => i.id === "do-avoid-more-payments");

    expect(contactBank).toBeDefined();
    expect(avoidMore).toBeDefined();
  });

  it("includes cybercrime reporting when payment was made or sensitive documents were shared", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "internship_or_job",
      q2: ["security_deposit"],
      q3: "no",
      q4: ["bank_details_or_cheque"],
    });

    expect(checklist.report.length).toBeGreaterThan(0);
    const reportItem = checklist.report.find((i) => i.id === "rep-cybercrime");
    expect(reportItem).toBeDefined();
    expect(reportItem?.title).toBe("Report the incident on cybercrime.gov.in or call 1930");
  });

  it("includes keeping screenshots and payment proofs when anything paid or shared", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "not_clear",
      q2: ["laptop_or_software_fee"],
      q3: "no",
      q4: ["resume_only"],
    });

    expect(checklist.keepEvidence.length).toBeGreaterThan(0);
    const evItem = checklist.keepEvidence.find((i) => i.id === "ev-keep-screenshots");
    expect(evItem).toBeDefined();
  });

  it("includes course vs internship distinction and advisories link when training fee is present", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "internship_plus_training",
      q2: ["training_fee"],
      q3: "not_sure",
      q4: ["nothing_sensitive"],
    });

    expect(checklist.askOrCheck.length).toBeGreaterThan(0);
    const courseItem = checklist.askOrCheck.find((i) => i.id === "ask-course-vs-internship");
    expect(courseItem).toBeDefined();
    expect(courseItem?.title).toContain("A paid course is a different thing from an internship or job");
  });

  it("includes asking for promise in writing when promise was verbal or on WhatsApp", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "course_or_training",
      q2: ["training_fee"],
      q3: "yes_verbal_or_whatsapp",
      q4: ["nothing_sensitive"],
    });

    const verbalItem = checklist.askOrCheck.find((i) => i.id === "ask-written-promise");
    expect(verbalItem).toBeDefined();
    expect(verbalItem?.title).toBe(
      "Ask for the promise in writing and save the messages where it was made. Do not rely on a verbal promise."
    );
  });

  it("includes keeping written promise with payment proof when clearly in writing", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "course_or_training",
      q2: ["training_fee"],
      q3: "yes_in_writing",
      q4: ["nothing_sensitive"],
    });

    const writtenItem = checklist.keepEvidence.find((i) => i.id === "ev-written-promise");
    expect(writtenItem).toBeDefined();
    expect(writtenItem?.title).toBe("Keep the written document together with the payment proof");
  });

  it("includes deposit refund terms in writing when security deposit was paid", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "internship_or_job",
      q2: ["security_deposit"],
      q3: "no",
      q4: ["nothing_sensitive"],
    });

    const depositItem = checklist.askOrCheck.find((i) => i.id === "ask-deposit-refund-terms");
    expect(depositItem).toBeDefined();
    expect(depositItem?.title).toBe("Ask for the refund terms in writing and note the date and amount.");
  });

  it("includes UIDAI Aadhaar biometric lock when ID was shared", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "internship_or_job",
      q2: ["nothing_yet"],
      q3: "no",
      q4: ["aadhaar_pan_or_id"],
    });

    expect(checklist.protectAccounts.length).toBeGreaterThan(0);
    const aadhaarItem = checklist.protectAccounts.find((i) => i.id === "prot-aadhaar-biometric-lock");
    expect(aadhaarItem).toBeDefined();
    expect(aadhaarItem?.sourceUrl).toBe("https://resident.uidai.gov.in/aadhaar-lockunlock");
    expect(aadhaarItem?.checkedDate).toBe("Checked 23 Oct 2026");
  });

  it("shows reassuring neutral guidance if nothing was paid and nothing sensitive shared", () => {
    const checklist = buildAfterPaymentChecklist({
      q1: "internship_or_job",
      q2: ["nothing_yet"],
      q3: "no",
      q4: ["nothing_sensitive"],
    });

    const neutralItem = checklist.doNow.find((i) => i.id === "do-confirm-independently");
    expect(neutralItem).toBeDefined();
    expect(neutralItem?.title).toContain("No payment or sensitive document was shared in your answers");
    expect(checklist.report).toHaveLength(0);
    expect(checklist.protectAccounts).toHaveLength(0);
  });
});

describe("Exhaustive option space property check and banned words audit", () => {
  const q1Options: Q1Option[] = [
    "internship_or_job",
    "course_or_training",
    "internship_plus_training",
    "not_clear",
  ];
  const q2Options: Q2Option[] = [
    "registration_fee",
    "training_fee",
    "security_deposit",
    "laptop_or_software_fee",
    "nothing_yet",
  ];
  const q3Options: Q3Option[] = [
    "yes_in_writing",
    "yes_verbal_or_whatsapp",
    "no",
    "not_sure",
  ];
  const q4Options: Q4Option[] = [
    "nothing_sensitive",
    "resume_only",
    "aadhaar_pan_or_id",
    "bank_details_or_cheque",
    "otp_pin_card_or_remote_app",
  ];

  const BANNED_REGEX = /\b(scam|scammer|fraud|fraudulent|cheated|immediately|freeze|dispute)\b/i;

  it("ensures every answer combination produces a valid checklist with zero banned words", () => {
    for (const q1 of q1Options) {
      for (const q2 of q2Options) {
        for (const q3 of q3Options) {
          for (const q4 of q4Options) {
            const checklist = buildAfterPaymentChecklist({
              q1,
              q2: [q2],
              q3,
              q4: [q4],
            });

            // Must produce an object with arrays
            expect(Array.isArray(checklist.doNow)).toBe(true);
            expect(Array.isArray(checklist.keepEvidence)).toBe(true);
            expect(Array.isArray(checklist.askOrCheck)).toBe(true);
            expect(Array.isArray(checklist.report)).toBe(true);
            expect(Array.isArray(checklist.protectAccounts)).toBe(true);

            // Audit all generated text against banned words
            const allItems = [
              ...checklist.doNow,
              ...checklist.keepEvidence,
              ...checklist.askOrCheck,
              ...checklist.report,
              ...checklist.protectAccounts,
            ];

            for (const item of allItems) {
              expect(item.title).not.toMatch(BANNED_REGEX);
              expect(item.description).not.toMatch(BANNED_REGEX);
              if (item.sourceLabel) {
                expect(item.sourceLabel).not.toMatch(BANNED_REGEX);
              }
            }
          }
        }
      }
    }
  });
});
