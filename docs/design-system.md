# Design System v5: Ink Blue Palette, Typographic Scale, and Anti-Template Polish (OfferClara)

## 1. Principles
OfferClara is a calm, honest review assistant for students and first-time job seekers receiving internship or entry-level job offers. Rather than behaving like an automated judging machine or AI oracle, its visual metaphor is a desk with an **annotated document**: a letter in the margins, real line numbers, high-contrast text, and a physical highlighter pen marking specific phrases of evidence.
- **The Annotated Document Metaphor:** Tactile, forensic clarity. Clean canvas, high-contrast paper surfaces, authoritative Ink Blue primary actions against a deep navy header, and an authentic highlighter yellow accent strictly reserved for evidence phrases and observational markers.
- **Calm, Honest Copy:** Strictly avoids verdict language ("safe", "verified", "legit", "scam", "fraud" as a verdict) and red/green traffic-light semantics. "No concerns identified" is never presented as a safety verdict.
- **Evidence-Grounded Linking:** Every potential concern is anchored to verbatim quotations. On desktop, hovering an observation card highlights that quote in the left rail document viewer and scrolls to its line; clicking a highlighted quote in the document focuses the observation card.
- **Accessible & Contrast-Guaranteed:** Every color token pair meets or exceeds WCAG 2.1 AA standards (normal text $\ge 4.5:1$, headings/lead text $\ge 7:1$, non-text borders and focus rings $\ge 3:1$).
- **Zero Runtime Dependencies:** Native Next.js 16.4.2 App Router, Tailwind CSS v4, pure SVG icons, and build-time Google fonts via `next/font/google`. No third-party UI component kits or external animation libraries.

---

## 2. Semantic Token System (Ink Blue Palette)

All color tokens are declared in ONE isolated, swappable block per theme in `src/app/globals.css` with explicit `color-scheme: light` and `color-scheme: dark`.

### 2.1 Color Tokens & WCAG Contrast Standards

| Token | Light Theme | Dark Theme | Purpose | Contrast Ratio |
| :--- | :--- | :--- | :--- | :--- |
| `--color-header-bg` | `#10263f` | `#0a111a` | Top header bar background | Base (Navy) |
| `--color-header-text` | `#ffffff` | `#ffffff` | Brand wordmark and header contrast text | 15.3:1 (L), 19.0:1 (D) vs header |
| `--color-header-nav-text` | `#c5d3e4` | `#c5d3e4` | Header navigation links | 10.1:1 (L), 12.5:1 (D) vs header |
| `--color-canvas` | `#f2f5f9` | `#0e1620` | Viewport canvas background | Base |
| `--color-surface` | `#ffffff` | `#152130` | Primary cards, panels, and modals | Base |
| `--color-surface-alt` | `#eaf0f7` | `#1b2a3d` | Limits section, secondary wells | Secondary surface |
| `--color-surface-muted` | `#f0f4f9` | `#121c2a` | Table alternating rows, inputs | Muted surface |
| `--color-border` | `#d5dfeb` | `#223348` | Standard structural borders | Base structure |
| `--color-border-strong` | `#7b8ca3` | `#5b7496` | High-contrast container borders | $\ge 3.0:1$ vs surface |
| `--color-border-muted` | `#e2ebf4` | `#1b2838` | Subtle interior dividers | Subtle structure |
| `--color-text` | `#14202e` | `#e8eef6` | Primary body text and headings | 16.5:1 (L), 13.9:1 (D) vs surface |
| `--color-text-muted` | `#4b5b6d` | `#a9b7c9` | Secondary descriptions, hints, limits | 7.0:1 (L), 8.0:1 (D) vs surface |
| `--color-text-subtle` | `#546578` | `#94a4b8` | Metadata labels, tertiary captions | 6.0:1 (L), 6.4:1 (D) vs surface |
| `--color-primary` | `#1d5fa8` | `#5b9bf0` | Primary actions, links, active states | 6.5:1 (L), 6.5:1 (D) vs contrast |
| `--color-primary-hover` | `#164a85` | `#7cb2f5` | Hover state for primary actions | High contrast |
| `--color-primary-contrast`| `#ffffff` | `#0b1520` | Text/icons on primary buttons | $\ge 6.4:1$ vs primary |
| `--tint-info-bg` | `#eaf0f7` | `#172333` | Missing details table header, summary row | Semantic info |
| `--tint-info-border` | `#c8d7e8` | `#24364e` | Info section borders | Semantic info |
| `--tint-action-bg` | `#e3eefb` | `#1a283b` | Questions cards, active nav item | Semantic action |
| `--tint-action-border` | `#b6d2f3` | `#2b4260` | Action section borders | Semantic action |
| `--focus-ring` | `#1d5fa8` | `#8cb8f7` | Keyboard focus ring | $\ge 5.9:1$ vs canvas |
| `--color-highlight` | `#ffe27a` | `#ffe27a` | Quote evidence highlighter (yellow) | Evidence marker ONLY |
| `--color-highlight-ink` | `#1b1b1b` | `#0e1620` | Text on highlighter pen | 13.5:1 (L), 14.2:1 (D) vs yellow |
| `--color-tint-obs-bg` | `#fff6d6` | `#282210` | Observation card tint background | Evidence marker ONLY |
| `--color-tint-obs-border` | `#e5c85c` | `#5a4a1a` | Observation card 3px left border | Evidence marker ONLY |
| `--color-tint-obs-text` | `#593e00` | `#fde896` | Observation marker text | 9.2:1 (L), 12.9:1 (D) vs obs-bg |

---

## 3. Persistent Navigation & Layout Architecture

### 3.1 One Top Bar Across Every Page (`TopBar.tsx`)
Mounted once in `src/app/layout.tsx` to ensure absolute layout parity across `/`, `/check`, `/resources`, `/privacy`, `/about`, 404, and error states:
- **Left Region:** 44px square ghost button on the navy bar controlling `<dialog id="app-sidebar">`, followed by a 16px gap, and a single clickable link to `/` containing the unified logo mark and wordmark.
- **Right Region ($\ge 1100$px):** Desktop navigation links (Home, How it works, What you get, Privacy, FAQ, Help and reporting), external GitHub link, theme toggle, and primary "Check an offer" button.
- **Mobile Region (< 1100px):** Navigation links collapse into the sidebar. Keeps the sidebar toggle button, brand link, compact theme toggle, and primary check button (labelled "Check" under 480px) with zero horizontal overflow at 360px.

### 3.2 Accessible Slide-Over Sidebar (`Sidebar.tsx`)
Native HTML5 `<dialog id="app-sidebar">` rendered at the root layout level with zero-scroll responsive height scaling:
- **Fixed Zero-Scroll Sizing:** Fits 100dvh without vertical scrolling by dynamically sizing navigation items between 2.75rem and 2.25rem via `itemHeightRem` based on viewport height. Below 560px, the decorative tagline and divider collapse to ensure all links remain on screen.
- **Items Order:** Home, Check an offer (primary highlighted button), Help and reporting, divider, How it works, What you get, FAQ, Privacy, About, GitHub (external), Share (Web Share API with safe fallback), and bottom theme toggle.
- **Zero Third-Party Branding:** Completely clean of vendor tracking, analytics, or external platform badges.

### 3.3 Check Intake & Findings Layout (`/check`)
- **Pre-Review Wizard:** 5 distinct numbered steps with a header row displaying step progress and a ghost button labelled `"Clear and start over"` visible as soon as text, files, or answers are entered.
- **Shared Confirmation Dialog (`ClearReviewDialog.tsx`):** Accessible `<dialog id="clear-review-dialog">` with title `"Start a new review?"`, cancel button with default focus, conditional `"Save as PDF first"` button, and neutral dark confirmation button `"Clear and start over"`.
- **Post-Review 3-Zone Workspace:**
  - **Left Rail (~240px, Sticky on desktop):** `ResultsNav.tsx` displaying on-page section navigation (Overview, Observations, Missing details, Questions & checks, Company research, Resources, Your text).
  - **Centre Fluid Column:** Findings cards, verification questions, and `ResultsActionsBar.tsx` (Save as PDF with dynamic title `OfferClara review YYYY-MM-DD`, Copy summary, Share, Start new review).
  - **Right Rail (~360px, Sticky on $\ge 1536$px):** `YourOfferWorkspace.tsx` highlighted document viewer.

---

## 4. Docked Command Box (`CommandBar.tsx`)

OfferClara includes a hands-free, voice-ready navigation box docked at the bottom of the viewport:
- **Layout:** One docked input (`min(640px, 92vw)` desktop; 44px bar on mobile) with placeholder `"Dictate a command"` and button `"What can I say?"`.
- **Navigation-Only Scope:** Strictly restricted to site and wizard navigation. Contains no answer-setting commands, no theme toggles, and no "Add to offer text" flows.
- **Countdown Execution:** Recognised commands display a status line above the bar: `"Running <label> in 2... Cancel"` (with cancel button, Escape to cancel, Enter to run immediately).
- **Graceful Rejection:** Unrecognised input or long paragraphs (>80 chars) are cleared immediately, announcing via `aria-live="polite"`: `"That command isn't recognised. Try again, or open the list of commands."` and highlighting the `"What can I say?"` button.
- **Page Context Awareness:** Check-page commands uttered on other routes prompt: `"That command works on the check page."`
- **Zero Microphone Permissions:** Works with Wispr Flow or OS dictation tools typing directly into the input. No Web Speech API or microphone permissions required.

---

## 5. Normative Employment Wording Prohibition

To prevent misleading students about employment norms:
- **System Instruction:** In `src/lib/analysis/prompt.ts`, Rule 5 explicitly instructs the model never to assert what is "standard", "typical", "normal", or "usual" in hiring or employment.
- **Deterministic Guardrail:** In `src/lib/analysis/guardrails.ts`, `detectOverclaiming` enforces `/\b(standard|typical|normal|usual)\b/i` across all model-written fields (observation, interpretation, note, verification question). Quotes from user-submitted text remain verbatim and exempt.

---

## 6. Typographic Architecture & Floor Audit

- **Scale Floor:** Strict `0.875rem` (14px at 16px root) floor enforced by `tests/token-audit.test.ts` across all components.
- **Fonts:** Build-time Google fonts (`IBM Plex Sans`, `IBM Plex Mono`, `Newsreader`) via `next/font/google`.
- **Print Optimization:** All interactive controls (top bar, sidebar, command bar, wizard steppers, sticky bars, dialogs, results action bar) are tagged with `print:hidden`. Print views export with dynamic title `OfferClara review YYYY-MM-DD`.
