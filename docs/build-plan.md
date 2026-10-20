# Build Plan: OfferCheck

> **Hackathon Deadline:** October 30, 2026, 11:59 PM IST  
> **Target Completion Date for Submission Package:** October 29, 2026  
> **Track:** Builders track, solo entry ("No Hands: The Wispr Challenge")

This phased build plan outlines the implementation roadmap for OfferCheck, an internship-offer review assistant. Each phase specifies a distinct goal, concrete acceptance criteria, and its truthful status.

---

## Phase 1: Spec, Scaffold, Deployable Shell
- **Status:** Complete
- **Goal:** Establish project documentation, initialize the Next.js application framework with minimal dependencies, configure build/lint/typecheck scripts, and deliver a deployable frontend shell featuring the core input textarea, privacy guidance, live character counter, and tool limitations.
- **Acceptance Criteria:**
  - `docs/project-spec.md`, `docs/build-plan.md`, `docs/dev-log.md`, `README.md`, and `.env.example` are created and accurate.
  - Next.js project is scaffolded using official `create-next-app` with App Router, TypeScript, ESLint, minimal Tailwind CSS, and `src/` directory.
  - `src/lib/config.ts` exports `APP_NAME`, `TAGLINE`, and `MAX_INPUT_CHARS = 8000`.
  - Home page (`src/app/page.tsx`) displays the app name, tagline, plain-language description of capabilities and non-goals, prominent pre-paste privacy redaction notice, accessible textarea with character count indicator and over-limit warnings, visible "Phase 1 shell" development notice, and a "Limits of this tool" section.
  - No Analyze button, fake results, or mock data present in the UI.
  - `npm run lint`, `npm run typecheck`, and `npm run build` execute without errors.
  - Repository contains zero secrets, and `.gitignore` properly excludes `.env*` while preserving `.env.example`.

---

## Phase 2: Analysis Contract (Zod Schemas, Quotation Validator, Synthetic Examples, Unit Tests)
- **Status:** Complete
- **Goal:** Define strict type schemas and deterministic quotation validation mechanisms without connecting to an LLM, accompanied by four diverse synthetic test fixtures and comprehensive unit tests.
- **Acceptance Criteria:**
  - Zod schemas define the structured analysis response (`concerns`, `missingInfo`, `verificationQuestions`, `overallNote`) without risk scores or safety verdicts.
  - Pure function quotation validator checks every concern's quote against the raw user input; invalid or hallucinated quotes are safely rejected with character offsets mapped into the original text.
  - Overclaiming guardrail detector catches prohibited phrases ("verified safe", "definitely a scam", numeric percentages) while tolerating objective and hedged phrasing.
  - Four synthetic test fixtures are created and clearly labelled as synthetic:
    1. Urgent payment request (fee demanded with tight deadline).
    2. Incomplete but not obviously suspicious offer (missing standard terms).
    3. Detailed professional offer (no upfront payment clauses; zero payment-request words).
    4. Ambiguous communication (insufficient data to make an assessment).
  - Vitest test suite verifies schema compliance, quotation validation logic, guardrails, edge cases, synthetic examples, and prompt-injection fixture.

---

## Phase 3: Server-Side Gemini Analysis Endpoint
- **Status:** Complete
- **Goal:** Implement a server-side route handler communicating with the Gemini API to analyze offer text, enforcing injection resistance, structured JSON generation, and graceful error recovery.
- **Acceptance Criteria:**
  - Server route (`/api/analyze`) accepts untrusted offer text, validates input length (`<= MAX_INPUT_CHARS`), and blocks malicious injection patterns.
  - Uses current official Gemini SDK (`@google/genai` Interactions API) with server-only environment variable (`GEMINI_API_KEY`).
  - Strict system instructions enforce evidence rules, calm tone, and prohibit scam scores, safety guarantees, and legal claims.
  - Raw offer text is excluded from server logging.
  - Graceful error responses returned for upstream timeouts, network failures, or malformed responses.

---

## Phase 4: Results UI
- **Status:** Complete
- **Goal:** Connect the frontend form to the analysis endpoint, displaying structured findings across the four required sections with quotation highlights and verification question export. Reorganize layout so input is higher on the page.
- **Acceptance Criteria:**
  - Input form moved higher on the page so users can immediately reach and paste text without scrolling past explanatory cards.
  - Submit/Analyze button added with loading, progress, and disabled states during request processing.
  - Four output sections rendered cleanly: Potential Concerns (with verbatim highlighted quotes), Missing or Unclear Information, Verification Questions, and Limits of the Review.
  - Easy one-click clipboard copying for suggested verification questions.
  - Clean error handling displays non-alarmist, actionable guidance if analysis fails.
  - Ephemeral state management: refreshing or navigating away discards sensitive data.

---

## Phase 4b: Guidance and Resources
- **Status:** Complete
- **Goal:** Add verified official verification resources (Cybercrime 1930, AICTE, NCS, MCA), static student self-checks ordered contextually, priority-based concern sorting, quote deduplication/containment in validation, and prompt refinements.
- **Acceptance Criteria:**
  - Official resource data in `src/data/verification-resources.ts` verified against official government portals on 2026-10-20.
  - Pure selection function `selectResources` includes MCA and Cybercrime always (expanded on financial/sensitive concerns), and matches AICTE and NCS via word boundaries.
  - Static self-checks in `src/data/self-checks.ts` ordered contextually via `selectSelfChecks` (payment -> 4 first; sensitive -> 5 first; off-platform -> 2 and 3 first).
  - Priority sort `sortConcernsByPriority` orders concerns by severity (upfront payment, deposit, urgency, sensitive data, off-platform, other) while preserving relative model order.
  - `validateAnalysis` drops nested (shorter contained) quotes and duplicate quotes without incrementing `droppedCount`.
  - Added new disclaimer to `REVIEW_LIMITS` regarding named organizations; updated privacy notice with passwords/OTPs.
  - UI renders "Check these yourself" in Section C and "Next steps and official resources" section with external links, copyable contacts, and collapsible cybercrime card.
  - All offline tests, typecheck, lint, and build pass.

---

## Phase 5a: Landing Page and Routing
- **Status:** Complete
- **Goal:** Introduce an asymmetric landing page at `/` with an interactive annotated document, move the analysis tool to `/check`, implement in-memory session persistence surviving client navigation without browser storage, apply the "Annotated Paper" design system v2 with self-hosted Google Fonts (`Instrument Serif`, `Instrument Sans`, `IBM Plex Mono`), and add branded 404, error boundary, SVG favicon, and `next/og` Open Graph image.
- **Acceptance Criteria:**
  - Root `/` serves the landing page: asymmetric typography, primary CTA "Check an offer" above the fold at 1366x768 and 390x844, interactive document card featuring synthetic Example 1 with cursor-hover highlighting and sliding margin notes, gentle 3D parallax tilt (max 3 degrees) via `requestAnimationFrame` with touch/reduced-motion fallback, scroll-triggered "How it works" reveal, "What you get" index cards, "What OfferCheck will not do", "Privacy" notice, `<details>` FAQ accordion, and final CTA.
  - Tool relocated to `/check` with full feature parity, input validation, sample picker, and results workspace.
  - `SessionProvider` client context in `src/app/layout.tsx` with pure reducer `offerSessionReducer`; persists offer text, analysis snapshot, and in-flight request status across client navigation; zero persistent browser storage (no `localStorage`, `sessionStorage`, cookies, or database); resets on hard refresh.
  - Feature flags in `src/lib/features.ts` ensure copy advertises only live features (`textAnalysis: true`, `documentUpload: false`, `companyResearch: false`).
  - Typography powered by `next/font/google` (`Instrument_Serif`, `Instrument_Sans`, `IBM_Plex_Mono` with `display: swap`).
  - Branded `not-found.tsx` and `error.tsx` matching design tokens.
  - SVG favicon (`src/app/icon.svg`) and OpenGraph card (`src/app/opengraph-image.tsx` using `next/og`).
  - Dynamic `metadataBase` configured from `NEXT_PUBLIC_SITE_URL` / Vercel production URL.
  - All 187 offline tests pass; lint, typecheck, and build pass cleanly.

---

## Phase 5: Document Input (PDF + Screenshots)
- **Status:** Not started
- **Goal:** Enable users to submit offers via one PDF or up to three screenshots, using multimodal transcription followed by explicit user review and redaction before running the unified text analysis pipeline.
- **Acceptance Criteria:**
  - File upload component accepts 1 PDF or up to 3 image screenshots.
  - AI model only performs transcription to plain text; no direct analysis occurs during document intake.
  - User reviews, verifies, and edits the transcription in the textarea to redact personal information.
  - Verified transcript feeds directly into the standard Phase 3 text pipeline, preserving quotation validation against confirmed text.
  - Strict file size and page count limits enforced and verified against current Vercel and Gemini documentation.
  - Video upload explicitly disallowed and documented as future work.

---

## Phase 6: Safeguards and Documented Test Set
- **Status:** Complete
- **Goal:** Harden the application with input sanitization, real request cancellation, in-memory sliding-window rate limiting with salted SHA-256 key hashing, model circuit breaker, concurrency controls, security headers, logging audit, and comprehensive evaluation documentation.
- **Acceptance Criteria:**
  - Real network cancellation: AbortSignal passed to `@google/genai` Interactions API options, aborting on timeout and cleaning up timer handles.
  - Per-client sliding window rate limiting: default 8 analyses per 15 minutes, 30 per 24 hours, overridable via `RATE_LIMIT_PER_WINDOW` and `RATE_LIMIT_PER_DAY`.
  - Salted SHA-256 client key hashing: raw IP never stored, logged, or returned. Map capped at 5,000 keys with eviction.
  - Pre-analysis validation checks ensure invalid requests (empty, too short, too long) do not consume rate limit allowance.
  - In-memory concurrency guard: at most 4 simultaneous in-flight analyses per instance, returning 503 `BUSY`. Guaranteed decrement in `finally` block.
  - Model circuit breaker: tiered cooldowns (5 min on timeout, 15 min on 429, 1 min on 503/5xx); skipped models do not count toward attempts or deadlines; falls back to all models if all are on cooldown.
  - Input hygiene: blocks NUL characters and >30% control characters with 422; CRLF preserved to protect verbatim quote offsets.
  - Security headers added in `next.config.ts`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, restrictive `Permissions-Policy`.
  - Privacy policy in `docs/privacy-and-responsible-use.md` and evaluation benchmark set in `docs/evaluation-set.md`.
  - Automated logging audit test ensures zero sensitive variable leaks across `src/`.

---

## Phase 7: Company Research Handoff (Perplexity Prompt Builder)
- **Status:** Complete
- **Goal:** Provide a resilient, zero-cost external research handoff allowing students to inspect company authenticity via a structured prompt copied to Perplexity, without any search API, network calls, or third-party data transmission from our servers.
- **Acceptance Criteria:**
  - Pure deterministic contact extractor (`src/lib/research/extract.ts`) extracts emails, lowercased sender domains, and URLs, with a documented `isFreeEmailDomain` list.
  - Model entities schema in `src/lib/analysis/schema.ts` extended with optional `entities: { companyName, roleTitle }`, validated in `validateAnalysis` (case-insensitive, whitespace-collapsed exact substring match in source text, max 100 chars, else null).
  - Pure prompt builder (`src/lib/research/prompt.ts`) formats short (300 words) and detailed (600 words) research templates with strict sanitization; offer text is structurally excluded.
  - UI component (`src/components/CompanyResearchCard.tsx`) rendered after Section C and collapsed under empty state; editable fields; plain text observations on free email or domain mismatch; claimed website strictly plain text (never a link); clipboard copy with fallback and plain link to Perplexity.
  - Feature flag `companyResearchPrompt` enabled in `src/lib/features.ts`; Tavily and in-app automated search explicitly removed and not planned.
  - All offline unit tests, typecheck, lint, and build pass cleanly.

---

## Phase 9: Docs, Deployment, Classmate Feedback, Demo, Submission Package
- **Status:** Not started
- **Goal:** Deploy the application to a public zero-sign-in URL, conduct peer evaluation, record demo walkthrough (up to 2 minutes), and finalize all competition submission deliverables.
- **Acceptance Criteria:**
  - Application deployed to Vercel with clean public URL accessible to hackathon judges without authentication.
  - Real-world feedback collected from student classmates and logged in `docs/dev-log.md`.
  - Comprehensive demo video (up to 2 minutes) produced highlighting the problem, features, and evidence-first philosophy.
  - Submission repository packaged with updated documentation, architectural diagrams, and license.
  - Complete submission ready by target date of October 29, 2026.
