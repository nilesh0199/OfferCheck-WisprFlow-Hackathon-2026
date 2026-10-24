# OfferClara

> **Understand the offer. Know what to verify. Make every offer clear.**

A free, no-sign-in review assistant that helps students and first-time job seekers read an internship or job offer carefully before they pay money or share documents.

- **Live Demo:** [offer-check-wispr-flow-hackathon-20.vercel.app](https://offer-check-wispr-flow-hackathon-20.vercel.app)
- **Repository:** [github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026](https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026)
- **Routes:** `/` (landing page and overview) · `/check` (review workspace) · `/resources` (official verification portals and reporting channels) · `/privacy` (privacy notice and data handling practices) · `/about` (about OfferClara) · `/ask` (clear doubt with AI)

---

## The Problem

When you are starting out, an offer can feel like a rare chance, and normal hiring practices may be unfamiliar. Scam messages are built around that moment: an upfront registration or training fee, a "refundable" security deposit, an urgent request for identity or bank documents, and a tight deadline to create pressure.

Official advisories in India state that genuine internship and job services do not charge applicants (see the AICTE National Internship Portal and National Career Service advisories documented in [docs/resources-verification.md](docs/resources-verification.md)). OfferClara gives candidates a calm second look: it points out the exact lines worth questioning, lists what the communication does not say, and drafts questions to ask before paying money or sharing personal credentials.

---

## Who It Is For and How a Review Works

OfferClara is built for students and first-time job seekers receiving internship or entry-level job solicitations via email, messaging apps, job boards, or phone calls.

A review works in five structured steps:

1. **Step 1 — Offer text and documents:** Paste offer text, attach up to 5 screenshots or PDFs (max 4 MB total), or load sample offers. Text from files is transcribed and appended below existing text with generic source labels, fully editable with one-click undo.
2. **Step 2 — Source and channel:** Specify how the offer was received (email, LinkedIn, WhatsApp, Telegram, campus, or job portal) and whether an application was submitted.
3. **Step 3 — Described conversation:** Describe recruiter phone calls, verbal promises, or interview details in your own words (typed or dictated).
4. **Step 4 — Money and documents:** Note any requested training fees, security deposits, equipment charges, or sensitive identity documents.
5. **Step 5 — Review and submit:** Inspect the structured summary, check character limits (up to 12,000 characters), review AI data notices, and launch the evidence-linked review.

---

## What Makes It Different

- **Deterministic quote validation:** Every potential concern cites an exact verbatim quote that code verifies against the candidate's text before rendering. If the model hallucinates, alters, or truncates a quote, the concern is discarded by code and counted in `droppedCount`. The model is never trusted for evidence.
- **Separation of observations and gaps:** What the message explicitly says is kept strictly separate from foundational employment terms that are absent.
- **No scores or verdicts:** The tool never issues numeric risk scores, percentages, or binary verdict badges ("safe", "verified", "legit", "scam", or "fraud").
- **Stated limits:** Every review includes immutable limits explaining what the tool cannot know (it cannot verify sender identity, corporate incorporation, or off-document oral promises).
- **External research handoff:** Rather than claiming to verify company legitimacy in-app, the tool prepares a structured search prompt that candidates can copy to Perplexity to research company presence independently.
- **Global Command Bar (Dictate or Type):** Use `/` or `Ctrl+K` to jump across steps or sections, run reviews, or export PDFs without touching mouse or menus, with dictation fallback to offer text.

---

## Features

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **5-step review wizard** | Implemented | Step-by-step guidance separating offer documents, source channel, candidate-described conversations, payment/document requests, and review snapshot at `/check`. |
| **Combined text & file review** | Implemented | Evaluates combined text up to 12,000 characters; up to 5 screenshots (PNG, JPEG, WebP) or PDFs (max 4 MB total) transcribed via Gemini multimodal API and appended with generic source markers (`---- Text from Screenshot N ----`, `---- Text from PDF N ----`) and 1-level undo. |
| **Global Command Bar** | Implemented | Docked bottom bar (`/` or `Ctrl+K` / `Cmd+K`) matching 80+ spoken or typed patterns, stripping conversational fillers, 2-second visual countdown, and dictation fallback for text > 80 chars. |
| **Master-detail results layout** | Implemented | 3 desktop columns: left rail `ResultsNav` with live scroll-spy, middle fluid `AnalysisResults`, and right rail `YourOfferWorkspace` document viewer with line numbers and quote highlights. |
| **Review actions & export** | Implemented | `ResultsActionsBar` with print-ready PDF export (dynamic title `OfferClara Review - [Company] - [Date].pdf`), markdown summary clipboard copy, Web Share API, and native `<dialog>` clear confirmation. |
| **Call or conversation descriptions** | Implemented | Candidates can type or dictate an account of a phone call or verbal interaction in their own words; reviewed with a dedicated review limit acknowledging candidate descriptions. |
| **Observations with line numbers and highlights** | Implemented | Document viewer with line numbers and quote highlights; bi-directional linking between observation cards and text lines. |
| **Missing details table** | Implemented | Foundational contractual terms (compensation, roles, working hours, workplace location) displayed in a compact 2-column table (`Topic \| Note`), kept separate from concerns. |
| **Verification questions** | Implemented | Suggested questions drafted to clarify ambiguous terms, with one-click clipboard copying. |
| **"Check these yourself" steps** | Implemented | Contextually prioritised verification steps based on identified concerns (payment, sensitive data, off-platform messaging). |
| **Official institutional advisories** | Implemented | Contextually matched verified notices from IIT Bhubaneswar, St. Xavier's College Jaipur placement cell, and Careers360 / IIT Roorkee report. |
| **Official resources and resources page** | Implemented | Static `/resources` page with verified links and helpline numbers for AICTE, NCS (1514), MCA Company Search, and the National Cyber Crime Reporting Portal (1930). Zero runtime network calls. |
| **Company research prompt for Perplexity** | Implemented | Prepares a structured search prompt with confirmed company details, depth switcher, and direct link to Perplexity. No in-app search API or web scraping. |
| **Light, dark, and system theme** | Implemented | Ink Blue dual-theme palette with navy header bar, WCAG 2.1 AA/AAA contrast, anti-FOUC script, and accessible segmented `ThemeToggle`. |
| **Static landing page** | Implemented | Fast static landing page at `/` with static annotated paper card, 5 wizard steps overview, command bar preview, capabilities comparison, dual-column FAQ, and WeMakeDevs x Wispr Flow attribution. |
| **Privacy page** | Implemented | Dedicated static `/privacy` route detailing ephemeral tab-memory processing, zero database retention, free-tier Google AI disclosures, and client-side sensitive identifier warnings. |
| **Safeguards** | Implemented | In-memory sliding-window rate limiting (8/15m, 30/24h for analysis; 6/15m, 20/24h for uploads) with salted SHA-256 IP hashing, model circuit breaker, in-memory concurrency guard (max 4), input hygiene (blocking NUL/control characters), and security headers. |
| **Job-offer coverage** | Partially implemented | The review prompt treats salary, probation period, joining date and contract terms as missing details when unstated, and display labels say "Stipend or salary" and "Duration or contract term". There are no job-offer sample texts and no job-offer evaluation yet; clauses such as service bonds or training-fee agreements are not specifically handled. |

---

<details>
<summary><strong>How It Works (Technical Architecture)</strong></summary>

### Technical Flow

```mermaid
flowchart TD
    User["User pastes text, attaches screenshots/PDFs, or dictates account"] --> Input{"Input type"}
    Input -->|"Screenshots / PDFs"| Transcribe["POST /api/transcribe (multimodal Gemini)"]
    Transcribe --> Editor["Editor: editable text with generic source labels"]
    Input -->|"Pasted text / Dictated account"| Editor
    Editor -->|"Candidate confirms and reviews"| Analyze["POST /api/analyze (input hygiene, rate limit, concurrency)"]
    Analyze --> Fallback["Gemini Model Fallback Chain (3.8-flash -> 3.6-flash -> 3.5-flash-lite)"]
    Fallback --> Schema["Zod Schema Validation (ModelAnalysisSchema)"]
    Schema --> Validate["Quotation Validation & Epistemic Guardrails (pure code)"]
    Validate -->|"Drops invalid/hallucinated quotes"| DroppedCount["droppedCount tracked"]
    Validate --> Results["Structured Results: Quotes highlighted in left rail, observations, missing terms, verification questions"]
    Results -.->|"Optional company research"| Perplexity["External Perplexity prompt builder (copy and open)"]
```

### Core Architectural Decisions

1. **The model is never trusted for evidence:** LLMs generate plausible observations, but every quoted substring is deterministically verified against the input text by pure application code. Hallucinated, truncated, or modified quotes are purged before rendering.
2. **Session state lives in volatile browser RAM:** Active text, uploaded files, and review results are managed via React Context (`SessionProvider`) and a pure reducer in memory. State survives navigation between `/`, `/check`, `/resources`, and `/privacy` without writing to `localStorage`, `sessionStorage`, or cookies. Refreshing or closing the tab immediately clears the data.
3. **Zero database persistence:** There are no user accounts, no saved offer histories, no cookies, and no tracking databases. Uploaded files exist in server memory only during the active transcription request and are never written to disk or object storage.

</details>

---

<details>
<summary><strong>Privacy and Responsible Use</strong></summary>

### What Is Sent to External Services

When candidates submit text or upload files for review, they are transmitted over HTTPS to Google's Gemini API on the free tier. Above the input area and in the privacy policy, OfferClara presents the verbatim notice:

> "The text you submit is sent to Google's Gemini API for analysis. OfferClara uses Google's free tier, where Google states that submitted content may be used to improve its products. Do not submit anything you would not want processed this way."

For file uploads, anything visible in an uploaded screenshot or PDF is processed by Gemini's multimodal API solely to transcribe text. Original file names are never sent to Google, never logged, and never included in transcripts; appended text blocks use generic labels (`---- Text from Screenshot N ----`, `---- Text from PDF N ----`).

### What Is Not Stored

- **No databases or user accounts:** No sign-in, authentication tokens, or profile storage.
- **No disk storage:** Offer text, file uploads, and transcripts are never saved to server disk or cloud object storage.
- **No third-party analytics:** No tracking pixels, marketing scripts, or external telemetry libraries are loaded.
- **Clean server logs:** Server logs record only operational metadata (status codes, durations, byte counts). Server logs never contain offer text, file names, transcripts, or personal credentials.

### What Stays in Your Browser

- Offer text, attached files, and review findings exist only in the active browser tab's volatile memory.
- The user's theme selection (light, dark, or system preference) is the sole item stored in browser storage (`localStorage` key `"offercheck-theme"`).

### Rate Limiting Privacy

Rate limiting operates via an in-memory sliding window using salted SHA-256 IP hashes. The IP address is combined with a random 16-byte salt generated when the server boots. Raw IP addresses are never logged or persisted.

For complete policy details, see [docs/privacy-and-responsible-use.md](docs/privacy-and-responsible-use.md) and the live `/privacy` route.

</details>

---

## Limitations

- **Free-tier API quotas:** OfferClara operates on Google's Gemini API free tier. Saturated upstream rate limits return clean HTTP 429 responses with retry advisories.
- **Serverless in-memory scope:** Rate limits, concurrency controls, and circuit breakers operate in-memory on the active serverless instance; state is not shared across multi-instance serverless deployments.
- **Model errors and OCR mistakes:** Language models can misinterpret atypical arrangements or generate invalid quotes (which code drops). Transcription of low-resolution screenshots may contain OCR errors.
- **Candidate-described verbal accounts:** When evaluating user-typed or dictated descriptions of calls or verbal conversations, the review reflects the candidate's description, not an original document or recording.
- **English only:** System instructions, schemas, and synthetic examples are designed exclusively for English-language communications.
- **Cannot verify identity or authority:** The tool analyzes text content only. It cannot verify whether an email address is spoofed or whether a sender actually works for the organisation they claim to represent.
- **Not legal advice:** All findings, missing-item checklists, and questions are informational prompts for self-advocacy and due diligence, not legal counsel.

---

<details>
<summary><strong>Tech Stack and Project Structure</strong></summary>

### Technologies Used

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **UI & Styling:** React 19, Tailwind CSS v4, custom semantic CSS tokens
- **AI SDK:** `@google/genai` (Interactions API with model fallback chain)
- **Validation:** Zod 4
- **Typography:** `next/font/google` (`IBM Plex Sans`, `IBM Plex Mono`, `Newsreader`)
- **Testing:** Vitest
- **Hosting:** Vercel

### Project Structure

```text
OfferClara/
├── docs/             # Specifications, design briefs, test plans, verified resources, and development logs
├── public/           # Static public assets (SVGs, web manifest)
├── src/
│   ├── app/          # Next.js App Router pages (/, /check, /resources, /privacy) and API route handlers
│   ├── components/   # React components (input form, workspaces, viewers, landing page, uploaders)
│   ├── data/         # Static verified resources, contextual self-checks, and synthetic examples
│   └── lib/          # Analysis pipeline, Gemini wrapper, quote validator, rate limiting, and upload helpers
├── tests/            # Automated offline unit and integration tests (Vitest)
└── tests-live/       # Live Gemini API evaluation tests (requires GEMINI_API_KEY)
```

</details>

---

<details>
<summary><strong>Getting Started</strong></summary>

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026.git
   cd OfferCheck-WisprFlow-Hackathon-2026
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and add your Google Gemini API key:
   ```bash
   cp .env.example .env.local
   ```

### Environment Variables

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Required server-side Google Gemini API key from Google AI Studio. |
| `GEMINI_MODELS` | Optional comma-separated model fallback chain (default: `gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite`, max 3). |
| `GEMINI_MODEL` | Optional legacy single-model override (used only if `GEMINI_MODELS` is unset). |
| `GEMINI_THINKING_LEVEL` | Optional thinking level override (`low`, `minimal`, `medium`, `high`). |
| `RATE_LIMIT_PER_WINDOW` | Optional maximum analyses per 15-minute window (default: 8). |
| `RATE_LIMIT_PER_DAY` | Optional maximum analyses per 24-hour day (default: 30). |
| `TRANSCRIBE_LIMIT_PER_WINDOW` | Optional maximum transcriptions per 15-minute window (default: 6). |
| `TRANSCRIBE_LIMIT_PER_DAY` | Optional maximum transcriptions per 24-hour day (default: 20). |
| `NEXT_PUBLIC_SITE_URL` | Optional public site URL for OpenGraph metadata resolution. |

### Development Scripts

- `npm run dev`: Start local development server at `http://localhost:3000`.
- `npm run build`: Build production application with Turbopack.
- `npm start`: Start local production server after build.
- `npm test`: Run complete offline Vitest test suite.
- `npm run test:live`: Run live Gemini API evaluation suite (requires `GEMINI_API_KEY`).
- `npm run lint`: Run ESLint checks.
- `npm run typecheck`: Run TypeScript compiler type checking (`tsc --noEmit`).

### Deployment

OfferClara is configured for zero-configuration deployment on Vercel. Set `GEMINI_API_KEY` in the Vercel project environment variables. No external database or persistent storage setup is required.

</details>

---

<details>
<summary><strong>Testing and Evaluation</strong></summary>

### Offline Test Suite

The test suite runs completely offline with zero network calls and mock client injection:
```bash
npm test
```

The offline test suite validates:
- 5-step wizard workflow and pure session reducer state transitions.
- Global Command Bar natural language matching across 80+ patterns and conversational filler stripping.
- Institutional advisories pure matching against offer context and payment requests.
- Deterministic quote validation (Unicode grapheme handling, exact substring search, nested quote containment, and duplicate deduplication).
- Epistemic overclaiming guardrails and tone compliance.
- Zod schema validation and model output parsing.
- Model fallback chain, shared 55s deadline, and 20s per-attempt timeout cap.
- Sliding-window rate limiter, memory caps, and eviction logic.
- Model circuit breaker with tiered cooldowns and fail-open resilience.
- In-memory concurrency guard with guaranteed decrement.
- Input hygiene (blocking NUL characters and unprintable control characters).
- Binary file upload inspection, magic bytes, and canvas downscaling constraints.
- Generic source marker formatting and line numbering.
- Company research prompt builder and raw offer text exclusion.
- Contextual prioritization for self-checks and official resources.
- Dual-theme token architecture and WCAG 2.1 AA/AAA contrast ratios.
- Typographic rem scale enforcement and 0.875rem floor.
- Safe logging audit verifying zero offer text or API key leakage in server logs.

### Live API Tests

To test the pipeline against Google Gemini's API using the synthetic examples, combined inputs, and prompt-injection fixtures:
```bash
npm run test:live
```
*(Requires `GEMINI_API_KEY` in `.env.local`. If the key is absent, the suite cleanly skips with an explanatory message. Live calls consume free-tier quota).*

### Benchmark Evaluation Set

The evaluation dataset consists of five synthetic examples and one adversarial prompt-injection fixture. The benchmark cases, target behaviors, and verification matrices are documented in [docs/evaluation-set.md](docs/evaluation-set.md). The live-result column in that matrix is populated by the evaluator during live model test runs.

</details>

---

## Built with Wispr Flow

OfferClara was developed for the hackathon using Antigravity as the coding agent and Wispr Flow for dictated engineering prompts, feature change requests, and architectural decisions. These dictated entries, observations, resulting code changes, and verification records are documented chronologically in [docs/dev-log.md](docs/dev-log.md).

The OfferClara web application contains **no direct Wispr Flow integration** or in-app voice recognition features. Candidates and evaluators can type or dictate into the text area using any dictation tool or voice input software of their choice.

---

## Official Resources and Acknowledgements

OfferClara references official Indian statutory portals and reporting helplines:

- [National Cyber Crime Reporting Portal](https://cybercrime.gov.in) (`cybercrime.gov.in`) — 24/7 National Cyber Financial Fraud Helpline: **1930**
- [AICTE National Internship Portal](https://internship.aicte-india.org) (`internship.aicte-india.org`) — Free student internship services and reporting (`internship@aicte-india.org`)
- [National Career Service (NCS)](https://www.ncs.gov.in) (`ncs.gov.in`) — Ministry of Labour and Employment, Toll-free helpline: **1514**
- [Ministry of Corporate Affairs (MCA) Company / LLP Search](https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html) (`mca.gov.in`) — Official public search for registered Indian companies and LLPs

*(For verification details and date of verification, see [docs/resources-verification.md](docs/resources-verification.md)).*

---

## Roadmap

Planned future enhancements (not yet implemented in the codebase):

- **Job-offer evaluation benchmarks:** Adding dedicated job-offer sample communications and expanding evaluation criteria for full-time employment terms.
- **Contractual clause handling:** Specific detection and guidance for employment-specific clauses such as training-fee agreements and service bonds.
- **In-browser image redaction:** Client-side blur and crop tools directly inside the browser upload zone before transmission.
- **Multilingual guidance:** Translating official resource guidance and verification questions into regional Indian languages.

---

*Built solo for **No Hands: The Wispr Challenge** (WeMakeDevs x Wispr Flow), Builders track.*
