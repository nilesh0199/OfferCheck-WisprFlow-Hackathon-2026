# OfferCheck

> **Understand the offer. Know what to verify.**

A free, no-sign-in review assistant that helps students and first-time job seekers read an internship or job offer carefully before they pay money or share documents.

- **Live Demo:** [offer-check-wispr-flow-hackathon-20.vercel.app](https://offer-check-wispr-flow-hackathon-20.vercel.app) *(Note: Please confirm this is still your production deployment URL).*
- **Routes:** `/` (landing page and overview) · `/check` (review workspace) · `/resources` (official verification portals and reporting channels)

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

- Evaluates offer text (up to 8,000 characters) pasted directly, extracted from uploaded files, or combined from both.
- Transcribes up to 5 uploaded screenshots or PDF documents (up to 4 MB total) via Gemini's multimodal Interactions API, appending the extracted text below existing notes for candidate review, editing, and one-click undo before analysis.
- Highlights potential concerns linked strictly to verbatim quotations found in the text.
- Checks for foundational employment terms that standard offers usually include (stipend/salary, roles, schedule, location, official contact).
- Formulates actionable, professionally worded verification questions for the student or job seeker to ask the sender.
- Suggests prioritized self-check steps (e.g., checking official company domains before sending documents).
- Provides static, verified links and helplines for official Indian reporting and verification resources.
- Prepares a structured search prompt that students and job seekers can copy to Perplexity to research company presence independently.

### What It Does NOT Do

- **Not a scam detector:** It does not label an offer as "real", "fake", "safe", or "scam".
- **Cannot verify identity or authority:** It cannot verify whether an email sender legitimately represents the claimed employer or whether an organisation is incorporated.
- **Not legal advice:** All findings, missing-item checklists, and questions are informational prompts for student and job seeker self-advocacy.
- **Not immune to error:** Language models can miss nuanced issues or misinterpret ambiguous context.
- **English only:** Analysis and prompts are currently built and tested only for English-language text.

---

## Features

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Combined text and file input** | Implemented | Users can paste text, attach up to 5 screenshots/PDFs (max 4 MB total), or both. File transcripts are appended below existing text with one-level undo and candidate review before analysis. |
| **Quote-linked observations** | Implemented | Every potential concern cites an exact verbatim quote checked by code against the user's text; invalid quotes are dropped and counted in `droppedCount`. |
| **Missing details checklist** | Implemented | Foundational contractual terms (compensation, roles, working hours, workplace location) are displayed in a compact 2-column table (`Topic | Note`), kept separate from concerns. |
| **Verification questions** | Implemented | Suggested questions drafted to clarify ambiguous terms, with one-click clipboard copying. |
| **"Check these yourself" steps** | Implemented | Contextually prioritised verification steps based on identified concerns (payment, sensitive data, off-platform messaging). |
| **Official resources** | Implemented | Direct links and helpline numbers for AICTE, NCS (1514), MCA Company Search, and the National Cyber Crime Reporting Portal (1930). Zero runtime network calls. |
| **Company research nudge & handoff** | Implemented | Evaluates offer cues (unnamed employer, free email without a website, or internship without a supervisor) to recommend independent research. Prepares an external Perplexity prompt with an always-visible key-value summary, depth switcher, and required company field. Raw offer text is strictly excluded. |
| **Theme & semantic token system** | Implemented | Dual-theme system (Light, Dark, System; Light default) with explicit `color-scheme` in `globals.css` and zero raw palette classes. Contrast ratios verified to meet or exceed WCAG 2.1 AA/AAA standards (text $\ge 4.5:1$, borders/focus $\ge 3:1$). Anti-FOUC inline script and accessible `ThemeToggle`. |
| **Three-zone workspace layout** | Implemented | Fluid full-width container `min(100% - 2*gutter, 2000px)`. Pre-review 7/12 input + 5/12 sample offers & guidance. Post-review 3-zone desk on desktop ($\ge 1280$px): sticky left rail document viewer with line numbers and quote highlights, centre fluid results with prose $\le 70$ch, sticky right rail section nav and quick actions ('Copy summary', 'Print / PDF'). |
| **Bi-directional evidence linking** | Implemented | Hovering or focusing an observation card in the findings column highlights the quote in the left rail document and scrolls to its line. Clicking a highlighted phrase in the document rail scrolls to and focuses the corresponding observation card. |
| **Typography architecture** | Implemented | Build-time self-hosted Google Fonts: `IBM Plex Sans` for readable UI and body prose, `IBM Plex Mono` for code/quotes/line numbers, and `Newsreader` for landing headlines. 15px base text, 13px secondary, min 12px, tabular numbers. |
| **Landing page and routes** | Implemented | Asymmetric landing page at `/` with an interactive annotated paper card, non-blocking hero entrance animation with opt-in playback for reduced-motion visitors, and a scroll-driven line-by-line inspection scene; tool workspace at `/check`; in-memory session persistence across routes via `SessionProvider`. |
| **Safeguards** | Implemented | Sliding-window rate limiting (8/15m, 30/24h) with salted SHA-256 IP hashing, model circuit breaker, in-memory concurrency guard (max 4), input hygiene (blocking NUL/control characters), and security headers. |
| **Job-offer specifics** | Partially implemented | The review prompt treats salary, probation period, joining date and contract terms as missing details when unstated, and display labels say "Stipend or salary" and "Duration or contract term". There are no job-offer sample texts and no job-offer evaluation yet; clauses such as service bonds or training-fee agreements are not specifically handled. |
| **Screenshot and PDF input** | Implemented | Multimodal transcription via Gemini Interactions API for up to 5 screenshots (PNG, JPEG, WebP) or PDFs (max 4 MB total); browser-side canvas downscaling; extracted text is appended below notes for candidate review and editing before analysis. |
| **Print stylesheet & PDF export** | Implemented | Clean print stylesheet isolating the analysis report, hiding UI chrome and input forms, with an 'Export review (PDF)' button. |

---

## How It Works

OfferCheck processes text through a deterministic, validation-first pipeline:

1. **User input:** The candidate pastes communication text, attaches up to 5 screenshots or PDFs, or combines both on `/check` (capped at 8,000 characters). Text from files is appended below any existing text with one-click undo.
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
- **What is NOT stored:** OfferCheck has no user accounts, no database, no session cookies, and no third-party tracking scripts or analytics. Offer text and results are held entirely in volatile browser tab memory (`SessionProvider`) and are permanently cleared when the tab is closed or refreshed. The only item saved in browser storage is your theme preference (`"offercheck-theme"`: `"light"`, `"dark"`, or `"system"`).
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
- `tests/`: Automated offline Vitest test suites covering schemas, validators, safeguards, extractors, upload helpers, reducer undo/append, reduced-motion entrance state, print styles, and UI components.
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
The test suite validates all critical pipeline modules with zero external network calls:

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
- **No identity or company verification:** The tool analyses text content only. It cannot verify whether an email address is spoofed or whether a sender actually works for the organisation they claim to represent.

---

## Built with Wispr Flow

OfferCheck was developed for the hackathon using Wispr Flow to dictate engineering prompts, feature change requests, and architectural decisions. These dictated entries, observations, resulting code changes, and verification test counts are documented chronologically in [docs/dev-log.md](docs/dev-log.md).

---

## Roadmap

Planned future enhancements (not yet implemented in the codebase):

- **Continuous evaluation benchmarks:** Expanding test fixtures with real-world anonymized recruitment patterns and tracking model accuracy across updates.
- **Multilingual guidance:** Translating official resource guidance and verification questions into regional Indian languages.
- **Direct PDF highlight overlay:** Viewing findings overlaid directly on multi-page PDF documents alongside the extracted text editor.

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
