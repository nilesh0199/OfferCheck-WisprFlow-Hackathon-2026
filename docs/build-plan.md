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
- **Status:** In progress
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
- **Status:** Not started
- **Goal:** Implement a server-side route handler communicating with the Gemini API to analyze offer text, enforcing injection resistance, structured JSON generation, and graceful error recovery.
- **Acceptance Criteria:**
  - Server route (`/api/analyze`) accepts untrusted offer text, validates input length (`<= MAX_INPUT_CHARS`), and blocks malicious injection patterns.
  - Uses current official Gemini SDK with server-only environment variable (`GEMINI_API_KEY`).
  - Strict system instructions enforce evidence rules, calm tone, and prohibit scam scores, safety guarantees, and legal claims.
  - Raw offer text is excluded from server logging.
  - Graceful error responses returned for upstream timeouts, network failures, or malformed responses.

---

## Phase 4: Results UI
- **Status:** Not started
- **Goal:** Connect the frontend form to the analysis endpoint, displaying structured findings across the four required sections with quotation highlights and verification question export. Reorganize layout so input is higher on the page.
- **Acceptance Criteria:**
  - Input form moved higher on the page so users can immediately reach and paste text without scrolling past explanatory cards.
  - Submit/Analyze button added with loading, progress, and disabled states during request processing.
  - Four output sections rendered cleanly: Potential Concerns (with verbatim highlighted quotes), Missing or Unclear Information, Verification Questions, and Limits of the Review.
  - Easy one-click clipboard copying for suggested verification questions.
  - Clean error handling displays non-alarmist, actionable guidance if analysis fails.
  - Ephemeral state management: refreshing or navigating away discards sensitive data.

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
- **Status:** Not started
- **Goal:** Harden the application with input sanitization, client and server request timeouts, basic in-memory rate limiting with clearly documented limitations, and a documented test suite.
- **Acceptance Criteria:**
  - Character limit strictly enforced on both frontend and backend.
  - Explicit request timeout mechanisms abort stalled upstream connections.
  - Basic IP or session rate limiting implemented with documented operational limits (best-effort in-memory limits plus provider quota ceiling; friendly "busy, try later" notice).
  - Documented verification test set verifying handling of empty input, max length, boundary text, prompt injection attempts, and special characters.

---

## Phase 7: Research-Prompt Fallback (Copy + Perplexity Link)
- **Status:** Not started
- **Goal:** Provide a resilient, zero-cost external research fallback allowing students to inspect recruiter and company authenticity via one-click queries.
- **Acceptance Criteria:**
  - Helper generates a structured, neutral company verification prompt using extracted organization details.
  - One-click button copies the research prompt to the clipboard.
  - Direct external link opens Perplexity (or public search) with pre-populated query parameters.
  - Clear user guidance notes that external research is optional and that the core offer review functions independently.

---

## Phase 8: Optional Tavily Research (Lowest Priority — First to Cut)
- **Status:** Not started
- **Goal:** If time and budget allow, implement an optional server-side Tavily search integration to surface public web footprint details for the claimed company.
- **Acceptance Criteria:**
  - User explicitly reviews and confirms company name and domain before any search request is initiated.
  - Only company metadata is queried; raw offer text is never transmitted to the search API.
  - Every finding links directly to a public source URL.
  - Third-party allegations or complaints are strictly separated from verified corporate records.
  - Feature is fully modular and cleanly cut without impacting core review functionality if rate limits or budgets are exceeded.

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
