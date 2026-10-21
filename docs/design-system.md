# Design System v3: Console-Style Enterprise Paper & Balanced Workspace (OfferCheck)

## 1. Principles
OfferCheck is a calm, trustworthy utility for students and first-time job seekers designed for rigorous, critical reading, not a scam alarm dashboard.
- **Enterprise Console Paper Aesthetic:** Combines the tactile, archival clarity of physical document verification with the high-density efficiency of an enterprise cloud console. Clean light canvas (`#F2F3F3`), crisp white surface cards (`#FFFFFF`), charcoal headers (`#1F2933`), and deep ledger green accents (`#1E5C46`).
- **Calm and Analytical:** Strictly avoids aggressive alarm colours, red/green traffic lights, or dramatic warning badges.
- **Evidence-Grounded:** Every observation is linked directly to exact verbatim quotations from the offer text.
- **Console Density:** 1px borders, compact 4px container radius, 2px control radius, 32-36px control heights, 14px base typography with 12px secondary text, and compact 16-20px padding.
- **Transparent and Modest:** Plain statements of epistemic limitations; "No concerns identified" never reads as "safe".
- **Balanced Desktop Layout:** 5/12 left column, 7/12 right column on desktop. Left column transitions post-review into a sticky review workspace panel with an offer highlight snapshot and scroll-spy navigation.
- **Contextual Research Nudge:** Intelligently reminds candidates to research the employer when the company is unnamed, free email is used without a website, or an internship lacks supervisor details.
- **Zero Runtime External Assets:** All fonts (`Instrument Serif`, `Instrument Sans`, `IBM Plex Mono`) are self-hosted at build time via `next/font/google`. All icons and textures are pure SVG and CSS.

---

## 2. Design Tokens

Design tokens are declared as CSS variables in `src/app/globals.css`. The application provides an explicit theme system supporting Light (default), Dark, and System preferences, mapped via the `data-theme` attribute on `<html>` and Tailwind v4 `@custom-variant dark`.

### 2.1 Core Palette

| Token | Light Theme ("Enterprise Paper") | Dark Theme ("Warm Charcoal") | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg` | `#f2f3f3` (console canvas) | `#14130f` (warm charcoal) | Main viewport canvas |
| `--surface` | `#ffffff` (crisp white card) | `#1c1a15` (charcoal card surface) | Primary cards, panels, and tables |
| `--surface-alt` / `--surface-muted` | `#f8f8f8` (subtle paper tint) | `#24221c` (elevated well) | Secondary panels, textareas, headers |
| `--border` | `#d5dbdb` (console border) | `#333028` (charcoal border) | Structural 1px dividers and borders |
| `--border-strong` | `#aab7b8` (strong border) | `#4a453a` (strong charcoal border) | Emphasised borders, inputs, focus rings |
| `--border-muted` | `#d5dbdb` | `#423f36` | Subtle inner borders and scrollbars |
| `--text` | `#16191f` (near-black ink) | `#f4efe4` (paper-coloured text) | High-contrast body and heading text |
| `--text-muted` | `#545b64` (slate graphite) | `#a39e93` (muted paper text) | Supporting labels, hints, and limits |
| `--header-bg` | `#1f2933` (dark slate header) | `#14130f` (charcoal header) | Header navigation background |
| `--header-text` | `#ffffff` | `#f4efe4` | Header navigation brand and text |
| `--primary-ledger` | `#1e5c46` (deep ledger green) | `#2f7c60` (adjusted ledger green) | Primary action controls, CTAs, links |
| `--primary-ledger-hover` | `#17493a` | `#3d9675` | Hover state for primary buttons |
| `--focus-ring` | `#1e5c46` (with 2px white offset) | `#ffd84a` | Accessible 2px keyboard focus outline |
| `--accent-highlighter` | `#ffd84a` (highlighter yellow) | `#ffd84a` (highlighter yellow) | Signature accent for text highlights |

### 2.2 Semantic Context Tints (Non-Traffic-Light)

OfferCheck strictly avoids red/green binary verdict semantics. Three soft tints indicate context without implying a judgment:

1. **Attention Tint (Soft Highlighter Yellow):** Used for Section A (Potential concerns), recommended research cards, and landing page annotations.
   - Light theme:
     - `--tint-attention-bg`: `#fff7d6`
     - `--tint-attention-border`: `#b8860b` (rendered with 3px yellow border)
     - `--tint-attention-text`: `#16191f`
     - `--tint-attention-accent`: `#b8860b`
   - Dark theme:
     - `--tint-attention-bg`: `#292414`
     - `--tint-attention-border`: `#a38012`
     - `--tint-attention-text`: `#fff0a6`
     - `--tint-attention-accent`: `#ffd84a`

2. **Info Tint (Neutral Gray):** Used for Section B (Missing or unclear details) and informational cards.
   - Light theme:
     - `--tint-info-bg`: `#eef2f6`
     - `--tint-info-border`: `#d5dbdb`
     - `--tint-info-text`: `#16191f`
   - Dark theme:
     - `--tint-info-bg`: `#1e1c17`
     - `--tint-info-border`: `#333028`
     - `--tint-info-text`: `#d5cebf`

3. **Action Tint (Deeper Well Tint with Ink Border):** Used for Section C (Verification questions).
   - Light theme:
     - `--tint-action-bg`: `#eef2f6`
     - `--tint-action-border`: `#aab7b8`
     - `--tint-action-text`: `#16191f`
   - Dark theme:
     - `--tint-action-bg`: `#222019`
     - `--tint-action-border`: `#524c40`
     - `--tint-action-text`: `#f4efe4`

### 2.3 Contrast Verification (WCAG AA & AAA)

| Pair | Background | Foreground | Ratio | Standard | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Light Canvas Text** | `#f2f3f3` | `#16191f` | **15.2:1** | WCAG AAA ($\ge 7:1$) | Pass |
| **Light Card Text** | `#ffffff` | `#16191f` | **16.8:1** | WCAG AAA ($\ge 7:1$) | Pass |
| **Light Muted Text** | `#ffffff` | `#545b64` | **5.6:1** | WCAG AA ($\ge 4.5:1$) | Pass |
| **Light Primary Button** | `#1e5c46` | `#ffffff` | **6.3:1** | WCAG AA ($\ge 4.5:1$) | Pass |
| **Light Header Text** | `#1f2933` | `#ffffff` | **13.4:1** | WCAG AAA ($\ge 7:1$) | Pass |
| **Dark Canvas Text** | `#14130f` | `#f4efe4` | **16.2:1** | WCAG AAA ($\ge 7:1$) | Pass |
| **Dark Card Text** | `#1c1a15` | `#f4efe4` | **14.5:1** | WCAG AAA ($\ge 7:1$) | Pass |
| **Dark Muted Text** | `#1c1a15` | `#a39e93` | **6.0:1** | WCAG AA ($\ge 4.5:1$) | Pass |
| **Dark Primary Button** | `#2f7c60` | `#ffffff` | **4.9:1** | WCAG AA ($\ge 4.5:1$) | Pass |

---

## 3. Theme System Architecture

OfferCheck supports **Light**, **Dark**, and **System** visual themes, with Light as the default:
1. **Root Configuration:** Theme state is stored in `localStorage` under key `"offercheck-theme"` and synchronized directly to the `<html data-theme="light" | "dark">` attribute.
2. **Tailwind v4 Integration:** Tailwind CSS v4 is configured with:
   ```css
   @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
   ```
3. **Zero FOUC (Flash of Unstyled Content):** An inline `<script>` in `<head>` executes synchronously prior to first paint, resolving `localStorage` or `window.matchMedia("(prefers-color-scheme: dark)")` and immediately setting `data-theme` and `<meta name="theme-color">`.
4. **ThemeToggle Component:** A top-right segmented pill control (`role="radiogroup"`, `aria-label="Theme preference"`) with roving tabindex, keyboard arrow navigation, and visible focus rings across all navigation bars (`LandingNav`, `Header`, `ResourcesPage`, `NotFound`, `ErrorBoundary`).
5. **Storage Guarantee:** Offer text and uploaded files exist exclusively in volatile browser tab memory (`SessionProvider`). The theme preference is the sole item persisted in browser storage.

---

## 4. Console Density & Layout Architecture

### 4.1 Console Density Rules
- **Container Cards:** 1px border (`border-[var(--border)]`), 4px radius (`rounded`), minimal flat shadow (`shadow-2xs`).
- **Interactive Controls:** 2px radius (`rounded-xs`), 32-36px height (`min-h-[34px] sm:min-h-[36px]`).
- **Typography:** 14px base font (`text-sm`), 12px secondary font (`text-xs`), and compact 16-20px padding (`p-4` or `p-5`).
- **Headings on Tool Pages:** Sentence-case headings in `Instrument Sans` (`font-sans`), reserving display serif (`Instrument Serif`) exclusively for landing hero headlines and marketing section titles.
- **Missing Details Table:** Replaces loose card grids with a compact 2-column table (`Topic | Note`) featuring subtle row hover highlights.

### 4.2 Balanced `/check` Layout
- **Desktop ($\ge 1024\text{px}$):**
  - **Left Column (5/12):**
    - *Before Review:* Interactive `OfferInputForm` (paste, upload dropzone, sample picker).
    - *After Review:* Sticky workspace panel (`YourOfferWorkspace`) featuring:
      - Read-only snapshot of the offer text with highlight spans rendered via `buildHighlightSegments`.
      - Highlight count chip (`"N highlights"` or `"No lines were highlighted for this review."`).
      - Character count counter.
      - "Edit text" button (switches panel back to input form while preserving session data).
      - "New review" button with inline confirmation prompt.
      - "On this page" scroll-spy navigation (`OnThisPageNav`) observing section headers in real time.
  - **Right Column (7/12):** Review workspace rendering loading skeletons, error alerts, review summary, recommended research card, potential concerns, missing details table, questions to verify, and limits.
  - **Desktop Jump Nav:** The horizontal jump bar is hidden on desktop, as `OnThisPageNav` on the left serves this purpose without duplicating vertical height.
- **Mobile ($< 1024\text{px}$):**
  - Single column order:
    1. Input card or offer snapshot
    2. Review summary
    3. Research reminder (if recommended)
    4. Sticky horizontal jump navigation
    5. Detailed results sections

---

## 5. Contextual Company Research Nudge & Always-Visible Actions

Independent research handoff is guided by the pure evaluation function `getResearchNudge`:
- **Recommendation Triggers:**
  1. Unnamed company or employer in the offer text.
  2. Free personal email address used without an accompanying company website.
  3. Internship offer with missing reporting contact, mentor, or supervisor details (strictly verified with word boundaries; terms like "international" or "internal" do not match).
- **Dual Placement:**
  - *Recommended:* Placed immediately below the Review Summary card with a banner outlining the exact reasons and the advice: *"Before you sign or pay, spend two minutes looking up who sent this offer."*
  - *Optional:* Placed lower after the verification questions.
- **Always-Visible Action Controls:**
  - 1-line key-value summary (`Company`, `Website`, `Sender domain`, `Role`).
  - Required inline company name input when missing, with explanation and disabled copy button.
  - Depth selector (Short ~300 words vs Detailed ~600 words).
  - "Copy research prompt" and "Open Perplexity" actions.
  - "Edit details" collapsible toggle to reveal editable fields, channel observations, and prompt preview.
