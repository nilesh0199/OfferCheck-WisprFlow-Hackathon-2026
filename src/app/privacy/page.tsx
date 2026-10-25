import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { GitHubIcon, ExternalLinkIcon } from "@/components/Icons";
import { APP_NAME, AI_DATA_NOTICE, AI_FILE_NOTICE } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy and responsible data use — ${APP_NAME}`,
  description:
    "How your information is processed, what is sent to external services, and what OfferClara does not store.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12 space-y-12">
        <Container className="space-y-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[var(--color-highlight)]" />
              <span>Privacy and data handling</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
              Privacy and responsible data use
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
              How your information is processed when you use OfferClara, what is sent to external services, and what remains in your browser.
            </p>
            <p className="text-xs text-[var(--text-muted)] pt-1 font-mono">
              Last updated 22 Oct 2026
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto text-left">
            {/* Section 1: What is sent to other services */}
            <section
              id="sent-to-other-services"
              aria-labelledby="heading-sent"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-sent"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                What is sent to other services
              </h2>
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  When you submit text for review, it is transmitted to Google&apos;s Gemini API on the free tier or, if unavailable, to Groq. Uploaded files (screenshots and PDFs) are processed only by Google&apos;s Gemini API for transcription; files are never sent to Groq.
                </p>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs font-mono text-[var(--text)] leading-relaxed">
                  <p>{AI_DATA_NOTICE}</p>
                </div>
                <p>
                  If you choose to use the independent company research helper, the generated search prompt contains only confirmed company details (such as organisation name, website, and location) and is copied by you into Perplexity, an external service with its own terms and privacy policy. Raw offer letters are never included in the research prompt.
                </p>
                <p>
                  Video awareness guides on the Help and reporting page display static video thumbnails and link directly to YouTube in a new tab. Videos are not played directly on our website, and OfferClara embeds no video players or third-party tracking scripts.
                </p>
                <p>
                  OfferClara is hosted on Vercel, which processes incoming web requests and maintains standard operational infrastructure logs under its own privacy policy.
                </p>
              </div>
            </section>

            {/* Section 2: What OfferClara does not store */}
            <section
              id="what-we-do-not-store"
              aria-labelledby="heading-store"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-store"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                What OfferClara does not store
              </h2>
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  OfferClara operates statelessly without persistent storage:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>No accounts or user profiles:</strong> There is no sign-in, account creation, or password storage.
                  </li>
                  <li>
                    <strong>No databases or disk storage:</strong> User-submitted offer text, uploaded files, and extracted transcripts are never saved to a database, server disk, or permanent file store.
                  </li>
                  <li>
                    <strong>No third-party analytics:</strong> No tracking pixels, marketing cookies, or external analytics SDKs are loaded.
                  </li>
                  <li>
                    <strong>Clean operational logs:</strong> Our server logs never contain offer text, filenames, transcripts, or personal credentials. They record only technical error codes and round-trip timings for upstream reliability debugging.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: What stays in your browser */}
            <section
              id="what-stays-in-browser"
              aria-labelledby="heading-browser"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-browser"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                What stays in your browser
              </h2>
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  Offer text, attached files, and review results remain exclusively in your browser tab&apos;s volatile memory during your active session. When you refresh the page or close the tab, that data is immediately cleared.
                </p>
                <p>
                  Your theme choice (light, dark, or system preference) is the only item saved in browser storage (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)]">localStorage</code>) to maintain visual consistency across visits. The optional command bar visibility state and doubt inquiry messages stay in volatile tab memory only and are never written to browser storage.
                </p>
                <p>
                  OfferClara does not use or access your microphone. Spoken dictation is handled entirely on your device by your own operating system or speech application (such as Wispr Flow) typing directly into the focused input field.
                </p>
              </div>
            </section>

            {/* Section 4: Requests and limits */}
            <section
              id="requests-and-limits"
              aria-labelledby="heading-limits"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-limits"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Requests and limits
              </h2>
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  To protect public free-tier API quotas and ensure fair availability, a short-lived hashed network identifier is maintained temporarily in server memory for rate limiting.
                </p>
                <p>
                  Client IP addresses are salted with a random cryptographic value generated each time the server starts and converted into a SHA-256 hash. Raw IP addresses are never logged or stored. In-memory counters automatically expire after the active rate-limit window.
                </p>
              </div>
            </section>

            {/* Section 5: Uploads */}
            <section
              id="uploads"
              aria-labelledby="heading-uploads"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-uploads"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Uploads
              </h2>
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  When attaching screenshots or PDF files:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>File names are never extracted or sent to Google:</strong> Your original file names remain in browser memory only and are never transmitted to Google&apos;s Gemini API or logged on the server. Appended text blocks use generic labels such as <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)]">---- Text from Screenshot 1 ----</code> or <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)]">---- Text from PDF 1 ----</code>.
                  </li>
                  <li>
                    <strong>Images are re-encoded:</strong> Screenshots (PNG, JPEG, WebP) are downscaled and re-encoded in your browser via HTML5 Canvas before sending, which drops original camera or device EXIF metadata.
                  </li>
                  <li>
                    <strong>PDFs are sent unchanged:</strong> PDF documents are transmitted directly over HTTPS to the transcription endpoint.
                  </li>
                  <li>
                    <strong>Visual content is visible to the model:</strong> Anything visible in an uploaded file is sent to Google&apos;s Gemini API to transcribe text.
                  </li>
                </ul>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs font-mono text-[var(--text)] leading-relaxed mt-2">
                  <p>{AI_FILE_NOTICE}</p>
                </div>
                <p>
                  Crop or cover names, phone numbers, addresses, account numbers, and ID numbers before uploading, or paste the text directly into the editor.
                </p>
              </div>
            </section>

            {/* Section 6: What OfferClara cannot do */}
            <section
              id="what-offerclara-cannot-do"
              aria-labelledby="heading-cannot"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-cannot"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                What OfferClara cannot do
              </h2>
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  OfferClara is an automated review assistant designed for preliminary textual evaluation. It has strict operational boundaries:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>Reviews supplied text only:</strong> The review evaluates solely the wording provided in the offer message.
                  </li>
                  <li>
                    <strong>Cannot confirm that a sender is genuine:</strong> OfferClara cannot verify whether an email sender legitimately represents the claimed employer, whether a company is legally incorporated, or whether an identity has been forged.
                  </li>
                  <li>
                    <strong>Not legal advice:</strong> Analysis findings, checklists, and suggested questions are informational prompts for self-advocacy and due diligence, not legal or employment counsel.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7: Report a problem */}
            <section
              id="report-a-problem"
              aria-labelledby="heading-report"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2
                id="heading-report"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Report a problem
              </h2>
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  If you notice a security issue, bug, unexpected behaviour, or data handling concern, please report it directly on our public GitHub repository:
                </p>
                <div className="pt-1">
                  <a
                    href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    <span>Open an issue on GitHub (opens in a new tab)</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </main>

      {/* Footer matching /resources */}
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
