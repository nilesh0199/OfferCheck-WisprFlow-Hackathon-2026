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

## Phase 8: Document Input (PDF + Screenshots Multimodal Transcription)
- **Status:** Complete
- **Goal:** Enable users to submit offers via up to 5 files (screenshots: PNG, JPEG, WebP; and/or PDFs, up to 4 MB total), using Gemini multimodal Interactions API solely for plain text transcription, followed by mandatory candidate review and redaction in the editor before running the unified text analysis pipeline.
- **Acceptance Criteria:**
  - File upload component accepts up to 5 screenshots or PDF documents up to 4 MB total with drag-and-drop, native file browser, and Ctrl+V clipboard paste.
  - Binary magic-byte inspection verifies genuine file headers (PNG, JPEG, WebP, PDF) and rejects spoofed files with HTTP 400.
  - Client-side canvas compression downscales large screenshots (max 1600 px width, 6000 px height, 12 MP cap) to stay under Vercel limits without degrading legibility.
  - Interactions API multimodal pipeline transcribes files with model fallback chain, shared deadline, and circuit-breaker integration.
  - System instructions treat file contents as untrusted data, preventing prompt injection from executing.
  - Extracted text is sanitized, joined with `[File N of M]` headers, and loaded into the textarea for candidate review and redaction.
  - Separate transcribe rate limiter (default 6/15m, 20/24h) protects upstream multimodal quotas without impacting text analysis limits.
  - Single pipeline integrity: analysis executes strictly on confirmed text, preserving deterministic quotation validation.
  - Ephemeral state: zero files saved to server disk or cloud storage; zero file contents or filenames logged; volatile browser RAM only.

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

## Phase 9a: Submission-Ready Cleanup
- **Status:** Complete
- **Goal:** Remove prototype indicators and placeholders, adjust serif display typography, introduce a dedicated static `/resources` page with official contacts and 4 post-payment steps, audit link accessibility and color contrast (>= 4.5:1), sanitize package metadata, clean unreferenced default Next.js assets, verify repository secrets, split development logs into build and dictation records, and add automated tests for resource host allowlisting and page structures.
- **Acceptance Criteria:**
  - Prototype badges and placeholder labels removed from all headers and user-facing views.
  - Serif display headings adjusted to tracking >= -0.02em and line-height 1.04–1.1 to prevent glyph collision across all viewports.
  - Static server component route `/resources` created with post-payment action steps and all 4 official statutory resources always expanded using refactored `ResourceCard`.
  - Links to `/resources` added in navigation headers, footers, results section, and FAQ.
  - FAQ question 6 rewritten with calm, non-alarmist guidance; link styling verified for >= 4.5:1 contrast in light and dark modes.
  - `package.json` updated with project name `offercheck`, version `1.0.0`, description, repository URL, and keywords; unused starter SVGs in `public/` removed.
  - Repository verified free of secrets; `.gitignore` updated with `*.log`.
  - Development log split into Build log (what changed) and Dictation log (author-provided).
  - Automated tests verify URL host allowlist and resources page data.
  - All offline tests, typecheck, lint, and production build pass cleanly.

---

## Phase 9b: Hero Entrance Animation and Scroll Scene
- **Status:** Complete
- **Goal:** Implement non-blocking hero entrance animation inside the document card (<= 3.2s) with SVG magnifying lens and sweep reveals, accompanied by a native scroll-driven inspection scene ("A second look, line by line") with stacked card fallbacks on mobile and reduced motion.
- **Acceptance Criteria:**
  - Entrance animation runs inside hero card only; headline, subhead, and CTAs render immediately.
  - SVG magnifying lens glides along target path, pausing to reveal highlights and update observations, fading out cleanly (duration <= 3200 ms).
  - Skips on pointerdown, keypress, or scroll > 10px. Ghost replay button available when motion allowed.
  - CSS failsafe reveals highlights after 3.8s if JS fails; <noscript> reveals immediately.
  - Scroll scene ("A second look, line by line") features 260vh container with sticky stage on desktop (>=1024px width, >=640px height) and stacked cards on mobile/reduced motion.
  - Pure functions in `src/lib/landing/entrance.ts` and `src/lib/landing/scene.ts` with comprehensive unit test suite.
  - Zero animation libraries, zero scroll hijacking, zero layout shifts.

---

## Phase 9c: Combined Input, Upload Resilience & Print Export
- **Status:** Complete
- **Goal:** Unify text and file input into a single card on `/check`, diagnose and eliminate transcription failure modes, isolate circuit breaker states, implement model-specific 400 fall-through, update MCA action label and verified links, provide a clean print stylesheet with PDF export, and update documentation.
- **Acceptance Criteria:**
  - Root cause investigation and reproduction of upload error completed across client request headers, field names, fallback chain 400 handling, JSON schema, request body overhead, and circuit breaker isolation.
  - Model-specific 400 handling implemented in `src/lib/analysis/gemini.ts` allowing unsupported modality/capability 400s to fall through while non-model-specific 400s fail immediately.
  - Dedicated circuit breaker instance (`defaultTranscribeCircuitBreaker`) prevents transcription timeouts from cooling down models for text analysis.
  - Safe error logging (`logSafeTranscribeError`) with truncated upstream error diagnostics (development only) and client reference error codes (`Reference: <ERROR_CODE>`).
  - Single unified input card in `src/components/OfferInputForm.tsx` replaces separate tabs: textarea always visible, "Attach files (optional)" below it, `AI_FILE_NOTICE` placed directly above the "Add text from files" action button (no Gemini mention in button label).
  - Pure `appendTranscript` helper appends extracted text below existing text with `\n\n` separator, preserving `[File N of M]` markers.
  - Dismissible success banner with 1-level in-memory Undo reverting to previous text; Undo is discarded if user manually edits the textarea.
  - Pending attached files cleared on transcription success; kept in place on transcription failure.
  - Auto-scroll and focus textarea to start of appended text.
  - Global Ctrl+V file/image pasting anywhere in the card attaches files, while text pastes normally into the textarea.
  - MCA action label set to `"Open the MCA company or LLP name search"` with verified registry URL in `src/data/verification-resources.ts`; automated test verifies all URLs against `docs/resources-verification.md`; GitHub privacy links point to default branch `main`.
  - Clean `@media print` stylesheet in `src/app/globals.css` isolating the analysis report, hiding UI chrome, and "Export review (PDF)" button triggering `window.print()`.
  - Offline Vitest test suites pass cleanly across all modules.

---

## Phase 10: Theme System, Console Density, Balanced Workspace & Contextual Research Nudge
- **Status:** Complete
- **Goal:** Introduce explicit Light, Dark, System theme system with Light default, enterprise console density (Design System v3), balanced 2-column workspace layout on `/check`, contextual company research nudge with always-visible controls, Indian/British English spelling standardisation, and accurate storage claims.
- **Acceptance Criteria:**
  - Pure theme resolution utilities in `src/lib/theme.ts` (`parseStoredTheme`, `resolveTheme`) and anti-FOUC inline script injected in `src/app/layout.tsx`.
  - `data-theme="light" | "dark"` attribute on `<html>` with `@custom-variant dark` in `src/app/globals.css` and dynamic `<meta name="theme-color">` updates.
  - Accessible segmented control `ThemeToggle` (`role="radiogroup"`, roving tabindex, keyboard arrow navigation, visible focus rings) in `Header`, `LandingNav`, `ResourcesPage`, `NotFound`, and `ErrorBoundary`.
  - Design System v3 tokens implemented: light canvas `#F2F3F3`, surface `#FFFFFF`, surface-alt `#F8F8F8`, border `#D5DBDB`, border-strong `#AAB7B8`, text `#16191F`, text-muted `#545B64`, header-bg `#1F2933`, header-text `#FFFFFF`, primary `#1E5C46`, focus ring `#1E5C46`, observation tint `#FFF7D6` with 3px yellow border, info tint `#EEF2F6`. Dark tokens: warm charcoal palette.
  - Console density implemented across components: 1px borders, 4px card radius, 2px control radius, 32-36px control heights, 14px base / 12px secondary typography, sentence-case tool headings in `Instrument Sans`, and 2-column missing details table (`Topic | Note`).
  - Balanced 5/12 left, 7/12 right desktop layout on `/check`. Left column after review features sticky `YourOfferWorkspace` (read-only verbatim highlight snapshot, highlight count, character count, "Edit text", "New review" with inline confirmation) and `OnThisPageNav` (IntersectionObserver scroll spy). Desktop horizontal jump nav removed; mobile horizontal jump nav preserved.
  - Pure function `getResearchNudge` in `src/lib/research/nudge.ts` evaluating unnamed employer, free email without website, and internship without supervisor (word boundary enforced).
  - `CompanyResearchCard` updated with dual placement (recommended top under summary vs optional lower after questions), always-visible 1-line key-value summary, depth switcher, copy and Perplexity actions, required inline company input when missing, and expandable details.
  - Indian/British English spelling applied across `REVIEW_LIMITS` and user-facing copy (`organisation`, `authorised`, `recognise`, `prioritise`, `behaviour`, `colour`).
  - Storage claims updated in hero strip, privacy section, FAQ, `README.md`, and `docs/privacy-and-responsible-use.md` to state that offer text and files are memory-only, with theme choice as the sole item in browser storage (`localStorage`).
  - Comprehensive unit test suites in `tests/theme.test.ts` and `tests/research-nudge.test.ts`; all offline tests, typecheck, lint, and build pass cleanly.
