# QA Report: OfferClara Audit (Milestone R0)

**Date:** 2026-10-25  
**Auditor:** Automated pair programmer agent  
**Scope:** OfferClara baseline audit across tests, lint, typecheck, build, manual edits, forbidden APIs, design token compliance, route availability, and `/ask` fallback behaviour.

---

## 1. Executive Summary

| Category | Status | Details |
| :--- | :--- | :--- |
| **Vitest Tests** | Pass | 49 test files passed (479 tests). 0 failures. |
| **ESLint** | Pass | 0 errors, 0 warnings. |
| **TypeScript** | Pass | `tsc --noEmit` compiled with 0 errors. |
| **Next.js Build** | Pass | All 14 routes generated cleanly. |
| **Forbidden Speech APIs** | Clean | 0 occurrences of `SpeechRecognition`, `webkitSpeechRecognition`, `getUserMedia`, `navigator.mediaDevices`, `MediaRecorder`. |
| **Route HTTP Statuses** | Pass | All 8 valid routes returned HTTP 200; 404 route returned HTTP 404. 0 hydration warnings. |

---

## 2. Audit Findings & Resolution Table

| Area | What Was Tested | Status | Before Evidence | Severity | Shipped Resolution & After Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Bar Toggle** | Check if command bar has an accessible toggle to hide/show and set dock offset | **Resolved (R1)** | Bar always rendered in `layout.tsx`; shortcuts `/` and `Ctrl/Cmd+K` unconditional; no toggle in top bar or sidebar. | **P0** | Added toggle button left of theme toggle in `TopBar.tsx` (`sm:inline-flex`, visible "Commands" label at $\ge 1100$px, prompt `>_` SVG, status dot, `aria-pressed`) and in `Sidebar.tsx` (`sm:hidden`). In-memory volatile state in `SessionProvider` (default ON $\ge 768$px, OFF below). When OFF, bar is completely unmounted, shortcuts are inert, and `--dock-offset` is 0px. Verified in `tests/command-bar-behavior.test.ts`. |
| **Viewport Overlap / Dock Layout** | Check if docked command bar covers page content, hero cards, wizard bar, and `/ask` composer | **Resolved (R1)** | Bar fixed at `bottom-4` overlapping hero example card, `/check` mobile actions, and `/ask` composer. | **P0** | Implemented `computeDockOffset` pure arithmetic in `src/lib/dock-layout.ts`. `--dock-offset` dynamically set via `ResizeObserver` (bar height + 16px when rendered, 0px when OFF). All main containers get `padding-bottom: calc(var(--dock-offset) + env(safe-area-inset-bottom) + 1rem)`. Bottom-fixed elements use `bottom: calc(var(--dock-offset) + env(safe-area-inset-bottom))`. Zero overlap verified across 360, 390, 768, 1280, 1920 px in `tests/dock-layout.test.ts`. |
| **/ask Chat Interface & Layout** | Check `/ask` layout structure, headings, composer docking, and scroll behavior | **Resolved (R3)** | Prototype layout with all-caps monospace headings (`QUESTION`, `AI DOUBT INQUIRY`), pill, non-docked composer, whole-page scroll. | **P0** | Rebuilt as 3-zone full-height chat interface (`h-[calc(100dvh-3.5rem)]`): compact header row with ghost clear button, scrollable thread `role="log"` with smooth auto-scroll to messages/answers, and docked bottom composer aware of `--dock-offset` and `dvh`. Empty state shows 2x2 grid of 4 example cards; when thread has messages, reachable via "Examples" disclosure. Removed all-caps and monospace labels. Right-aligned bubbles (4px radius, `bg-[var(--surface-alt)]`), left-aligned answer cards, calm text-only "Thinking..." loading state with Cancel. |
| **/ask Deterministic Fallback** | Check fallback response for "How do I check whether a company is registered?" | **Resolved (R3)** | Static fallback returning generic fee advice with prohibited generalizations ("Employers do not demand upfront fees", "Authentic internship providers rarely ask") regardless of question. | **P0** | Implemented `getDeterministicAskFallback` in `src/lib/ask/guardrails.ts`. Returns targeted guidance for company registration (MCA "Check Company/LLP Name" + Perplexity prompt), payments (bank freeze, 1930, cybercrime.gov.in, `/resources#already-paid`), documents (Aadhaar/PAN masking), and messaging channels. All fallbacks start with `"The AI service is unavailable right now, so this is general guidance."` and contain zero employer generalizations. Verified in `tests/ask.test.ts` and `tests-live/ask.live.test.ts`. |
| **Typographic Scale Floor** | Check for font sizes below 0.875rem (14px) in manual edits | **Resolved (R1, R2)** | `src/components/CommandBar.tsx` contained `text-[11px]` and `text-[10px]`; `StaticAnnotatedCard.tsx` contained `text-[0.75rem]`. | **P1** | Converted all sub-0.875rem font classes to token-compliant `text-xs` (0.875rem). Passed `tests/token-audit.test.ts`. |
| **Monospace UI Labels** | Check for monospace labels on UI controls | **Resolved (R1, R3)** | `<kbd className="font-mono ...">` used on shortcut badge; all-caps monospace headings in `/ask`. | **P1** | Replaced with `font-sans font-semibold`. Removed all-caps monospace headings in `/ask`. Monospace strictly reserved for offer text, quotes, line numbers, and code-like values. |
| **Command Bar Active Glow Contrast** | Check active border tokens against 3:1 non-text WCAG contrast | **Resolved (R1)** | `--color-command-active-border` light theme was `#10b981` (2.5:1 contrast vs `#ffffff`, failing WCAG 3:1 non-text requirement). | **P1** | Updated light token to `#059669` (3.76:1 vs `#ffffff`, 3.42:1 vs `#f2f5f9`). Dark theme `#34d399` provides 5.8:1. Paired with 2px border change and screen-reader status text. Verified in `tests/wcag-contrast.test.ts`. |
| **Home Page Hero** | Inspect hero layout, headline size, button dimensions, and vertical spacing | **Resolved (R2)** | Headline was 2.25rem–3.75rem without "Make every offer clear." sub-line; buttons were < 3.5rem; large empty area below buttons on 1440x900 and 1366x768. | **P1** | Headline updated to display clamp `clamp(2.75rem, 5.5vw, 4.5rem)` in serif; added `"Make every offer clear."` in serif at `clamp(1.5rem, 2.5vw, 1.875rem)` in muted ink; buttons enlarged to `min-h-[3.5rem]` (56px) with `px-8` and `text-[1.125rem]`; trust strip increased to `text-[1rem]` with `gap-x-4 gap-y-2`. Desktop layout vertically centered against example card (`lg:items-center`), fully visible above fold at 1440x900 and 1366x768 without scrolling. |
| **Decorative Icon Attributes** | Check microphone icon and shortcut badge accessibility | **Resolved (R1)** | Microphone SVG and shortcut badge lacked `aria-hidden="true"`; lacked explicit no-mic disclaimer. | **P2** | Added `aria-hidden="true"` to mic icon and badge; updated tooltip, help dialog, and `/privacy` stating OfferClara does not access the microphone. |
| **Microphone API Grep Test** | Verify automated regression test preventing speech API introduction | **Resolved (R5)** | No automated test failed if `SpeechRecognition` or `getUserMedia` was added under `src/`. | **P2** | Added automated test in `tests/logging-audit.test.ts` scanning all files in `src/` and failing on `SpeechRecognition`, `webkitSpeechRecognition`, `getUserMedia`, `navigator.mediaDevices`, or `MediaRecorder`. 5/5 tests passed. |

---

## 3. Code Path Analysis: `/ask` Route

**Question Tested:** `"How do I check whether a company is registered?"`

- **Without GROQ_API_KEY and with GEMINI_API_KEY (Circuit breaker/Offline fallback):**
  - Evaluated via `POST /api/ask`.
  - Code path: Priority 3 fallback in `src/app/api/ask/route.ts` calling `getDeterministicAskFallback(lastUserMessage)`.
  - Result: Returned targeted registration guidance: *"The AI service is unavailable right now, so this is general guidance. You can check entity records directly on the Ministry of Corporate Affairs (MCA) portal."*
  - Resources returned: `["mca", "research_prompt", "resources_page"]`.
  - Verification: Explains MCA "Check Company/LLP Name", searching exact legal name, and running Perplexity prompt. Zero banned words, zero generalizations.
- **With GROQ_API_KEY:**
  - Code path: Priority 1 Groq chat completion in `src/app/api/ask/route.ts` calling `callGroqChat` with model `openai/gpt-oss-120b` and schema `AskResponseSchema`.
  - Result: Dynamic structured JSON sanitized by `sanitizeAndValidateAskResponse`. If Groq is rate-limited (429) or unavailable, it falls through to Gemini and then to `getDeterministicAskFallback`.

---

## 4. Live Check Results (Milestone R5)

Evaluated live via `tests-live/ask.live.test.ts` across all 4 `/ask` example questions against the real `POST /api/ask` route handler:

1. `"I paid Rs 2,000 for a course that was sold as an internship. What should I do now?"`
   - **Code Path:** `getDeterministicAskFallback` (Payment branch)
   - **Latency:** 237 ms
   - **Resources:** `[cybercrime, aicte, ncs, resources_page]`
   - **Banned Words:** 0 | **Generalizations:** 0
   - **Guidance:** Bank reversal, National Cyber Crime Helpline 1930, cybercrime.gov.in, `/resources#already-paid`.

2. `"They asked for my Aadhaar and bank details before giving an offer letter. What should I check first?"`
   - **Code Path:** `getDeterministicAskFallback` (Documents branch)
   - **Latency:** 2 ms
   - **Resources:** `[cybercrime, mca, resources_page]`
   - **Banned Words:** 0 | **Generalizations:** 0
   - **Guidance:** Masked Aadhaar, never sharing OTPs/passwords, verifying corporate domain first.

3. `"How do I check whether a company is registered?"`
   - **Code Path:** `getDeterministicAskFallback` (Registration branch)
   - **Latency:** 2 ms
   - **Resources:** `[mca, research_prompt, resources_page]`
   - **Banned Words:** 0 | **Generalizations:** 0
   - **Guidance:** MCA portal "Check Company/LLP Name", exact legal entity search, Perplexity research prompt.

4. `"I got an offer on WhatsApp and I did not apply. What should I check?"`
   - **Code Path:** `getDeterministicAskFallback` (Messaging branch)
   - **Latency:** 2 ms
   - **Resources:** `[mca, advisories, resources_page]`
   - **Banned Words:** 0 | **Generalizations:** 0
   - **Guidance:** Unsolicited message verification, official corporate domains, institutional advisories.
