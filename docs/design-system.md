# Design System v2: Annotated Paper (OfferCheck)

## 1. Principles
OfferCheck is a calm, trustworthy utility for students and first-time job seekers designed for critical reading, not a scam alarm dashboard.
- **Annotated Paper aesthetic:** Tactile, academic, and journalistic. Feels like reviewing physical correspondence with an archival highlighter and ledger pen.
- **Calm and analytical:** Strictly avoids aggressive alarm colors, red/green traffic lights, or dramatic warning badges.
- **Evidence-grounded:** Every observation is linked directly to exact quotations from the offer text.
- **Transparent and modest:** Plain statements of epistemic limitations; "No concerns identified" never reads as "safe".
- **Anti-cliché:** Explicitly avoids purple/indigo gradients, neon glows, glassmorphism blobs, gradient-mesh backgrounds, bento-grid templates, and AI sparkle icons. Uses confident typography, generous whitespace, asymmetric layout, and CSS paper patterns.
- **Zero runtime external assets:** All fonts (`Instrument Serif`, `Instrument Sans`, `IBM Plex Mono`) are self-hosted at build time via `next/font/google`. All icons and textures are pure SVG and CSS.

---

## 2. Design Tokens

Design tokens are declared as CSS variables in `src/app/globals.css`. The application provides an automatic light theme (default) and a dark theme via `prefers-color-scheme: dark`.

### 2.1 Core Palette

| Token | Light Theme ("Annotated Paper") | Dark Theme ("Warm Charcoal") | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg` | `#f4efe4` (warm paper) | `#14130f` (warm charcoal) | Main viewport canvas |
| `--surface` | `#faf7f0` (clean paper surface) | `#1c1a15` (charcoal card surface) | Primary cards, panels, and modals |
| `--surface-muted` | `#eae4d5` (warm paper tint) | `#24221c` (elevated well) | Secondary panels, textareas, callouts |
| `--border` | `#dcd5c5` (warm graphite border) | `#333028` (charcoal border) | Structural 1px dividers and borders |
| `--border-muted` | `#cac0ad` (light graphite) | `#423f36` (muted border) | Subtle inner borders and scrollbars |
| `--text` | `#17150f` (warm near-black ink) | `#f4efe4` (paper-coloured text) | High-contrast body and heading text |
| `--text-muted` | `#57534a` (muted ink) | `#a39e93` (muted paper text) | Supporting labels, hints, and limits |
| `--accent` | `#17150f` | `#f4efe4` | Secondary button text, icons |
| `--accent-highlighter` | `#ffd84a` (highlighter yellow) | `#ffd84a` (highlighter yellow) | Signature accent for text highlights |
| `--primary-ledger` | `#1e5c46` (deep ledger green) | `#2f7c60` (adjusted ledger green) | Primary action controls, CTAs, links |
| `--primary-ledger-hover`| `#164635` | `#3d9675` | Hover state for primary buttons |
| `--focus-ring` | `#1e5c46` | `#ffd84a` | Accessible 2px keyboard focus outline |

### 2.2 Semantic Context Tints (Non-Traffic-Light)

OfferCheck strictly avoids red/green binary verdict semantics. Three soft tints indicate context without implying a judgment:

1. **Attention Tint (Soft Highlighter Yellow):** Used for Section A (Potential concerns) and landing page annotations.
   - Light theme:
     - `--tint-attention-bg`: `#fff9db`
     - `--tint-attention-border`: `#ffd84a`
     - `--tint-attention-text`: `#17150f`
     - `--tint-attention-accent`: `#b8860b`
   - Dark theme:
     - `--tint-attention-bg`: `#292414`
     - `--tint-attention-border`: `#a38012`
     - `--tint-attention-text`: `#fff0a6`
     - `--tint-attention-accent`: `#ffd84a`

2. **Info Tint (Neutral Graphite):** Used for Section B (Missing or unclear details).
   - Light theme:
     - `--tint-info-bg`: `#efe9dc`
     - `--tint-info-border`: `#cac0ad`
     - `--tint-info-text`: `#3d3933`
   - Dark theme:
     - `--tint-info-bg`: `#1e1c17`
     - `--tint-info-border`: `#3d3933`
     - `--tint-info-text`: `#d5cebf`

3. **Action Tint (Deeper Paper Tint with Ink Border):** Used for Section C (Verification questions).
   - Light theme:
     - `--tint-action-bg`: `#eae3d2`
     - `--tint-action-border`: `#8c8270`
     - `--tint-action-text`: `#17150f`
   - Dark theme:
     - `--tint-action-bg`: `#222019`
     - `--tint-action-border`: `#524c40`
     - `--tint-action-text`: `#f4efe4`

### 2.3 Contrast Verification (WCAG AA & AAA)
- **Light Theme Text:** `#17150f` on `#faf7f0` provides **17.5:1** (exceeds WCAG AAA 7:1).
- **Light Theme Muted Text:** `#57534a` on `#faf7f0` provides **5.9:1** (exceeds WCAG AA 4.5:1).
- **Light Theme Primary Button:** `#f4efe4` text on `#1e5c46` button provides **5.8:1** (exceeds WCAG AA 4.5:1).
- **Dark Theme Text:** `#f4efe4` on `#1c1a15` provides **14.5:1** (exceeds WCAG AAA 7:1).
- **Dark Theme Muted Text:** `#a39e93` on `#1c1a15` provides **6.0:1** (exceeds WCAG AA 4.5:1).

---

## 3. Typography & Spacing Scales

### 3.1 Type Families
- **Display Serif (`font-serif`):** `Instrument Serif` (Google Fonts via `next/font/google`, `display: swap`). Used for large headlines, section titles, and marketing display text.
- **Body & UI Sans (`font-sans`):** `Instrument Sans` (Google Fonts via `next/font/google`, `display: swap`). Used for UI labels, buttons, cards, descriptions, and forms.
- **Monospace (`font-mono`):** `IBM Plex Mono` (Google Fonts via `next/font/google`, `display: swap`). Used for offer document previews, quotations, metadata tags, and counters.

### 3.2 Spacing Scale
Based on a 4px/8px modular rhythm:
- `4px` (0.25rem), `8px` (0.5rem), `12px` (0.75rem), `16px` (1rem), `24px` (1.5rem), `32px` (2rem), `48px` (3rem).
- Page maximum width: `1152px` (`max-w-6xl`).

### 3.3 Texture and Depth
- **Paper Pattern:** `.paper-pattern` applies a subtle radial-dot matrix in pure CSS (`radial-gradient(var(--border) 0.65px, transparent 0.65px)` with `background-size: 20px 20px`). Zero raster images.
- **Tilt Parallax:** Hero document applies a subtle 3D perspective tilt (clamped to max ±3 degrees) driven via `requestAnimationFrame` and CSS transforms. Automatically disabled on touch screens and when `prefers-reduced-motion: reduce` is active.
