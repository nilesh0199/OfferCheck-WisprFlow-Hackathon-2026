import { describe, it, expect } from "vitest";
import { validateAnalysis } from "@/lib/analysis/validate-result";
import { ModelOutput } from "@/lib/analysis/schema";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";

describe("validateAnalysis", () => {
  const sampleSourceText =
    "Dear Student, congratulations on your offer. A refundable deposit of ₹4,500 is required within 24 hours. Contact us at recruiter@example.com.";

  it("drops concerns with fabricated quotes and increments droppedCount", () => {
    // Hand-written MOCK output with a fabricated quote
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "concern-real",
          category: "refundable_deposit",
          observation: "Mentions refundable deposit.",
          interpretation: "Upfront deposits are high-risk.",
          quote: "refundable deposit of ₹4,500",
        },
        {
          id: "concern-fake",
          category: "upfront_payment",
          observation: "Mentions paying for a training certificate.",
          interpretation: "Training certificates shouldn't be paid for.",
          quote: "pay for mandatory certification fee of ₹10,000", // fabricated!
        },
      ],
      missingInfo: [],
      verificationQuestions: [],
    };

    const validated = validateAnalysis(mockOutput, sampleSourceText);
    expect(validated.concerns.length).toBe(1);
    expect(validated.concerns[0].id).toBe("concern-real");
    expect(validated.concerns[0].span).toBeDefined();
    expect(validated.droppedCount).toBe(1);
  });

  it("drops items that trip overclaiming guardrails and increments droppedCount", () => {
    // Hand-written MOCK output where interpretation trips guardrails
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "c-1",
          category: "refundable_deposit",
          observation: "Mentions refundable deposit.",
          interpretation: "This is definitely a scam and fraud.", // trips guardrails!
          quote: "refundable deposit of ₹4,500",
        },
      ],
      missingInfo: [
        {
          id: "m-1",
          topic: "stipend_or_pay",
          note: "This offer is guaranteed safe despite missing pay info.", // trips guardrails!
        },
      ],
      verificationQuestions: [
        {
          id: "q-1",
          question: "Can you confirm if there is an 85% probability of a stipend?", // trips guardrails!
        },
      ],
      overallNote: "The employer is verified safe by our checks.", // trips guardrails!
    };

    const validated = validateAnalysis(mockOutput, sampleSourceText);
    expect(validated.concerns.length).toBe(0);
    expect(validated.missingInfo.length).toBe(0);
    expect(validated.verificationQuestions.length).toBe(0);
    expect(validated.overallNote).toBeUndefined();
    // 1 concern + 1 missingInfo + 1 question + 1 overallNote = 4 dropped
    expect(validated.droppedCount).toBe(4);
  });

  it("removes only the invalid relatedQuote from missingInfo without dropping the item", () => {
    // Hand-written MOCK output where relatedQuote is not found in source text
    const mockOutput: ModelOutput = {
      concerns: [],
      missingInfo: [
        {
          id: "m-1",
          topic: "working_hours",
          note: "Working hours are not stated in the provided text.",
          relatedQuote: "work hours are 9am to 5pm", // does not exist in sampleSourceText
        },
        {
          id: "m-2",
          topic: "selection_process",
          note: "Selection criteria are not stated in the provided text.",
          // no relatedQuote
        },
      ],
      verificationQuestions: [],
    };

    const validated = validateAnalysis(mockOutput, sampleSourceText);
    expect(validated.missingInfo.length).toBe(2);
    expect(validated.missingInfo[0].relatedQuote).toBeUndefined();
    expect(validated.missingInfo[1].relatedQuote).toBeUndefined();
    expect(validated.droppedCount).toBe(0);
  });

  it("clears relatedConcernId on questions when their referenced concern is dropped", () => {
    // Hand-written MOCK output where question references a concern that gets dropped
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "c-fake",
          category: "upfront_payment",
          observation: "Fabricated observation",
          interpretation: "Fabricated interpretation",
          quote: "non-existent quote text",
        },
        {
          id: "c-kept",
          category: "refundable_deposit",
          observation: "Mentions deposit",
          interpretation: "Deposit requires caution",
          quote: "refundable deposit of ₹4,500",
        },
      ],
      missingInfo: [],
      verificationQuestions: [
        {
          id: "q-1",
          question: "What is this fee for?",
          relatedConcernId: "c-fake", // references dropped concern!
        },
        {
          id: "q-2",
          question: "When is the deposit returned?",
          relatedConcernId: "c-kept", // references kept concern
        },
      ],
    };

    const validated = validateAnalysis(mockOutput, sampleSourceText);
    expect(validated.concerns.length).toBe(1);
    expect(validated.droppedCount).toBe(1);

    expect(validated.verificationQuestions.length).toBe(2);
    // Referenced dropped concern -> cleared to undefined
    expect(validated.verificationQuestions[0].relatedConcernId).toBeUndefined();
    // Referenced kept concern -> preserved
    expect(validated.verificationQuestions[1].relatedConcernId).toBe("c-kept");
  });

  it("always attaches the immutable limits of the review including call/conversation description limit", () => {
    const mockOutput: ModelOutput = {
      concerns: [],
      missingInfo: [],
      verificationQuestions: [],
    };
    const validated = validateAnalysis(mockOutput, sampleSourceText);
    expect(validated.limits).toBeDefined();
    expect(validated.limits.length).toBeGreaterThanOrEqual(4);
    expect(validated.limits.some((l) => l.includes("Reviews supplied text only"))).toBe(true);
    expect(validated.limits.some((l) => l.includes("Cannot establish"))).toBe(true);
    expect(validated.limits.some((l) => l.includes("Absence of identified warnings"))).toBe(true);
    expect(
      validated.limits.some((l) =>
        l.includes(
          "OfferClara makes no claim about any named organisation; verify independently through official channels."
        )
      )
    ).toBe(true);
    expect(
      validated.limits.some((l) =>
        l.includes(
          "If the text is your own description of a call or conversation, the review reflects your description, not a recording or a document."
        )
      )
    ).toBe(true);
  });

  it("drops any concern whose quote contains a source marker line and increments droppedCount", () => {
    const textWithMarker =
      "Initial user text.\n---- Text from Screenshot 1 ----\nStipend is 20,000 INR.";
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "c-marker-1",
          category: "other",
          observation: "Quoted a source marker.",
          interpretation: "This should be dropped.",
          quote: "---- Text from Screenshot 1 ----",
        },
        {
          id: "c-valid-1",
          category: "other",
          observation: "Quoted actual offer text.",
          interpretation: "This is valid.",
          quote: "Stipend is 20,000 INR.",
        },
      ],
      missingInfo: [
        {
          id: "m-1",
          topic: "responsibilities",
          note: "Roles not stated.",
          relatedQuote: "---- Text from Screenshot 1 ----",
        },
      ],
      verificationQuestions: [],
    };

    const validated = validateAnalysis(mockOutput, textWithMarker);
    expect(validated.droppedCount).toBe(1);
    expect(validated.concerns).toHaveLength(1);
    expect(validated.concerns[0].id).toBe("c-valid-1");
    expect(validated.missingInfo).toHaveLength(1);
    expect(validated.missingInfo[0].relatedQuote).toBeUndefined(); // Marker relatedQuote stripped
  });

  it("case (a): 'as soon as possible.' (payment_urgency) nested in a longer sensitive_information_request quote is still dropped", () => {
    const text =
      "To proceed with the onboarding process, our desk requires you to send over your standard documents for verification as soon as possible.";
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "c-longer",
          category: "sensitive_information_request",
          observation: "Desk requests standard documents as soon as possible.",
          interpretation: "Requests for documents with short deadlines should be verified.",
          quote:
            "send over your standard documents for verification as soon as possible.",
        },
        {
          id: "c-nested",
          category: "payment_urgency",
          observation: "Urgency phrase used.",
          interpretation: "Time pressure should be noted.",
          quote: "as soon as possible.",
        },
      ],
      missingInfo: [],
      verificationQuestions: [
        {
          id: "q-nested",
          question: "Can you confirm the deadline?",
          relatedConcernId: "c-nested", // Points to the nested concern that will be dropped
        },
      ],
    };

    const validated = validateAnalysis(mockOutput, text);
    // The shorter nested quote is dropped, the longer enclosing quote is kept
    expect(validated.concerns.length).toBe(1);
    expect(validated.concerns[0].id).toBe("c-longer");
    // Does NOT count as a dropped error
    expect(validated.droppedCount).toBe(0);
    // Question reference pointing to dropped nested concern is safely cleared
    expect(validated.verificationQuestions[0].relatedConcernId).toBeUndefined();
  });

  it("case (b): a short refundable_deposit quote nested in a longer 'other' quote is KEPT, both appear, droppedCount unchanged", () => {
    const text =
      "All interns must complete the onboarding procedure including a refundable deposit of ₹5,000 before equipment shipment.";
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "c-enclosing-other",
          category: "other",
          observation: "Onboarding procedure mentioned.",
          interpretation: "Check the procedure requirements.",
          quote:
            "complete the onboarding procedure including a refundable deposit of ₹5,000 before equipment shipment.",
        },
        {
          id: "c-nested-deposit",
          category: "refundable_deposit",
          observation: "Security deposit required.",
          interpretation: "Security deposits are unusual for legitimate internships.",
          quote: "refundable deposit of ₹5,000",
        },
      ],
      missingInfo: [],
      verificationQuestions: [
        {
          id: "q-deposit",
          question: "Why is a deposit required?",
          relatedConcernId: "c-nested-deposit",
        },
      ],
    };

    const validated = validateAnalysis(mockOutput, text);
    // Both concerns are kept!
    expect(validated.concerns.length).toBe(2);
    expect(validated.concerns.map((c) => c.id)).toEqual([
      "c-enclosing-other",
      "c-nested-deposit",
    ]);
    expect(validated.droppedCount).toBe(0);
    // Question reference pointing to the nested refundable_deposit is preserved
    expect(validated.verificationQuestions[0].relatedConcernId).toBe(
      "c-nested-deposit"
    );
  });

  it("case (c): exact duplicates still collapse to one", () => {
    const text = "A refundable deposit of ₹5,000 is required before onboarding.";
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "c-first",
          category: "refundable_deposit",
          observation: "Deposit requested.",
          interpretation: "Deposits are unusual.",
          quote: "refundable deposit of ₹5,000",
        },
        {
          id: "c-dup",
          category: "refundable_deposit",
          observation: "Deposit requested duplicate.",
          interpretation: "Deposits are unusual duplicate.",
          quote: "refundable deposit of ₹5,000",
        },
      ],
      missingInfo: [],
      verificationQuestions: [],
    };

    const validated = validateAnalysis(mockOutput, text);
    expect(validated.concerns.length).toBe(1);
    expect(validated.concerns[0].id).toBe("c-first");
    expect(validated.droppedCount).toBe(0);
  });

  it("case (d): overlapping-but-not-nested spans keeps both", () => {
    const text = "Please remit the training fee and refundable laptop deposit today.";
    // Quote 1: "training fee and refundable laptop"
    // Quote 2: "refundable laptop deposit today."
    // These overlap on "refundable laptop", but neither contains the other.
    const mockOutput: ModelOutput = {
      concerns: [
        {
          id: "c-overlap-1",
          category: "other",
          observation: "Mentions training fee and laptop.",
          interpretation: "Note the training fee mention.",
          quote: "training fee and refundable laptop",
        },
        {
          id: "c-overlap-2",
          category: "other",
          observation: "Mentions laptop deposit today.",
          interpretation: "Note the deposit mention.",
          quote: "refundable laptop deposit today.",
        },
      ],
      missingInfo: [],
      verificationQuestions: [],
    };

    const validated = validateAnalysis(mockOutput, text);
    expect(validated.concerns.length).toBe(2);
    expect(validated.concerns.map((c) => c.id)).toEqual([
      "c-overlap-1",
      "c-overlap-2",
    ]);
    expect(validated.droppedCount).toBe(0);
  });

  describe("Valid mock outputs for each of the four synthetic examples pass with droppedCount = 0", () => {
    it("validates Example 1 (Urgent payment request)", () => {
      const ex1 = SYNTHETIC_EXAMPLES[0];
      // Hand-written MOCK model output matching verbatim phrases from Example 1
      const mockEx1: ModelOutput = {
        concerns: [
          {
            id: "c-ex1-deposit",
            category: "refundable_deposit",
            observation:
              "The text states that company policy requires a refundable equipment deposit of ₹4,500 before formal letter issuance.",
            interpretation:
              "Legitimate internships rarely request security deposits or upfront fees from students.",
            quote: "refundable equipment deposit of ₹4,500",
          },
          {
            id: "c-ex1-urgency",
            category: "payment_urgency",
            observation:
              "The email stipulates that the payment must be transferred within 24 hours to secure the slot.",
            interpretation:
              "Tight deadlines are often used to pressure recipients into acting without due diligence.",
            quote: "transfer this deposit to our account within 24 hours",
          },
        ],
        missingInfo: [
          {
            id: "m-ex1-location",
            topic: "work_mode_or_location",
            note: "The work location or remote modality is not stated in the provided text.",
          },
        ],
        verificationQuestions: [
          {
            id: "q-ex1-refund",
            question:
              "Could you provide official written documentation regarding the conditions and timeline for refunding the equipment deposit?",
            relatedConcernId: "c-ex1-deposit",
          },
        ],
        overallNote:
          "The provided text contains explicit requests for payment under short notice.",
      };

      const result = validateAnalysis(mockEx1, ex1.text);
      expect(result.droppedCount).toBe(0);
      expect(result.concerns.length).toBe(2);
      expect(result.missingInfo.length).toBe(1);
      expect(result.verificationQuestions.length).toBe(1);
    });

    it("validates Example 2 (Incomplete offer)", () => {
      const ex2 = SYNTHETIC_EXAMPLES[1];
      // Hand-written MOCK model output for Example 2
      const mockEx2: ModelOutput = {
        concerns: [],
        missingInfo: [
          {
            id: "m-ex2-stipend",
            topic: "stipend_or_pay",
            note: "Stipend amount or unpaid status is not stated in the provided text.",
          },
          {
            id: "m-ex2-hours",
            topic: "working_hours",
            note: "Expected working hours are not stated in the provided text.",
          },
          {
            id: "m-ex2-start",
            topic: "start_date",
            note: "The internship start date is not stated in the provided text.",
          },
        ],
        verificationQuestions: [
          {
            id: "q-ex2-terms",
            question:
              "Could you share details regarding the working hours, expected start date, and whether this role includes a monthly stipend?",
          },
        ],
        overallNote:
          "The offer letter lacks foundational operational terms, but requests no upfront payments.",
      };

      const result = validateAnalysis(mockEx2, ex2.text);
      expect(result.droppedCount).toBe(0);
      expect(result.concerns.length).toBe(0);
      expect(result.missingInfo.length).toBe(3);
      expect(result.verificationQuestions.length).toBe(1);
    });

    it("validates Example 3 (Detailed offer with no upfront payment)", () => {
      const ex3 = SYNTHETIC_EXAMPLES[2];
      // Hand-written MOCK model output for Example 3
      const mockEx3: ModelOutput = {
        concerns: [],
        missingInfo: [],
        verificationQuestions: [
          {
            id: "q-ex3-onboarding",
            question:
              "Are there specific identification or tax forms I should prepare for the first day at the laboratory?",
          },
        ],
        overallNote:
          "The provided text provides specific terms regarding compensation, reporting structure, and location.",
      };

      const result = validateAnalysis(mockEx3, ex3.text);
      expect(result.droppedCount).toBe(0);
      expect(result.concerns.length).toBe(0);
      expect(result.verificationQuestions.length).toBe(1);
    });

    it("validates Example 4 (Ambiguous with insufficient evidence)", () => {
      const ex4 = SYNTHETIC_EXAMPLES[3];
      // Hand-written MOCK model output for Example 4
      const mockEx4: ModelOutput = {
        concerns: [
          {
            id: "c-ex4-docs",
            category: "sensitive_information_request",
            observation:
              "The text asks the applicant to send standard documents for verification without defining which documents are required.",
            interpretation:
              "Submitting personal documents before clarifying their nature and purpose warrants caution.",
            quote: "requires you to send over your standard documents for verification",
          },
        ],
        missingInfo: [
          {
            id: "m-ex4-scope",
            topic: "responsibilities",
            note: "Specific project responsibilities and duties are not stated in the provided text.",
          },
        ],
        verificationQuestions: [
          {
            id: "q-ex4-doclist",
            question:
              "Which specific documents are needed for onboarding verification, and how will they be stored securely?",
            relatedConcernId: "c-ex4-docs",
          },
        ],
        overallNote:
          "There is insufficient information in the text to evaluate the terms of the engagement.",
      };

      const result = validateAnalysis(mockEx4, ex4.text);
      expect(result.droppedCount).toBe(0);
      expect(result.concerns.length).toBe(1);
      expect(result.missingInfo.length).toBe(1);
      expect(result.verificationQuestions.length).toBe(1);
    });
  });

  describe("Entity validation (companyName and roleTitle)", () => {
    const sampleText =
      "Congratulations on your selection for the Cloud Engineering Internship at AetherFlume Cloud Technologies Pvt. Ltd.";

    const baseMock: ModelOutput = {
      concerns: [],
      missingInfo: [],
      verificationQuestions: [],
    };

    it("keeps entities that occur in source text", () => {
      const mock: ModelOutput = {
        ...baseMock,
        entities: {
          companyName: "AetherFlume Cloud Technologies Pvt. Ltd.",
          roleTitle: "Cloud Engineering Internship",
        },
      };

      const result = validateAnalysis(mock, sampleText);
      expect(result.entities).toBeDefined();
      expect(result.entities?.companyName).toBe(
        "AetherFlume Cloud Technologies Pvt. Ltd."
      );
      expect(result.entities?.roleTitle).toBe("Cloud Engineering Internship");
      expect(result.droppedCount).toBe(0);
    });

    it("matches entities case-insensitively with collapsed whitespace", () => {
      const mock: ModelOutput = {
        ...baseMock,
        entities: {
          companyName: "  aetherflume   cloud technologies   pvt. ltd.  ",
          roleTitle: "cloud   engineering internship",
        },
      };

      const result = validateAnalysis(mock, sampleText);
      expect(result.entities?.companyName).toBe(
        "aetherflume   cloud technologies   pvt. ltd."
      );
      expect(result.entities?.roleTitle).toBe("cloud   engineering internship");
    });

    it("sets entity to null if it does not occur in source text", () => {
      const mock: ModelOutput = {
        ...baseMock,
        entities: {
          companyName: "Invented Impersonator Firm Inc.",
          roleTitle: "Chief Executive Intern",
        },
      };

      const result = validateAnalysis(mock, sampleText);
      expect(result.entities?.companyName).toBeNull();
      expect(result.entities?.roleTitle).toBeNull();
      // Entity mismatch sets to null and does NOT increment droppedCount
      expect(result.droppedCount).toBe(0);
    });

    it("sets entity to null when input is explicitly null", () => {
      const mock: ModelOutput = {
        ...baseMock,
        entities: {
          companyName: null,
          roleTitle: null,
        },
      };

      const result = validateAnalysis(mock, sampleText);
      expect(result.entities?.companyName).toBeNull();
      expect(result.entities?.roleTitle).toBeNull();
    });

    it("sets entity to null if length exceeds 100 characters even if text contains it", () => {
      const longName = "A".repeat(101);
      const textWithLong = `Welcome to ${longName}`;
      const mock: ModelOutput = {
        ...baseMock,
        entities: {
          companyName: longName,
          roleTitle: null,
        },
      };

      const result = validateAnalysis(mock, textWithLong);
      expect(result.entities?.companyName).toBeNull();
    });

    it("preserves backward compatibility when entities object is omitted", () => {
      const mock: ModelOutput = {
        ...baseMock,
      };

      const result = validateAnalysis(mock, sampleText);
      expect(result.entities).toBeUndefined();
    });

    it("validates mock analysis for Example 5 (phone call account) with zero droppedCount", () => {
      const ex5 = SYNTHETIC_EXAMPLES.find((e) => e.id === "example-5-phone-call-account")!;
      expect(ex5).toBeDefined();

      const mockOutput: ModelOutput = {
        concerns: [
          {
            id: "c-deposit",
            category: "refundable_deposit",
            observation: "The account describes a refundable registration fee of Rs 2,000 required before paperwork.",
            interpretation: "Genuine employers do not charge candidate registration fees.",
            quote: "refundable registration fee of Rs 2,000",
          },
          {
            id: "c-urgency",
            category: "payment_urgency",
            observation: "You describe a deadline of 6 pm today to secure the joining slot.",
            interpretation: "Short deadlines to pay are common pressure tactics.",
            quote: "if I do not pay the fee by 6 pm today, the slot will be given to another candidate",
          },
          {
            id: "c-sensitive",
            category: "sensitive_information_request",
            observation: "You describe requests for photos of your Aadhaar card and bank passbook.",
            interpretation: "Sensitive identity documents should only be shared after formal verified hiring.",
            quote: "photos of my Aadhaar card and the front page of my bank passbook",
          },
          {
            id: "c-channel",
            category: "off_platform_communication",
            observation: "You describe communication directed through WhatsApp.",
            interpretation: "Unofficial messaging channels should be verified with the company.",
            quote: "on WhatsApp",
          },
        ],
        missingInfo: [
          {
            id: "m-1",
            topic: "responsibilities",
            note: "Detailed daily responsibilities for the remote data entry role are not described.",
          },
        ],
        verificationQuestions: [
          {
            id: "q-1",
            question: "Can you provide a formal written contract before any fee or document submission?",
            relatedConcernId: "c-deposit",
          },
        ],
      };

      const validated = validateAnalysis(mockOutput, ex5.text);
      expect(validated.droppedCount).toBe(0);
      expect(validated.concerns).toHaveLength(4);
      expect(validated.concerns[0].span).toBeDefined();
      expect(validated.missingInfo).toHaveLength(1);
      expect(validated.verificationQuestions).toHaveLength(1);
    });
  });
});
