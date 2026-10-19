export interface SyntheticExample {
  id: string;
  title: string;
  label: "Synthetic example";
  text: string;
}

/**
 * Synthetic offer examples used for testing and evaluation.
 *
 * Rules:
 * - All company names, people, and addresses are strictly fictional with no resemblance to real firms.
 * - All phone numbers use dummy placeholders (+91 98000 0000X).
 * - All email addresses use reserved IANA domains (example.com, example.org, example.net).
 * - Word counts range from ~100 to 200 words.
 * - Example 3 deliberately contains NO payment-request words (deposit, fee, pay, etc.).
 */
export const SYNTHETIC_EXAMPLES: readonly SyntheticExample[] = [
  {
    id: "example-1-urgent-payment",
    title: "Payment request with urgency",
    label: "Synthetic example",
    text: `Dear Candidate,

Congratulations on your selection for the Cloud Engineering Internship at AetherFlume Cloud Technologies Pvt. Ltd. Your monthly stipend is ₹18,000 for a 3-month duration.

Before issuing your formal offer letter and scheduling orientation, company policy requires a refundable equipment deposit of ₹4,500. This security deposit covers your cloud workstation setup and development kit, and will be refunded in full with your first monthly stipend. Please transfer this deposit to our account within 24 hours to secure your internship slot, or your offer will be immediately allocated to the next waitlisted applicant. Payment instructions are attached below.

For questions, contact recruiter@example.com or reach out via WhatsApp at +91 98000 00000. Welcome aboard!`,
  },
  {
    id: "example-2-incomplete-offer",
    title: "Incomplete but not obviously suspicious",
    label: "Synthetic example",
    text: `Dear Student,

Following your technical interview, the engineering team at ToroidSpire Infrastructure Systems is impressed by your background and would like to offer you a position as a Frontend Developer Intern on our core web infrastructure team. You will be contributing to our user dashboard and participating in weekly sprint reviews. We are excited about what you can bring to the team.

Please let us know if you accept this offer so our talent acquisition team can prepare your onboarding paperwork. Formal documents and team introductions will follow once you confirm your intent to join. Reach out to talent@example.org or call +91 98000 00001 if you have general inquiries about our company culture.

Best regards,
The Talent Acquisition Team
ToroidSpire Infrastructure Systems`,
  },
  {
    id: "example-3-detailed-offer",
    title: "Detailed offer with no upfront payment request",
    label: "Synthetic example",
    text: `Dear Student,

We are pleased to extend an offer for the Robotics Software Engineering Internship at CobaltWharf Robotics Lab Inc. This is a 6-month full-time internship starting on November 10, 2026. Your working hours will be Monday through Friday, 9:30 AM to 5:30 PM at our innovation laboratory in Whitefield, Bengaluru.

A monthly stipend of ₹25,000 is credited directly to your bank account at the conclusion of each calendar month. Your assigned technical mentor will be Senior Systems Architect Dr. Aris Thorne. You will report directly to Engineering Director Maya Lin for sprint reviews. All workstations, hardware devboards, and software licenses are provided by the company on day one.

Please review the attached internship agreement and return a signed copy to mentorship@example.net by October 30, 2026.`,
  },
  {
    id: "example-4-ambiguous-offer",
    title: "Ambiguous with insufficient evidence",
    label: "Synthetic example",
    text: `Hello,

Congratulations on passing our preliminary review for the Business Operations Internship at LanternSpoke Venture Associates. We reviewed your profile and believe you could be a suitable match for our upcoming quarterly projects.

To proceed with the onboarding process and prepare your formal engagement file, our operations desk requires you to send over your standard documents for verification as soon as possible. Once the onboarding verification is complete, our administrative coordinator will provide additional context regarding project assignments and scheduling.

Please forward your scanned files to onboarding@example.org or message our desk at +91 98000 00002 with your confirmation.

Regards,
Operations Desk, LanternSpoke Venture Associates`,
  },
];
