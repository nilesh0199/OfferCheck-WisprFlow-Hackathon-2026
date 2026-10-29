import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { APP_NAME, TAGLINE } from "@/lib/config";
import { ExternalLinkIcon, GitHubIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: `About OfferClara — ${APP_NAME}`,
  description:
    "Why OfferClara was built, who built it, what it does, and what it does not do.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12 space-y-12">
        <Container className="space-y-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[var(--color-highlight)]" />
              <span>Project background and principles</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
              About {APP_NAME}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
              {TAGLINE} An evidence-linked review tool built to help students and job seekers spot common red flags in employment communications before paying money or sharing identity documents.
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto text-left">
            {/* Why the name OfferClara? */}
            <section
              id="why-the-name-offerclara"
              aria-labelledby="heading-why-the-name-offerclara"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-why-the-name-offerclara"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Why the name OfferClara?
              </h2>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] space-y-3.5 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 space-y-1.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs"
                    >
                      Offer
                    </span>
                    <p>
                      <strong className="text-[var(--text)] font-semibold">Offer</strong> represents the job and internship offers candidates receive.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 space-y-1.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs"
                    >
                      Clara
                    </span>
                    <p>
                      <strong className="text-[var(--text)] font-semibold">Clara</strong> represents clarity — helping people understand an offer, recognise potential red flags, and know what to verify before paying money or sharing documents.
                    </p>
                  </div>
                </div>

                <p className="pt-0.5 text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                  Together, <strong className="font-semibold text-[var(--color-primary)]">OfferClara</strong> means bringing clarity to every offer.
                </p>
              </div>
            </section>

            {/* 1. Why it exists */}
            <section
              id="why-it-exists"
              aria-labelledby="heading-why-it-exists"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-why-it-exists"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Why it exists
              </h2>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] space-y-3 leading-relaxed">
                <p>
                  Every year, thousands of college students, fresh graduates, and career changers across India and globally encounter deceptive employment practices. Dubious entities exploit candidates&apos; enthusiasm by asking for &quot;refundable training fees&quot;, &quot;laptop courier charges&quot;, &quot;registration deposits&quot;, or sensitive identity documents like Aadhaar cards and bank details.
                </p>
                <p>
                  Candidates often realize the issue only after sending money or sharing confidential papers. Traditional advice often says &quot;just be careful&quot; or &quot;do your research&quot;, which fails to give candidates concrete verification questions or explain why specific clauses are concerning.
                </p>
                <p>
                  OfferClara was created to turn vague anxiety into concrete, actionable steps. Furthermore, through voice-dictated navigation powered by Wispr Flow, users can navigate the review process completely hands-free, creating an accessible, rapid review experience for everyone.
                </p>
              </div>
            </section>

            {/* 2. What it does */}
            <section
              id="what-it-does"
              aria-labelledby="heading-what-it-does"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-what-it-does"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                What it does
              </h2>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] space-y-3 leading-relaxed">
                <p>
                  OfferClara provides a calm, systematic intake and review process for job and internship communications:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-[var(--text)]">Multi-step structured intake:</strong> An accessible 5-step wizard guides candidates through offer text, communication channel, sender details, interview history, and deposit requests.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Client-side privacy masking:</strong> On-device regex detection identifies sensitive personal details (names, phone numbers, emails, Aadhaar, PAN, UPI IDs) and provides an interactive visual scrubber in Step 5 to mask them before anything is sent to upstream AI providers.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Dual-AI analysis on free-tier infrastructure:</strong> Evaluates offer context using Google Gemini models with automatic model fallback and circuit breaker safeguards.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Six check dimensions:</strong> Assesses deposit requests, urgency tactics, sender credibility, role clarity, interview rigor, and document safety.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Exact quote extraction:</strong> Every flagged concern is linked directly to verbatim unedited quotes from the uploaded or pasted offer text, allowing you to trace every point back to the source.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Specific verification checklist:</strong> Generates concrete, realistic questions to verify company registration on official government registries (such as the Ministry of Corporate Affairs) and official career portals.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Voice-command navigation:</strong> Built from the ground up for hands-free dictation workflows using Wispr Flow or keyboard shortcuts.
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. What it does not do */}
            <section
              id="what-it-does-not-do"
              aria-labelledby="heading-what-it-does-not-do"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-what-it-does-not-do"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                What it does not do
              </h2>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] space-y-3 leading-relaxed">
                <p>
                  To prevent false certainty and reckless assumptions, OfferClara enforces strict architectural and editorial boundaries:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-[var(--text)]">No safety scores or percentage meters:</strong> We do not output an artificial probability or trust score that could mislead you into letting your guard down.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">No verdict badges:</strong> OfferClara never labels an offer &quot;legit&quot;, &quot;verified&quot;, &quot;safe&quot;, or a scam. It highlights factual patterns and arms you with questions.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Does not contact employers:</strong> OfferClara does not email, call, or message companies or recruitment personnel on your behalf.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Does not verify sender identity:</strong> Text and file uploads are analyzed as untrusted input. OfferClara cannot confirm whether a sender is genuinely who they claim to be or if an email domain has been spoofed.
                  </li>
                  <li>
                    <strong className="text-[var(--text)]">Not legal or employment counsel:</strong> The review provides informational observations based on publicly known recruitment concerns and does not substitute for qualified legal advice.
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. Who made it */}
            <section
              id="who-made-it"
              aria-labelledby="heading-who-made-it"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-who-made-it"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Who made it
              </h2>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] space-y-3 leading-relaxed">
                <p>
                  OfferClara was designed and developed by <strong className="text-[var(--text)]">Nilesh Thipe</strong>, a BCA student in India.
                </p>
                <p>
                  Built as a solo entry for the <strong className="text-[var(--text)]">WeMakeDevs x Wispr Flow Hackathon 2026</strong> (Builders track), the project combines modern Next.js 16 App Router architecture, responsive WCAG AA design principles, and voice-assisted workflow capabilities.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="https://www.linkedin.com/in/nilesh-h-thipe-372291253/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] text-xs font-medium hover:bg-[var(--border)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
                  >
                    <span>LinkedIn Profile</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </a>
                  <a
                    href="https://github.com/nilesh0199"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] text-xs font-medium hover:bg-[var(--border)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
                  >
                    <GitHubIcon className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>GitHub (@nilesh0199)</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </a>
                </div>
              </div>
            </section>

            {/* 5. Policies and official reporting */}
            <section
              id="related-resources"
              aria-labelledby="heading-resources"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-resources"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Policies and official reporting
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Learn more about how we handle data and where to access official reporting portals if you have encountered suspicious activity.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs font-semibold hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
                >
                  Read privacy policy
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs font-medium hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
                >
                  Help, reporting and official resources
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] py-6 mt-12 transition-colors">
        <Container className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="space-y-1 text-left">
            <p>
              Reviews pasted text only. Cannot confirm that a sender is genuine.
            </p>
            <p>Built for the No Hands: Wispr Challenge.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Help and reporting
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Privacy
            </Link>
            <Link
              href="/about"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              About
            </Link>
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              GitHub
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
