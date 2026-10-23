# Design System v5: Ink Blue Palette, Typographic Scale, and Anti-Template Polish (OfferCheck)

## 1. Principles
OfferCheck is a calm, honest review assistant for students and first-time job seekers receiving internship or entry-level job offers. Rather than behaving like an automated judging machine or AI oracle, its visual metaphor is a desk with an **annotated document**: a letter in the margins, real line numbers, high-contrast text, and a physical highlighter pen marking specific phrases of evidence.
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

### 2.2 Semantic Tool Page Hierarchy

1. **Header:** Navy (`--color-header-bg`) across both themes with brand wordmark in white, navigation links in `--color-header-nav-text`, primary button "Check an offer", segmented theme toggle with white focus rings, and no persistent outline on the logo.
2. **Review Summary Card:** Summary header row uses subtle info tint (`--tint-info-bg`), sentence-case headings, and count chips in white/tinted surface with primary text and borders.
3. **Observations (Findings):** Surface background with subtle observation tint (`--color-tint-obs-bg`) and 3px left border (`--color-tint-obs-border`).
4. **Missing Details:** Table `thead` uses info tint (`--tint-info-bg`) with sans-serif font; count chip uses primary text on info tint.
5. **Questions to Ask:** Questions cards use action tint (`--tint-action-bg`, `--tint-action-border`); count chip uses primary text on action tint.
6. **"Check these yourself" Card:** Surface background with 3px primary top border (`border-t-[3px] border-t-[var(--color-primary)]`) and action tint numbered step circles.
7. **Company Research Card:** Surface background with 3px primary top border; when research is recommended, card uses action tint background. Rotating SVG chevron on guidance disclosure.
8. **Official Resources Card:** Surface background with primary-colored action links.
9. **Limits Section:** Surface-alt background (`--color-surface-alt`) to visually reinforce boundary conditions.
10. **"On this page" Right Rail:** Active section item is styled with action tint background (`--tint-action-bg`), primary text (`--color-primary`), and a 3px primary left border (`border-l-[3px] border-l-[var(--color-primary)]`).

### 2.3 Ready-to-Swap Palettes
Alternative palettes (Palette B "Petrol" and Palette C "Cobalt with Light Header") are documented with complete token tables and copy-paste swap instructions in `docs/design-brief.md`.

---

## 3. Typographic Architecture

Fonts are loaded at build time via `next/font/google` in `src/app/layout.tsx`:
- **Primary UI & Body:** `IBM Plex Sans` (400, 500, 600) — technical clarity, neutral grotesque grotesque characteristics, high legibility.
- **Data, Lines, & Quotes:** `IBM Plex Mono` (400, 500) — mechanical precision, tabular alignment. **Restricted strictly** to offer document text, verbatim quotes, line numbers, telephone/portal codes, and character counters. All UI labels, table headers, badges, and eyebrows use the sans face.
- **Editorial Headlines:** `Newsreader` (400, 600) — warm, authoritative editorial display serif reserved for landing page hero titles.

### 3.1 Typographic Metrics & Scale
The typography system uses a responsive root clamp in `src/app/globals.css` and a strictly rem-based scale across all components:
- **Root Font Size Clamp:**
  ```css
  html {
    font-size: clamp(16px, calc(12px + 0.3125vw), 18px);
  }
  body {
    font-size: 1rem;
  }
  ```
- **Scale Tokens:**
  - **`text-xs`**: `0.875rem` (14px at 16px root), line-height 1.5 (secondary labels, metadata, count chips, captions $\ge 0.875$rem)
  - **`text-sm`**: `0.9375rem` (15px at 16px root), line-height 1.55 (table text, secondary card body)
  - **`text-base`**: `1rem` (16px at 16px root), line-height 1.6 (buttons, top bar / nav links, primary body text)
  - **Landing Body**: `1.0625rem` (`text-[1.0625rem]`, 17px at 16px root), line-height 1.6
  - **Landing Lead**: `1.1875rem` – `1.25rem` (`sm:text-[1.1875rem]`), line-height 1.5
- **Absolute Floor**: **0.875rem (14px at 16px root) minimum anywhere in the interface.** Zero instances of sub-0.875rem classes (`text-2xs`, `text-3xs`) or raw px font sizes anywhere under `src/` (with explicit exception for the root html clamp in `globals.css` and print `11pt`). An automated test in `tests/token-audit.test.ts` scans all source files under `src/` on every build to guarantee this floor.
- **Prose Constraints**: Prose paragraphs and observation interpretations are strictly constrained to `max-w-[70ch]` for comfortable reading eye-travel.

---

## 4. Layout Architecture & Section Alignment

### 4.1 Global Responsive Container Primitive
Every page and major section is wrapped in `src/components/layout/Container.tsx`:
$$\text{width} = \min(100\% - 2 \times \text{gutter}, 2000\text{px}) \quad \text{where} \quad \text{gutter} = \text{clamp}(16\text{px}, 2.5\text{vw}, 48\text{px})$$

### 4.2 Alignment Rules
1. **Left-Edge Alignment:** Section titles, descriptions, and headers start at the container's left edge (no arbitrary floating center offsets for left-aligned content).
2. **Full-Width Grids:** Cards, tables, and step blocks span the full width of the container.
3. **FAQ Section:** Two-column grid on desktop ($\ge 1024$px) using `items-start` so that expanding one question does not cause the sibling question in the adjacent column to stretch vertically.
4. **Column Balance:** Hero document card and scroll scene inspection columns maintain balanced visual proportions across viewports.
5. **Alternating Section Bands:** Landing sections alternate between canvas (`--color-canvas`) and surface (`--color-surface`) backgrounds, with the hero featuring a pale tinted band (`--tint-info-bg/40`).

---

## 5. Removal of Template Tells

All common AI / template design artifacts have been eliminated:
1. **No All-Caps Tracked Eyebrows:** Eyebrows are written in clean sentence-case sans without `uppercase` or tracking (`tracking-wider`, `tracking-widest`).
2. **No Duplicate Numbering:** Steps use single, clear primary-filled number circles (`1`, `2`, `3`) instead of redundant "01" and "Step 1 of 3" combinations.
3. **No Arrow or Triangle Glyphs:** Text glyphs (`&rarr;`, `→`, `▲`, `▼`) have been replaced with accessible SVG chevrons or clean copy without decorative glyphs.
4. **Custom Disclosure Chevrons:** All `<details>` / `<summary>` disclosure controls use custom rotating SVG chevrons with `list-none [&::-webkit-details-marker]:hidden` to suppress default browser markers in WebKit/Safari.
5. **No Dot-Grid Textures:** Removed decorative dot-matrix background patterns (`.paper-pattern`) in favor of clean paper surfaces.

## 4. Layout Architecture

### 4.1 Global Responsive Container Primitive
Replaces rigid 1152px / `max-w-6xl` wrappers with a fluid full-width container declared in `src/components/layout/Container.tsx`:
$$\text{width} = \min(100\% - 2 \times \text{gutter}, 2000\text{px}) \quad \text{where} \quad \text{gutter} = \text{clamp}(16\text{px}, 2.5\text{vw}, 48\text{px})$$

Used consistently across all routes: landing page, `/check`, `/resources`, 404, error, and top-level headers/footers.

### 4.2 Tool Page (`/check`) Layout Architecture

1. **Pre-Review State: 5-Step Wizard (`/check`)**
   - **Step 1: Offer** (`Step1Offer.tsx`): Large verbatim textarea, drag-and-drop file upload (`FileUploadDropzone`), attached files list (`SelectedFileList`), character counter against 12,000 characters, full synthetic wizard samples (A & B), and inline replacement confirmations.
   - **Step 2: Source** (`Step2Source.tsx`): Communication channel radio selector (Email, LinkedIn, WhatsApp, Telegram, Job Portal, Campus, Other), application status ("Did you apply?"), and optional 200-character context note with sensitive identifier detection.
   - **Step 3: Conversation** (`Step3Conversation.tsx`): 4,000-character narrative textarea for student accounts of verbal phone calls, interviews, or recruiter assurances (typed or dictated), with sensitive identifier warning.
   - **Step 4: Money and documents** (`Step4Payment.tsx`): Monetary payment status (Yes, No, Not sure), conditional fee purpose checkboxes (Training, Security deposit, Background check, Laptop, Other), amount input, deadline input, document requests/shares checkboxes, and calming helpline callout.
   - **Step 5: Review** (`Step5Review.tsx`): Concise structured summaries of steps 1-4 with direct "Edit" shortcuts, combined character counter against 12,000, verbatim AI data notices, embedded company research card, and expandable combined text preview.
   - **Stepper Navigation** (`WizardStepper.tsx`): 5 distinct numbered steps. Grid on desktop ($\ge 640$px) with visited/skipped/current indicators; horizontally scrollable compact chips on mobile (< 640px).

2. **Post-Review State: Master-Detail Desktop Layout ($\ge 1280$px / `xl`):**
   - **Left Rail (~240px, Sticky):** `ResultsNav.tsx` on-page section navigation with live `IntersectionObserver` scroll-spy, highlighting the active section and displaying count badges (Overview, Observations, Missing details, Questions & checks, Company research, Advisories & resources, Your text).
   - **Centre Column (~640-760px, Primary Fluid):**
     - `ResultsActionsBar.tsx`: Save as PDF (dynamic title `OfferCheck Review - [Company] - [Date].pdf`), Copy summary, Share (Web Share API with safe non-leaking excerpt), and Start new review with native `<dialog>` confirmation.
     - Section 1: Overview card (id `section-summary` / `section-overview`).
     - Section 2: Observations list (id `section-observations`).
     - Section 3: Missing details checklist (id `section-missing`).
     - Section 4: Questions to ask & self-checks (id `section-questions`).
     - Section 5: Company research card (id `section-research`).
     - Section 6: Official Institutional Advisories (id `section-advisories`).
     - Section 7: Verbatim highlighted document viewer (id `section-your-text`).
   - **Right Rail (~360px, Sticky on $\ge 1536$px / `2xl`):** `YourOfferWorkspace.tsx` live document viewer with line numbers, section markers, interactive yellow quote highlights, and bidirectional scroll linking with observation cards.
   - **Mobile & Tablet (< 1536px):** Single column layout with expandable "Your text" drawer, responsive action bar, and sticky safe-area mobile navigation.

### 4.3 Static, Fast Landing Page
- Complete simplification from previous animated prototypes: zero entrance animation, zero magnifying lens canvas, zero scroll-driven sticky scenes, zero timers.
- Instant 0ms render with zero Cumulative Layout Shift (CLS).
- Interactive features demonstrated via a crisp, static annotated document card with 3 yellow-highlighted phrases and margin observation badges.
- Highlights the 5-step wizard, Global Command Bar, side-by-side capabilities comparison, and dual-column FAQ.

### 4.4 Dedicated Privacy Route (`/privacy`)
- Dedicated static server component at `/privacy` styled with standard layout containers, headers, and footers matching `/resources`.
- Seven sentence-case sections: "What is sent to other services", "What OfferCheck does not store", "What stays in your browser", "Requests and limits", "Uploads", "What OfferCheck cannot do", and "Report a problem".
- Embeds verbatim `AI_DATA_NOTICE` and `AI_FILE_NOTICE`.
- Includes "Last updated 22 Oct 2026" timestamp and direct issue reporting links.
- Strictly adheres to calm, verdict-free language.

---

## 5. Evidence Linking & Interaction

- **Centre Column $\to$ Right Rail:** Clicking "Show in text" or hovering an observation card in the findings column activates the quote highlight in the right rail document viewer with an amber ring and smoothly scrolls the document rail to reveal that line if not in view.
- **Right Rail $\to$ Centre Column:** Clicking or pressing Enter on a highlighted quote in the document rail scrolls directly to the corresponding observation card in the centre column and shifts keyboard focus to it.
- **Accessible Markup:** Linked via semantic IDs (`rail-highlight-${id}` and `concern-card-${id}`), `role="button"`, and visible keyboard focus outlines.

---

## 6. Motion & Resilience

- **Static-First Philosophy:** The landing page and review tools avoid decorative autoplay animations. Motion is strictly restricted to user-initiated interactions (smooth scroll, accordion dropdowns, dialog open/close).
- **Reduced Motion:** Fully conforms to `prefers-reduced-motion: reduce` by disabling smooth scroll and transitions.
- **Responsive Viewport Resilience:** Zero horizontal overflow across all tested viewports: 360px (Galaxy S8), 390px (iPhone 14), 430px (iPhone 14 Pro Max), 768px (iPad), 1024px, 1280px, 1440px, 1920px.

---

## 7. Global Command Bar (Dictate or Type)

- **Purpose:** Enables complete keyboard and voice accessibility without requiring browser microphone permissions or proprietary speech APIs. Works seamlessly with system speech-to-text tools like Wispr Flow.
- **Placement:** Docked bottom center on desktop, expanding on focus or hover. Keyboard shortcut: `/` or `Ctrl+K` / `Cmd+K`. Dismissable with `Escape`.
- **Pure Matcher:** `matchCommand` in `src/lib/commands/match.ts` parses over 80 natural language commands, stripping leading/trailing conversational filler words (`please`, `can you`, `could you`, `just`, `now`, `take me to`).
- **Confirmation Countdown:** Recognized actions display a 2-second visual countdown before executing, with immediate Enter/Click override and an "Add to offer text instead" option.
- **Dictation Fallback:** Dictated phrases exceeding 80 characters or unrecognised inputs automatically display an "Add to offer text" button.

---

## 8. Design Token Audit & Accessibility Rules

- **Zero Default Palette Color Classes:** Automated audit (`tests/token-audit.test.ts`) enforces that no file in `src/` uses hard-coded Tailwind default palette classes (`text-blue-500`, `bg-gray-100`, `bg-black`, etc.).
- **Zero Raw Hex Colors in JSX:** All colors must reference CSS semantic design tokens.
- **Font Size Scale Floor:** Root `clamp(16px, calc(12px + 0.3125vw), 18px)` with all typography defined in `rem` (`text-xs` 0.875rem, `text-sm` 0.9375rem, `text-base` 1rem). No token or class below 0.875rem is permitted.
- **High Contrast:** All token pairs meet or exceed WCAG 2.1 AA contrast requirements across light and dark themes.
