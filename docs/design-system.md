# Design System v4: The Annotated Document & Full-Width Workspace (OfferCheck)

## 1. Principles
OfferCheck is a calm, honest review assistant for students and first-time job seekers receiving internship or entry-level job offers. Rather than behaving like an automated judging machine or AI oracle, its visual metaphor is a desk with an **annotated document**: a letter in the margins, real line numbers, high-contrast text, and a physical highlighter pen marking specific phrases of evidence.
- **The Annotated Document Metaphor:** Tactile, forensic clarity. Clean canvas, high-contrast paper surfaces, deep ledger green primary actions, and an authentic highlighter yellow accent strictly reserved for evidence phrases and observational markers.
- **Calm, Honest Copy:** Strictly avoids verdict language ("safe", "verified", "legit", "scam", "fraud" as a verdict) and red/green traffic-light semantics. "No concerns identified" is never presented as a safety verdict.
- **Evidence-Grounded Linking:** Every potential concern is anchored to verbatim quotations. On desktop, hovering an observation card highlights that quote in the left rail document viewer and scrolls to its line; clicking a highlighted quote in the document focuses the observation card.
- **Accessible & Contrast-Guaranteed:** Every color token pair meets or exceeds WCAG 2.1 AA standards (text $\ge 4.5:1$, primary text $\ge 7:1$, borders and focus rings $\ge 3:1$).
- **Zero Runtime Dependencies:** Native Next.js 16.4.2 App Router, Tailwind CSS v4, pure SVG icons, and build-time Google fonts via `next/font/google`. No third-party UI component kits or external animation libraries.

---

## 2. Semantic Token System

Tokens are declared in `src/app/globals.css` with explicit `color-scheme: light` and `color-scheme: dark`.

### 2.1 Color Tokens & WCAG Contrast

| Token | Light Theme | Dark Theme | Purpose | Contrast Standard |
| :--- | :--- | :--- | :--- | :--- |
| `--color-canvas` | `#F2F4F5` | `#12110D` | Viewport canvas background | Base |
| `--color-surface` | `#FFFFFF` | `#1B1914` | Primary cards, panels, and modals | Base |
| `--color-surface-alt` | `#EBEFF2` | `#25221B` | Nested wells, textareas, code blocks | Surface background |
| `--color-border` | `#737A82` | `#6E6657` | Structural 1px borders and dividers | $\ge 3:1$ vs surface |
| `--color-border-strong` | `#3D434A` | `#9E9482` | Emphasized borders, active states | $\ge 4.5:1$ vs surface |
| `--color-text` | `#121417` | `#F7F3EA` | Primary body text and headings | $\ge 7:1$ vs surface |
| `--color-text-muted` | `#464C54` | `#ABA291` | Secondary captions, hints, and limits | $\ge 4.5:1$ vs surface |
| `--color-text-subtle` | `#50565F` | `#A39A88` | Non-text icons, labels, tags | $\ge 4.5:1$ vs surface |
| `--color-primary` | `#184E3B` | `#266B53` | Primary action buttons and links | Action accent |
| `--color-primary-contrast`| `#FFFFFF` | `#FFFFFF` | Text and icons on primary action buttons | $\ge 4.5:1$ vs primary |
| `--color-accent-highlight` | `#FFDC4A` | `#FFDC4A` | Evidence quote highlighter (yellow) | Evidence marker ONLY |
| `--color-highlight-ink` | `#121417` | `#12110D` | High-contrast text on highlighter | $\ge 7:1$ vs highlight |
| `--color-focus-ring` | `#184E3B` | `#FFDC4A` | Keyboard focus outline | $\ge 3:1$ vs canvas/surface |

### 2.2 Semantic Context Tints (Non-Traffic-Light)

1. **Attention Tint (Highlighter Yellow Context):** Used for potential concern cards, warning alerts, and sample margin callouts.
   - Light: Background `#FFF7D6`, Border `#8F6300`, Text `#593E00`, Accent `#8F6300` (all text $\ge 4.5:1$).
   - Dark: Background `#2B2310`, Border `#A37F1A`, Text `#FFE885`, Accent `#FFDC4A` (all text $\ge 7:1$).
2. **Backwards-Compatible Aliases:** Legacy variables (`--bg`, `--surface`, `--surface-muted`, `--border`, `--text`, `--text-muted`, `--primary-ledger`, `--accent-highlighter`, etc.) are mapped directly to their corresponding `--color-*` tokens in `src/app/globals.css`.

---

## 3. Typography Architecture

Fonts are loaded at build time via `next/font/google` in `src/app/layout.tsx`:

- **Primary UI & Body:** `IBM Plex Sans` (weights: 400, 500, 600) — technical clarity, neutral grotesque grotesque characteristics, high legibility.
- **Data, Lines, & Quotes:** `IBM Plex Mono` (weights: 400, 500) — mechanical precision, tabular alignment for document quotes, character counts, and line numbers.
- **Editorial Headlines:** `Newsreader` (weights: 400, 600) — warm, authoritative editorial display serif reserved for landing page hero titles.

### 3.1 Typographic Metrics & Scale
- **Base Body Text:** 15px (`font-size: 15px`), line-height 1.6 (`leading-relaxed`).
- **Secondary Text & Labels:** 13px (`text-xs` / `text-[13px]`).
- **Absolute Floor:** Nothing smaller than 12px anywhere in the interface.
- **Letter Spacing:** No negative tracking on UI controls or body prose (`letter-spacing: 0`); headlines constrained to `tracking-[-0.01em]`.
- **Prose Constraints:** Prose paragraphs and observation interpretations are strictly constrained to `max-w-[70ch]` to maintain comfortable reading eye-travel.
- **Tabular Figures:** All counts, line numbers, scores, and metrics use `tabular-nums` for rock-solid visual stability.

---

## 4. Layout Architecture

### 4.1 Global Responsive Container Primitive
Replaces rigid 1152px / `max-w-6xl` wrappers with a fluid full-width container declared in `src/components/layout/Container.tsx`:
$$\text{width} = \min(100\% - 2 \times \text{gutter}, 2000\text{px}) \quad \text{where} \quad \text{gutter} = \text{clamp}(16\text{px}, 2.5\text{vw}, 48\text{px})$$

Used consistently across all routes: landing page, `/check`, `/resources`, 404, error, and top-level headers/footers.

### 4.2 Tool Page (`/check`) Layout States

1. **Pre-Review State (Initial Visit / Before Analysis):**
   - **7/12 Left Column:** Input card with paste textarea, optional file upload dropzone, clear button, and keyboard shortcut hint (`Press Ctrl+Enter or ⌘+Enter to analyze`).
   - **5/12 Right Column:**
     - *Try a sample offer:* Clickable sample cards from `src/data/examples.ts` that immediately populate the input.
     - *What you will get:* Clean summary of the four review outputs (concerns, missing details, questions, research).
     - *Privacy reminder:* Clear statement that pasted text remains in tab memory and is sent only to Gemini API for review.
   - *Clean Slate:* Dashed empty placeholder boxes and pre-analysis research cards are removed.

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
     - 44px touch targets on all interactive elements.
     - Fixed sticky bottom action bar on mobile screens $< 640$px when the textarea is populated, respecting `env(safe-area-inset-bottom)`.

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
