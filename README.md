# OfferCheck

> **Understand the offer. Know what to verify.**

A free, no-sign-in review assistant that helps students and first-time job seekers read an internship or job offer carefully before they pay money or share documents.

- **Live Demo:** [offer-check-wispr-flow-hackathon-20.vercel.app](https://offer-check-wispr-flow-hackathon-20.vercel.app) *(Note: Please confirm this is still your production deployment URL).*
- **Routes:** `/` (landing page and overview) · `/check` (review workspace)

---

## Why It Exists

When you are starting out, an offer can feel like a rare chance, and you may not yet know what normal hiring looks like. Scam messages are built around that moment: a registration or training fee, a refundable deposit, a request for identity or bank documents, and a tight deadline. Official advisories in India state that genuine internship and job services do not charge applicants (see the AICTE National Internship Portal and National Career Service entries in [docs/resources-verification.md](docs/resources-verification.md)). OfferCheck gives a calm second look: it points to the exact lines worth questioning, lists what the message does not say, and drafts questions to ask before you pay or share anything.

### Guiding Principles

- **Evidence over verdicts:** The tool never issues binary verdicts ("safe", "verified", "legitimate", "scam", or "fraud"). It points out specific lines and missing terms so the applicant can make an informed judgment.
- **Strict quote validation:** Every concern is linked to an exact verbatim quote from the submitted text. Deterministic application code checks the quote against the source text before anything is displayed; unverified or altered quotes are dropped.
- **Separation of observations and gaps:** Concerns explicitly present in the text are kept distinct from missing employment terms.
- **No scores or ratings:** No numeric risk scores, percentages, or alarm badges.
- **Epistemic modesty:** "No concerns identified" never means an offer is safe. The tool plainly states what it cannot know.

---

## What It Does and Does Not Do

### What It Does

- Evaluates pasted offer communications (up to 8,000 characters) across emails, chat messages, and letters.
- Transcribes up to 5 uploaded screenshots or PDF documents (up to 4 MB total) via Gemini's multimodal Interactions API, placing the extracted text in the editor for the candidate to review, redact, and edit before analysis.
- Highlights potential concerns linked strictly to verbatim quotations found in the text.
- Checks for foundational employment terms that standard offers usually include (stipend/salary, roles, schedule, location, official contact).
- Formulates actionable, professionally worded verification questions for the student or job seeker to ask the sender.
- Suggests prioritized self-check steps (e.g., checking official company domains before sending documents).
- Provides static, verified links and helplines for official Indian reporting and verification resources.
- Prepares a structured search prompt that students and job seekers can copy to Perplexity to research company presence independently.

### What It Does NOT Do

- **Not a scam detector:** It does not label an offer as "real", "fake", "safe", or "scam".
- **Cannot verify identity or authority:** It cannot verify whether an email sender legitimately represents the claimed employer or whether an organization is incorporated.
- **Not legal advice:** All findings, missing-item checklists, and questions are informational prompts for student and job seeker self-advocacy.
- **Not immune to error:** Language models can miss nuanced issues or misinterpret ambiguous context.
- **English only:** Analysis and prompts are currently built and tested only for English-language text.

---

## Features

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Paste-text review** | Implemented | Evaluates raw text up to 8,000 characters with live character counting and privacy advisories. |
| **Quote-linked observations** | Implemented | Every potential concern cites an exact verbatim quote checked by code against the user's text; invalid quotes are dropped and counted in `droppedCount`. |
| **Missing details checklist** | Implemented | Standard contractual terms (compensation, roles, working hours, workplace location) are kept separate from concerns. |
| **Verification questions** | Implemented | Suggested questions drafted to clarify ambiguous terms, with one-click clipboard copying. |
| **"Check these yourself" steps** | Implemented | Contextually prioritized verification steps based on identified concerns (payment, sensitive data, off-platform messaging). |
| **Official resources** | Implemented | Direct links and helpline numbers for AICTE, NCS (1514), MCA Company Search, and the National Cyber Crime Reporting Portal (1930). Zero runtime network calls. |
| **Company research handoff** | Implemented | Prepares an external search prompt for Perplexity (short 300 words or detailed 600 words) from user-confirmed details; no in-app search calls and raw offer text is strictly excluded. |
| **Landing page and routes** | Implemented | Asymmetric landing page at `/` with an interactive annotated paper card; tool workspace at `/check`; in-memory session persistence across routes via `SessionProvider`. |
| **Safeguards** | Implemented | Sliding-window rate limiting (8/15m, 30/24h) with salted SHA-256 IP hashing, model circuit breaker, in-memory concurrency guard (max 4), input hygiene (blocking NUL/control characters), and security headers. |
| **Job-offer specifics** | In progress | The app analyses any pasted text, but prompt instructions, synthetic samples, and in-app copy are currently written around internships. Extending salary, probation, joining date, training or bond clauses, and job samples is in progress. |
| **Screenshot and PDF input** | Implemented | Multimodal transcription via Gemini Interactions API for up to 5 screenshots (PNG, JPEG, WebP) or PDFs (max 4 MB total); browser-side canvas downscaling; candidate reviews and edits extracted text before analysis. |

---

## How It Works

OfferCheck processes text through a deterministic, validation-first pipeline:

1. **User input:** The candidate pastes communication text on `/check` (capped at 8,000 characters).
2. **Server boundary (`/api/analyze`):** The request passes input hygiene checks (blocking NUL characters and unprintable control characters), in-memory concurrency checks, and salted sliding-window rate limits.
3. **Structured generation:** The prompt is sent to Google's Gemini API Interactions endpoint using a model fallback chain (`gemini-3.8-flash` &rarr; `gemini-3.6-flash` &rarr; `gemini-3.5-flash-lite`) at minimal thinking levels with a shared deadline.
4. **Schema validation:** The raw JSON output is validated against strict Zod schemas (`ModelAnalysisSchema`).
5. **Deterministic quote validation & guardrails:** Application code independently searches the original input text for every quoted concern. If the model hallucinated, truncated, or altered a quote, the concern is dropped and recorded in `droppedCount`. Overclaiming guardrails block forbidden verdict words. The model is never trusted for evidence.
6. **Results presentation:** The client renders verbatim highlights mapped onto the text, missing term checklists, copyable questions, contextual self-checks, and official resource references.

```text
+-----------------------+
|  User pastes offer    |  (Max 8,000 characters)
+-----------+-----------+
            |
            v
+-----------------------+
|  POST /api/analyze    |  Input hygiene (rejects NUL/control characters)
+-----------+-----------+  In-memory rate limit & concurrency guard
            |
            v
+-----------------------+
|  Gemini Fallback      |  Interactions API (gemini-3.8-flash -> 3.6 -> 3.5)
|  Model Chain          |  Lowest thinking level, JSON mode, strict schema
+-----------+-----------+
            |
            v
+-----------------------+
|  Schema Validation    |  Zod validation parses raw JSON output
+-----------+-----------+
            |
            v
+-----------------------+
|  Deterministic Quote  |  Code searches original text for exact verbatim quotes;
|  Validator            |  drops fabricated/mutated quotes (increments droppedCount)
+-----------+-----------+
            |
            v
+-----------------------+
|  Overclaiming & Tone  |  Blocks verdict words ("safe", "scam"), ensures
|  Guardrails           |  epistemic modesty ("No concerns" != safe)
+-----------+-----------+
            |
            v
+-----------------------+
|  Client UI Rendering  |  Quotation highlights, missing info checklist,
|  (/check)             |  questions, self-checks, official resources, research handoff
+-----------------------+
```

---

## Privacy and Responsible Use

- **Where the text goes:** When a review is requested, the text is transmitted over HTTPS to Google's Gemini API. OfferCheck uses the free tier of the Gemini API. Under Google's published terms for its free tier, submitted content may be reviewed by human reviewers and used by Google to train and improve its products. A pre-paste advisory in the application reminds users to redact personal names, addresses, phone numbers, bank details, and identification numbers.
- **What is NOT stored:** OfferCheck has no user accounts, no database, no session cookies, and no third-party tracking scripts or analytics. Text and results are held entirely in browser tab memory (`SessionProvider`) and are permanently cleared when the tab is closed or refreshed.
- **Zero text in server logs:** Server logs record only operational metadata (status code, attempt count, model ID, elapsed milliseconds). Raw offer text, prompt content, and model responses are never written to logs.
- **Hashed client keys for rate limiting:** Rate limits use an anonymized key derived from the client IP hashed with SHA-256 and a random 16-byte server salt generated at startup. Raw IP addresses are never retained in memory, logged, or returned.

For complete details, see [docs/privacy-and-responsible-use.md](docs/privacy-and-responsible-use.md).

---

<details>
<summary><strong>Tech Stack &amp; Project Structure</strong></summary>

### Tech Stack

- **Framework:** [Next.js 16.4.2](https://nextjs.org/) (App Router, Turbopack)
- **Runtime & Language:** [Node.js](https://nodejs.org/) v20+ with [TypeScript 5](https://www.typescriptlang.org/)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), self-hosted Google Fonts (`Instrument Serif`, `Instrument Sans`, `IBM Plex Mono` via `next/font/google`)
- **Validation:** [Zod 4.6.7](https://zod.dev/)
- **AI SDK:** [`@google/genai` 2.30.0](https://github.com/google-gemini/deprecations) (Interactions API with model fallback chain)
- **Testing:** [Vitest 5.0.5](https://vitest.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

### Top-Level Folders

- `docs/`: Design system, specs, build plan, test plan, evaluation set, dev log, and privacy policies.
- `public/`: Static web assets and icons.
- `src/`: Next.js application source code (App Router routes, UI components, static data, analysis & research libraries).
- `tests/`: 26 offline Vitest test suites (215 unit tests covering schemas, validators, safeguards, extractors, and UI state).
- `tests-live/`: Live evaluation suite against the Gemini API using synthetic fixtures and injection tests.

</details>

---

<details>
<summary><strong>Getting Started &amp; Local Development</strong></summary>

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later (verified on Node v24.12.0)
- [npm](https://www.npmjs.com/) v10 or later (verified on npm v11.6.2)
- (Optional for live analysis) A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Configure `.env.local` as needed:
   - `GEMINI_API_KEY`: API key for Google Gemini (required for live analyses via `/api/analyze`; offline tests run without a key).
   - `GEMINI_MODELS`: Comma-separated model fallback order (default: `gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite`).
   - `GEMINI_THINKING_LEVEL`: Optional thinking level override (default: lowest documented level per model: `"low"` for 3.8, `"minimal"` for 3.6/3.5).
   - `RATE_LIMIT_PER_WINDOW`: Maximum analyses per 15-minute sliding window per client (default: `8`).
   - `RATE_LIMIT_PER_DAY`: Maximum analyses per 24-hour day per client (default: `30`).
   - `NEXT_PUBLIC_SITE_URL`: Optional public site URL for OpenGraph metadata resolution.

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build and start production:**
   ```bash
   npm run build
   npm run start
   ```

</details>

---

<details>
<summary><strong>Testing and Evaluation</strong></summary>

### Running Offline Unit Tests

The test suite runs completely offline with zero network calls and mock client injection:
```bash
npm run test
```
**Current Test Count:** Exactly **215 unit tests** passing across **26 test files**.

What the tests cover:
- Deterministic quote validator (Unicode grapheme handling, exact substring search, nested quote containment, and duplicate deduplication).
- Overclaiming guardrails and tone compliance.
- Zod schema validation and model output parsing.
- Model fallback chain, shared 55s deadline, and 20s per-attempt timeout.
- Sliding-window rate limiter, memory caps, and eviction logic.
- Model circuit breaker with tiered cooldowns and fail-open behavior.
- In-memory concurrency guard with guaranteed decrement.
- Input hygiene (blocking NUL characters and unprintable control characters).
- Contact extractor and public free webmail detection.
- Research prompt builder, word limits, and raw offer text exclusion.
- Contextual prioritization for self-checks and official resources.
- Safe logging audit verifying zero offer text or API key leakage.

### Running Live Tests

To test the live pipeline against Google Gemini's API using the four synthetic examples and one prompt-injection fixture:
```bash
npm run test:live
```
*(Requires `GEMINI_API_KEY` in `.env.local`. If the key is absent, the suite cleanly skips with an explanatory message. Live calls consume free-tier quota).*

### Benchmark Evaluation Set

The evaluation dataset consists of four synthetic examples and one adversarial prompt-injection fixture. The benchmark cases, target behaviors, and matrix are documented in [docs/evaluation-set.md](docs/evaluation-set.md). The live-result columns in that matrix are filled in by the author during live model evaluation runs.

</details>

---

## Limitations

- **Free-tier API quotas:** The Gemini free tier has strict rate limits (requests per minute and requests per day). Saturated quotas return clean 429 status codes with retry advisories.
- **Serverless in-memory scope:** Rate limits, concurrency guards, and circuit breakers operate in-memory on the active server instance; in a multi-instance serverless environment, state is not shared across instances.
- **Model errors:** AI models can misinterpret atypical arrangements or generate invalid quotes. OfferCheck mitigates quote hallucinations by discarding unverified quotes before rendering.
- **English only:** Analysis prompts, rules, and synthetic examples are designed exclusively for English-language communications.
- **No identity or company verification:** The tool analyses text content only. It cannot verify whether an email address is spoofed or whether a sender actually works for the organization they claim to represent.

---

## Built with Wispr Flow

OfferCheck was developed for the hackathon using Wispr Flow to dictate engineering prompts, feature change requests, and architectural decisions. These dictated entries, observations, resulting code changes, and verification test counts are documented chronologically in [docs/dev-log.md](docs/dev-log.md).

---

## Roadmap

Planned future enhancements (not yet implemented in the codebase):

- **Screenshot & PDF input (Phase 5):** Multimodal document transcription into raw text for mandatory user review and redaction before running the text analysis pipeline.
- **Completion of job-offer specifics:** Extending salary, probation period, joining date, training or employment bond clauses, synthetic job samples, and in-app copy to cover entry-level employment contracts comprehensively.
- **Continuous evaluation benchmarks:** Expanding test fixtures with real-world anonymized recruitment patterns and tracking model accuracy across updates.

---

## Acknowledgements and Official Resources

OfferCheck references official Indian government resources and statutory guidance to help applicants verify communications independently:

- [National Cyber Crime Reporting Portal](https://cybercrime.gov.in) (`cybercrime.gov.in`) — 24/7 National Cyber Financial Fraud Helpline: **1930**
- [AICTE National Internship Portal](https://internship.aicte-india.org) (`internship.aicte-india.org`) — Free student internship services and reporting (`internship@aicte-india.org`)
- [National Career Service (NCS)](https://www.ncs.gov.in) (`ncs.gov.in`) — Ministry of Labour and Employment, Toll-free helpline: **1514**
- [Ministry of Corporate Affairs (MCA) Company / LLP Search](https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html) (`mca.gov.in`) — Official public search for registered Indian companies and LLPs

*(For verification details and date of verification, see [docs/resources-verification.md](docs/resources-verification.md)).*

---

*Built for **No Hands: The Wispr Challenge** (WeMakeDevs x Wispr Flow), solo entry, Builders track.*
