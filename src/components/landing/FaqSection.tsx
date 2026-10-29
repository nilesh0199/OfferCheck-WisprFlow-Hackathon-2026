import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { splitIntoColumns } from "@/lib/faq";

export function FaqSection() {
  const faqs = [
    {
      q: "Is OfferClara free to use?",
      a: "Yes. OfferClara is completely free to use with no subscription plans, paid tiers, or account creation.",
    },
    {
      q: "Is my offer stored on your servers?",
      a: "No. OfferClara stores zero offer text or uploaded files in any database, disk, or cookie. The files, transcribed text, and results live strictly in your active browser tab's memory and are discarded when you refresh or close the tab.",
    },
    {
      q: "Can I upload screenshots or PDFs?",
      a: "Yes. You can paste text, attach files, or both. You can upload up to 5 screenshots (PNG, JPEG, WebP) or PDF documents up to 4 MB total. Text read from files is added below any text already in the editor, letting you review and edit before analyzing.",
    },
    {
      q: "Can OfferClara tell me whether a company is real?",
      a: "No. OfferClara reviews the text of the offer you paste and does not verify companies itself. It cannot perform background checks or confirm identity. However, OfferClara can prepare a structured, neutral research prompt from confirmed company details for you to run in an external assistant like Perplexity, and guides you to the official Ministry of Corporate Affairs (MCA) registry.",
    },
    {
      q: "What if the tool finds no concerns?",
      a: "'No concerns identified' must not be interpreted as 'safe' or 'verified'. Messages can copy official or common offer templates word for word. Confirm the offer through official company communication channels.",
    },
    {
      q: "What should I know about courses or training sold as 'guaranteed internships'?",
      a: "A common pattern in student recruitment is offering an 'internship' that requires paying upfront for a 1- or 2-month training program, course, or certification before any internship or stipend begins. Dubious solicitors often mention prestigious institutions like IITs, NITs, or major tech companies to look authentic. While legitimate training courses exist, genuine employers do not charge candidates for training to hire them. This is why independently verifying the entity on official registries like MCA and institutional portals is critical before transferring money.",
      linkHref: "/resources",
      linkLabel: "View verified institutional advisories",
    },
    {
      q: "What should I do if I have already paid or shared documents?",
      a: "Contact your bank or payment provider as soon as you can, and report the incident on the National Cyber Crime Reporting Portal (cybercrime.gov.in) or by calling 1930. Keep screenshots, messages and payment proofs, and avoid sending more money or documents until you have confirmed the offer independently. This is general guidance, not legal advice.",
      linkHref: "/resources",
      linkLabel: "Official resources and reporting links",
    },
  ];

  const [leftFaqs, rightFaqs] = splitIntoColumns(faqs);

  const renderFaqCard = (faq: typeof faqs[0], idx: number) => (
    <details
      key={idx}
      className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 transition-colors shadow-xs w-full text-left"
    >
      <summary className="flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[var(--text)] cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg py-1 min-h-[44px]">
        <span>{faq.q}</span>
        <svg
          className="w-4 h-4 text-[var(--text-muted)] group-open:rotate-180 transition-transform duration-200 motion-reduce:transition-none shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="mt-3 pt-3 border-t border-[var(--border)] text-sm text-[var(--text-muted)] leading-relaxed space-y-3">
        <p>{faq.a}</p>
        {faq.linkHref && (
          <p>
            <Link
              href={faq.linkHref}
              className="inline-flex items-center text-xs font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
            >
              {faq.linkLabel}
            </Link>
          </p>
        )}
      </div>
    </details>
  );

  return (
    <section
      id="faq"
      className="scroll-mt-16 sm:scroll-mt-20 py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--color-canvas)] transition-colors"
    >
      <Container className="space-y-12">
        <div className="space-y-3 text-left">
          <h2 className="text-2xl sm:text-3xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
            Frequently asked questions
          </h2>
          <p className="text-[1.0625rem] text-[var(--text-muted)] leading-relaxed max-w-2xl">
            Straightforward answers about how the tool works and how your data is handled.
          </p>
        </div>

        {/* Mobile / Tablet (< 1024px): Single flex column in original sequential order */}
        <div className="flex flex-col gap-4 lg:hidden w-full items-start">
          {faqs.map((faq, idx) => renderFaqCard(faq, idx))}
        </div>

        {/* Desktop (>= 1024px): Two completely independent flex columns */}
        <div className="hidden lg:flex gap-6 items-start w-full">
          <div className="flex flex-col gap-4 flex-1 items-start min-w-0">
            {leftFaqs.map((faq, idx) => renderFaqCard(faq, idx))}
          </div>
          <div className="flex flex-col gap-4 flex-1 items-start min-w-0">
            {rightFaqs.map((faq, idx) => renderFaqCard(faq, idx + leftFaqs.length))}
          </div>
        </div>
      </Container>
    </section>
  );
}

