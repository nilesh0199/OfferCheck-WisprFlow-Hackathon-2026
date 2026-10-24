# Build Plan: OfferClara

> **Tagline:** *"Understand the offer. Know what to verify. Make every offer clear."*  
> **Hackathon Deadline:** October 30, 2026, 11:59 PM IST  
> **Target Completion Date for Submission Package:** October 29, 2026  
> **Track:** Builders track, solo entry ("No Hands: The Wispr Challenge")

This phased build plan outlines the implementation roadmap for OfferClara, an internship-offer review assistant. Each phase specifies a distinct goal, concrete acceptance criteria, and its truthful status.

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
  - Root `/` serves the landing page: asymmetric typography, primary CTA "Check an offer" above the fold at 1366x768 and 390x844, interactive document card featuring synthetic Example 1 with cursor-hover highlighting and sliding margin notes, gentle 3D parallax tilt (max 3 degrees) via `requestAnimationFrame` with touch/reduced-motion fallback, scroll-triggered "How it works" reveal, "What you get" index cards, "What OfferClara will not do", "Privacy" notice, `<details>` FAQ accordion, and final CTA.
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
  - `package.json` updated with project name `offerclara`, version `1.0.0`, description, repository URL, and keywords; unused starter SVGs in `public/` removed.
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

---

## Phase 11: UI Foundations Pass (Design System v4)
- **Status:** Complete
- **Goal:** Refine visual craft, contrast, typography, widescreen responsive canvas, `/check` 3-zone desk layout with bi-directional evidence linking, and hero motion resilience without modifying the analysis pipeline or adding dependencies.
- **Acceptance Criteria:**
  - Author `docs/design-brief.md` (< 120 lines) synthesizing guidance from design skills (`frontend-design`, `ui-ux-pro-max`, `design-taste-frontend`, `nextjs-app-router-patterns`) with explicit rationale for adopted and rejected suggestions.
  - Semantic token architecture in `src/app/globals.css` with explicit `color-scheme: light` and `color-scheme: dark`. Zero raw hex or default palette utility classes in production markup.
  - Contrast verification in `tests/wcag-contrast.test.ts` proving text $\ge 4.5:1$ (AA/AAA) and borders/focus rings $\ge 3:1$ in both light and dark themes.
  - Token audit test in `tests/token-audit.test.ts` verifying no un-tokenised color classes leak into production components.
  - Typographic system updated in `src/app/layout.tsx` to `IBM_Plex_Sans`, `IBM_Plex_Mono`, and `Newsreader` (Google Fonts via `next/font`), establishing 15px base body text, 13px secondary text, absolute minimum 12px, tabular numbers for numeric metrics, and prose containers constrained to `max-w-[70ch]`.
  - Full-width fluid responsive container primitive in `src/components/layout/Container.tsx` with dynamic padding clamp and 2000px max width replacing narrow wrappers.
  - Responsive `/check` workspace layout: Pre-review balanced 7/12 input card and 5/12 helper card (with sample picker, review expectations, privacy note); Post-review desktop ($\ge 1280$px) 3-zone layout with ~400px sticky left rail offer viewer, fluid centre column with prose capped at 70ch, and ~260px sticky right rail summary and actions.
  - Bi-directional evidence linking between observation cards and verbatim offer viewer with line numbering via pure `lineOfOffset` helper and test suite in `tests/line-offset.test.ts`.
  - Mobile touch targets $\ge 44$px across all interactive controls, sticky bottom action bar on viewports $<640$px with `env(safe-area-inset-bottom)`, and `overflow-x: clip` preventing horizontal scrolling.
  - Hero motion resilience: wait for `document.fonts.ready` + 100ms before measuring highlight targets, 300ms gesture grace period to ignore scroll restoration on reload, persistent ghost button, and `overflow-x: clip` on `html, body` restoring native CSS `position: sticky` on the scroll scene.
  - Offline Vitest test suites, TypeScript typecheck, ESLint, and Next.js Turbopack production build pass cleanly.

---

## Phase 12: UI Pass (Ink Blue Palette, Alignment, Typography Scale & Anti-Template Polish)
- **Status:** Complete
- **Goal:** Implement the Ink Blue color system, establish a verified typographic scale with an enforced 13px minimum floor, ensure strict container left-edge alignment, and eliminate all AI template tells across the application.
- **Acceptance Criteria:**
  - Token architecture in `src/app/globals.css` with swappable Ink Blue primary system (Palette A default, with Palette B Petrol and Palette C Cobalt documented in `docs/design-brief.md`).
  - Dual-theme WCAG AA/AAA compliance verified by automated unit tests in `tests/wcag-contrast.test.ts`.
  - Header styled in navy with brand wordmark in white, header-nav-text links, primary action button, segmented theme selector, and high-contrast focus rings.
  - Semantic container hierarchy on `/check`: observations with observation tint and 3px left border; missing details table header in info tint; questions cards in action tint; "Check these yourself" card with 3px primary top border; company research card with 3px primary top border; active "On this page" item with action tint background and 3px primary left border.
  - Alignment rules: all sections wrapped in `Container`; headings aligned to container left edge; FAQ two-column grid on desktop with `items-start`; balanced hero and scroll scene columns.
  - Elimination of AI template tells: zero uppercase tracked eyebrows; zero duplicate numbering; zero text arrows or triangle glyphs (`&rarr;`, `→`, `▲`, `▼`); custom SVG rotating chevrons on all disclosure elements; mono font restricted to code/quotes/line numbers; decorative dot-grid textures removed.
  - Typography scale: Tailwind v4 scale overridden in `globals.css` (`text-xs` 13px, `text-sm` 14px, `text-base` 16px); 13px absolute minimum font size enforced across all source files by automated tests in `tests/token-audit.test.ts`.
  - Offline Vitest test suites, TypeScript typecheck, ESLint, and Next.js Turbopack production build pass cleanly.

---

## Phase 13: Layout, Navigation, Privacy Page & REM Text Scale
- **Status:** Complete
- **Goal:** Streamline `/check` input into a unified action bar with click-to-load sample cards, implement two independent flex columns for the FAQ, widen line-by-line step cards, introduce a dedicated static `/privacy` route, convert typography to a fluid rem-based scale with an enforced 0.875rem floor, and verify phone usability across all viewports.
- **Acceptance Criteria:**
  - Dropdown select completely removed from `/check` (zero `sample-select` or `SamplePicker`); samples load via `SampleCards` with "Synthetic example" badges and inline replacement confirmation.
  - Unified top action bar on `/check`: Analyze button (`sm:inline-flex`), secondary "Attach files", ghost "Clear", live character count, hover-device Ctrl/Cmd+Enter shortcut, and one-line disabled reason linked via `aria-describedby`. Compact data notice below bar links to `/privacy`.
  - Pre-review right column on desktop ($\ge 1280$px) displays `SampleCards` and "What you will get"; post-input displays "Before you review" panel (source summary, personal details reminder, collapsed "Try a sample instead" disclosure) with zero duplicate primary buttons.
  - Mobile viewports ($< 640$px): top bar shows "Attach files" and "Clear"; primary Analyze button is in sticky bottom action bar; container has `pb-24 sm:pb-8`; textarea has `scroll-mb-24` ensuring caret is never obscured.
  - FAQ two independent flex columns on desktop ($\ge 1024$px) via pure `splitIntoColumns(items)`, with `items-start` preventing sibling column shifting. Single column $< 1024$px. Zero CSS multi-column or grid rows. Unit tests in `tests/faq.test.ts`.
  - Line-by-line inspection fallback renders a 3-column responsive grid on $\ge 768$px and $\ge 1024$px spanning full container with equal card heights; desktop pinned stage balanced (~5/12 and ~7/12).
  - Dedicated static server component at `/privacy` with 7 sentence-case sections, verbatim `AI_DATA_NOTICE` and `AI_FILE_NOTICE`, "Last updated 22 Oct 2026", and zero verdict words. Unit tests in `tests/privacy.test.ts`. All UI privacy links point to `/privacy`.
  - Root font-size clamp in `src/app/globals.css`: `html { font-size: clamp(16px, calc(12px + 0.3125vw), 18px); }` and `body { font-size: 1rem; }`. REM scale: `text-xs` 0.875rem, `text-sm` 0.9375rem, `text-base` 1rem. All font sizes in `src/` converted to rem. Automated test in `tests/token-audit.test.ts` fails if any px font size appears under `src/` (except html clamp and print 11pt) or if any token < 0.875rem.
  - Phone checklist verified across 360, 390, 430, 768, 1024, 1280, 1440, and 1920px: no horizontal scroll, tap targets $\ge 44$px, caret never covered.
  - Offline Vitest test suites, TypeScript typecheck, ESLint, and Next.js Turbopack production build pass cleanly.

---

## Phase 14: Source Labels, Described Conversations & Input Neutralization
- **Status:** Complete
- **Goal:** Implement generic, privacy-preserving source labels for multimodal file transcripts (`---- Text from Screenshot N ----` and `---- Text from PDF N ----`), support user-described verbal interactions (typed or dictated) with clear epistemic boundaries and a 7th fixed review limit, neutralize UI terminology from "offer" to "text", render source markers as muted divider rows in workspaces, add a 5th synthetic sample for a described phone call, and update privacy policies stating file names are never sent to Google.
- **Acceptance Criteria:**
  - Pure marker helpers in `src/lib/upload/markers.ts` (`formatSourceMarker`, `isSourceMarkerLine`, `containsSourceMarkerLine`, `nextSourceNumber`, `buildAppendBlock`) formatting source blocks with sequential numbering continuing from existing text and preserving user text byte-for-byte.
  - Route `/api/transcribe` returns structured `{ ok: true, files: [{ kind, transcript, readable }] }` without server-side file joining.
  - Analysis system instructions and `validateAnalysis` drop any concern or related quote containing a source marker line.
  - `YourOfferWorkspace` and `HighlightedTextViewer` render source marker lines as muted divider rows with top borders and muted styling while preserving line numbers.
  - 7th fixed limit added to `REVIEW_LIMITS`: `"If the text is your own description of a call or conversation, the review reflects your description, not a recording or a document."`
  - Guidance under `<textarea>` in `OfferInputForm` explains how to describe calls or verbal conversations in one's own words (typed or dictated).
  - Terminology neutralized across headings, left rails, viewers, and header steps ("Your text", "Editing text", "Input text or files").
  - 5th synthetic sample added (`example-5-phone-call-account`) featuring fictional company `KiteSpindle Business Services`; `SampleCards` renders all 5 samples.
  - Privacy policy updated on `/privacy` and in `docs/privacy-and-responsible-use.md` confirming original file names are never sent to Google or logged.
  - Offline Vitest test suites, TypeScript typecheck, ESLint, and Next.js Turbopack production build pass cleanly.

---

## Phase 15: Milestones M0–M8 Submission Overhaul
- **Status:** Complete
- **Goal:** Implement the 5-step intake wizard, 3-column master-detail results workspace, Global Command Bar, verified institutional advisories, static landing page overhaul, product rename to OfferClara, and official branding.
- **Acceptance Criteria:**
  - 5-step wizard (`WizardContainer`, `WizardStepper`, `Step1Offer` through `Step5Review`) on `/check` with synthetic samples A and B.
  - Master-detail workspace with `ResultsNav`, fluid `AnalysisResults`, and `YourOfferWorkspace` with bi-directional quote linking.
  - Institutional advisories pure matcher (`advisories.ts`, `selectAdvisories`, `OfficialAdvisoriesSection.tsx`) matching verified notices from IIT Bhubaneswar, St. Xavier's College Jaipur, and Careers360 / IIT Roorkee report.
  - Static fast landing page overhaul with `StaticAnnotatedCard`, `WizardOverviewSection`, `CommandBarPreviewSection`, and `CapabilitiesComparisonSection`.
  - Renamed product from OfferCheck to OfferClara across UI, metadata, constants, and logs; official logo component created.

---

## Phase 16: Milestones P0–P9 Navigation, Layout & Command Box Refactoring
- **Status:** Complete
- **Goal:** Unify global top bar navigation across all routes, implement a zero-scroll responsive slide-over sidebar, calibrate page copy, refine the check intake header with a shared clear review confirmation dialog, restrict the command bar to a voice-ready navigation box, prohibit normative employment wording in prompt and guardrails, and enforce strict link and print safety.
- **Acceptance Criteria:**
  - **P0 State Check:** Verified baseline test suite, located prior header in git history, identified duplicate buttons and hero copy.
  - **P1 One Top Bar Across Every Page:** Mounted `TopBar.tsx` in `src/app/layout.tsx` across all routes (`/`, `/check`, `/resources`, `/privacy`, `/about`, 404, error) with 44px sidebar toggle button, 16px gap, unified logo + wordmark link to `/`, responsive desktop nav ($\ge 1100$px), compact theme toggle and primary check button below 1100px.
  - **P2 Zero-Scroll Sidebar:** Built native HTML5 `<dialog id="app-sidebar">` in `Sidebar.tsx` with dynamic item height scaling (`itemHeightRem`) fitting 100dvh without vertical scrolling, clean of external vendor badges.
  - **P3 About Page Section Order:** Ordered sections to "Why it exists", "What it does", "What it does not do", "Who made it", and "Policies and official reporting" with verified Nilesh Thipe attribution and LinkedIn/GitHub links.
  - **P4 Help and Reporting Renaming:** Renamed resources tab and headings to "Help and reporting", added `#already-paid` anchor with scroll margin for emergency steps.
  - **P5 Home Page Copy Refinement:** Hero headline updated to "Understand the offer. Know what to verify.", removed duplicate paragraphs and eyebrow badges, shifted hero up.
  - **P6 Check Page Intake & Shared Clear Dialog:** Set h1 to "Check an offer", exact description without em dashes, shortened rail label to "Resources", added ghost button "Clear and start over" in wizard header row, extracted reusable `<ClearReviewDialog>` with `<dialog id="clear-review-dialog">`, and removed duplicate export buttons from `AnalysisResults.tsx`.
  - **P7 Navigation-Only Command Box:** Refactored `matchCommand.ts` and `CommandBar.tsx` to navigation-only scope (`open/close sidebar`, `home`, `check an offer`, `help and reporting`, `about`, `privacy`, `how it works`, `what you get`, `faq`, `i paid`, `next`, `back`, `skip`, steps 1–5, `analyse`, section jumps), 2-second visual countdown with Escape cancel and Enter immediate execution, immediate clearing on unrecognised input with polite announcement, wrong-context detection, and "What can I say?" accessible help dialog. Removed answer-setting commands and "Add to offer text" flow.
  - **P8 Link Safety, Print Styles & Normative Wording Prohibition:** Added system instruction and deterministic guardrail rejecting normative employment claims containing `standard`, `typical`, `normal`, `usual` in model-written fields; added dynamic document title `OfferClara review YYYY-MM-DD` and `print:hidden` across interactive controls; automated internal href test scanning every internal link against routes and element IDs.
  - **P9 Documentation & Verification:** All 439 unit tests passing across 46 test files in Vitest; ESLint clean (0 errors, 0 warnings); TypeScript typecheck clean (0 errors); Next.js production build succeeded.

---

## Phase 17: Milestones Q0–Q5 AI Providers, Doubt Inquiry & Help/Reporting Overhaul
- **Status:** Complete
- **Goal:** Integrate Groq as a second text AI provider on free tier, build the "Clear doubt with AI" route (`/ask`) with tab-memory thread and strict guardrails, upgrade `/resources` with click-to-load YouTube video embeds, post-payment questionnaire, and deterministic checklist generator, enforce responsive phone usability, and update documentation.
- **Acceptance Criteria:**
  - **Q0 State Check:** Baseline verified clean, documented missing `/ask`, Groq integration, video embeds, and questionnaire.
  - **Q1 Groq as Second AI Provider:** Implemented plain `fetch` client in `src/lib/ai/groq.ts` targeting model `openai/gpt-oss-120b` (low reasoning effort, max output tokens, hidden reasoning). Integrated into `runModelFallbackChain` in `src/lib/analysis/gemini.ts` as fallback after Gemini models, reserving 12 s of shared 55 s deadline, with token guard (>7,000 skipped), circuit breaker prefixed `groq:openai/gpt-oss-120b`, dynamic 429 `retry-after` cooldown, and one retry on malformed JSON. Verified that files are never sent to Groq. Updated `AI_DATA_NOTICE`, `/privacy`, `.env.example`, and `README.md`. 12 unit tests in `tests/groq.test.ts` and live test in `tests-live/groq.live.test.ts`.
  - **Q2 Clear Doubt with AI (`/ask`):** Built interactive `/ask` route and `AskClient.tsx` featuring labelled textarea "Your question" (1,500-char counter, Ctrl/Cmd+Enter support, dictation-friendly), 4 clickable example chips, optional high-level context toggle (never sends raw text or files), up to 6 turns kept in tab memory (`SessionProvider`), calm error recovery with fallback facts, and fixed closing disclaimers. Route `/api/ask` (body cap 32 KB, separate rate limits 10/15m and 40/day) prioritizes Groq first, falling back to Gemini chain and deterministic offline fallback. Zod schema in `src/lib/ask/schema.ts`, system prompt with verbatim official facts and Hindi/English mirroring in `src/lib/ask/prompt.ts`, and guardrails dropping banned verdict words in `src/lib/ask/guardrails.ts`. Wired into `TopBar.tsx`, `Sidebar.tsx`, `LandingFooter.tsx`, `CommandBar.tsx`, `match.ts`, and `docs/voice-commands.md`. Tested in `tests/ask.test.ts`.
  - **Q3 Help and Reporting Page Overhaul (`/resources`):** Rebuilt `/resources` with click-to-load video cards using `youtube-nocookie.com` (Video 1 `Kr-B8sAE6ek` in 16:9, Video 2 `3S47zE8cWCI` in 9:16 vertical short) with third-party cookie disclosures and external fallback links. Prominent `#already-paid` card with hash-based auto-expansion, 4 initial protective steps, and interactive 4-question questionnaire (Q1-Q4) with mutual exclusivity. Deterministic pure checklist generator `buildAfterPaymentChecklist` in `src/lib/resources/after-payment.ts` outputting non-empty groups in priority order with confirmed official sources (RBI, UIDAI, NPCI) and zero banned words. Copy checklist button with `aria-live` announcement. Tested in `tests/after-payment.test.ts` and `tests/resources.test.ts`.
  - **Q4 Quality & Documentation Pass:** Phone checklist verified at 360, 390, 430 px without horizontal scroll. Updated `docs/privacy-and-responsible-use.md`, `docs/project-spec.md`, `docs/build-plan.md`, `docs/test-plan.md`, `docs/dev-log.md`, and `README.md`.
  - **Q5 Live Check & Final Verification:** 477 offline tests passing across 49 test files in Vitest; ESLint clean (0 errors, 0 warnings); TypeScript typecheck clean (0 errors); Next.js production build succeeded with 14 static and dynamic routes.
