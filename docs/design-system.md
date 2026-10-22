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

1. **Pre-Review Input State:**
   - **Unified Action Bar:** A single top action bar directly atop the input card containing:
     - Primary "Analyze offer" button (`sm:inline-flex`, min-h 44px).
     - Secondary "Attach files" button (triggers native file chooser).
     - Ghost "Clear" button (resets offer text and attached files).
     - Live character counter with tabular numbers.
     - Hover-device only keyboard shortcut hint (`Press Ctrl+Enter or ⌘+Enter to analyze`).
     - One-line disabled reason ("Add at least 40 characters, or add text from your files, to review.") linked via `aria-describedby`.
   - **Privacy Notice:** Compact policy notice directly under the action bar with "Details" linking to `/privacy`.
   - **Sample Cards:** The legacy dropdown select has been completely eliminated. Samples load via `SampleCards` with "Synthetic example" badges and an inline replacement confirmation prompt when custom text exists.
   - **Desktop ($\ge 1280$px / `xl`): Two Columns**
     - Left column (~7/12): Input form card and optional file upload dropzone.
     - Right column (~5/12):
       - *Before input:* `SampleCards` + "What you will get" overview.
       - *After input:* "Before you review" panel displaying a source summary (character and attached file counts), personal details reminder, and a collapsed "Try a sample instead" disclosure (zero redundant primary buttons).
   - **Tablet ($640$px – $1279$px): Single Column**
     - Full-width input form with collapsible "Try a sample instead" disclosure placed cleanly above the card (auto-expanded when empty, collapsed when input exists).
   - **Mobile ($< 640$px): Mobile Action Pattern**
     - Top bar displays "Attach files" and "Clear" buttons.
     - Primary "Analyze offer" button moves to a sticky bottom action bar with `min-h-[44px]`.
     - Container provides `pb-24 sm:pb-8` bottom padding to prevent content obstruction.
     - Textarea has `scroll-mb-24` ensuring the text caret is never obscured while typing.

2. **Post-Review State (After Analysis Completes):**
   - **Desktop ($\ge 1280$px / `xl`): Three-Zone Desk**
     - *Left Rail (~400px, Sticky):* 'Your offer' document viewer with line numbers (split by `\n`), interactive quote highlights, line-by-line hover effects, and buttons to 'Edit offer' or start a 'New review'.
     - *Centre Column (Fluid):* Review results (`AnalysisResults.tsx`). All findings, checklist, questions, and resources formatted with prose lines $\le 70$ch.
     - *Right Rail (~260px, Sticky):* 'On this page' section navigation with active scroll-spy, plus quick actions for 'Copy summary' (plain text) and 'Print / PDF'.
   - **Medium Screens ($1024$px – $1279$px / `lg`): Two Columns**
     - Fluid centre column + Right rail navigation.
     - 'Your offer' is presented above the results in an expandable accordion panel.
   - **Mobile Screens ($< 1024$px): Single Column**
     - Sticky horizontal nav pills for jumping between sections.
     - Expandable 'Your offer' document panel.
     - All interactive touch targets $\ge 44$px.

### 4.3 FAQ Two-Independent-Column Grid
- Desktop ($\ge 1024$px): Two independent flex columns using pure function `splitIntoColumns(items)` (first $\lceil n/2 \rceil$ items left, remaining items right).
- Styled with `items-start` so expanding any accordion item does not vertically stretch or shift items in the sibling column.
- Mobile / tablet ($< 1024$px): Single flex column preserving exact item ordering.
- Zero CSS `columns` or multi-row grid templates that cause cross-column item height distortion.

### 4.4 Dedicated Privacy Route (`/privacy`)
- Dedicated static server component at `/privacy` styled with standard layout containers, headers, and footers matching `/resources`.
- Seven sentence-case sections: "What is sent to other services", "What OfferCheck does not store", "What stays in your browser", "Requests and limits", "Uploads", "What OfferCheck cannot do", and "Report a problem".
- Embeds verbatim `AI_DATA_NOTICE` and `AI_FILE_NOTICE`.
- Includes "Last updated 22 Oct 2026" timestamp and direct issue reporting links.
- Strictly adheres to calm, verdict-free language.

---

## 5. Evidence Linking & Interaction

- **Centre Column $\to$ Left Rail:** Hovering or focusing an observation card in the findings column activates the quote highlight in the left rail document viewer with an amber ring and smoothly scrolls the left rail to reveal that line if not in view.
- **Left Rail $\to$ Centre Column:** Clicking or pressing Enter on a highlighted quote in the document rail scrolls directly to the corresponding observation card in the centre column and shifts keyboard focus to it.
- **Accessible Markup:** Linked via semantic IDs (`rail-highlight-${id}` and `concern-card-${id}`), `role="button"`, and visible keyboard focus outlines.

---

## 6. Motion & Resilience

- **Native Only:** Strictly CSS transforms, transitions, and native `requestAnimationFrame`. Zero third-party animation engines.
- **Hero Entrance Animation:**
  - Measures target phrases only after `document.fonts.ready` has resolved and layout has settled.
  - User skip listeners (pointer, keydown, scroll) enforce a 300ms initial grace period to avoid accidental cancellation from browser scroll restoration or synthetic events.
  - Always provides a visible, keyboard-accessible ghost button (`Play animation` / `Replay animation`) with a 44px tap target.
  - Respects `prefers-reduced-motion: reduce` by defaulting to the complete static state without autoplay.
- **Scroll Scene:**
  - Parent containers use `overflow-x: clip` rather than `overflow: hidden`, guaranteeing that CSS `position: sticky` functions reliably across reloads and zoom levels.
  - Automatically falls back to stacked cards in normal document flow on mobile, short viewports ($< 640$px), or reduced-motion environments.
