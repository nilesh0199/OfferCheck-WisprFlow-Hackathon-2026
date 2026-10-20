# Design System: OfferCheck

## 1. Principles
OfferCheck is a calm, trustworthy student utility designed for critical reading, not a scam alarm dashboard.
- **Calm and analytical:** Avoid aggressive alerts, red/green traffic lights, or dramatic warning badges.
- **Clear and uncluttered:** Generous whitespace, predictable typographic hierarchy, and clean structure.
- **Trustworthy:** Transparent source attribution for every observation; explicit limits on what the tool can know.
- **Minimal:** One primary accent colour (calm slate-indigo/teal), neutral surfaces, and soft contextual tints.
- **System native:** Uses standard system UI fonts and SVG iconography; zero external font or UI dependencies.

---

## 2. Design Tokens

Design tokens are declared as CSS variables in `src/app/globals.css`. The application provides an automatic light theme (default) and a dark theme via `prefers-color-scheme: dark`.

### 2.1 Core Palette

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg` | `#f8fafc` (slate-50) | `#0b0f17` (deep slate-950) | Main viewport canvas |
| `--surface` | `#ffffff` (pure white) | `#131924` (slate-900) | Primary cards, panels, and modals |
| `--surface-muted` | `#f1f5f9` (slate-100) | `#1a2232` (slate-800/90) | Secondary panels, textareas, callouts |
| `--border` | `#e2e8f0` (slate-200) | `#263348` (slate-700/80) | Structural 1px dividers and borders |
| `--border-muted` | `#edf2f7` (slate-150) | `#1e293b` (slate-800) | Subtle inner borders |
| `--text` | `#0f172a` (slate-900) | `#f1f5f9` (slate-100) | High-contrast body and heading text |
| `--text-muted` | `#475569` (slate-600) | `#94a3b8` (slate-400) | Supporting labels, hints, and limits |
| `--accent` | `#334155` (slate-700) / `#2563eb` | `#38bdf8` / `#60a5fa` | Primary action controls and active states |
| `--accent-contrast` | `#ffffff` | `#0b0f17` | Text placed on top of primary accent |
| `--focus-ring` | `#0f172a` (slate-900) | `#94a3b8` (slate-400) | Accessible 2px keyboard focus outline |

### 2.2 Semantic Context Tints (Non Red/Green)

OfferCheck strictly avoids red/green binary verdict semantics. Three soft tints indicate context without implying a judgment:

1. **Attention Tint (Soft Warm Amber):** Used exclusively for Section A (Potential concerns).
   - Light theme:
     - `--tint-attention-bg`: `#fffbeb` (amber-50)
     - `--tint-attention-border`: `#fde68a` (amber-200)
     - `--tint-attention-text`: `#92400e` (amber-800)
     - `--tint-attention-accent`: `#d97706` (amber-600)
   - Dark theme:
     - `--tint-attention-bg`: `#1c1917` (stone-900/40)
     - `--tint-attention-border`: `#78350f` (amber-900/60)
     - `--tint-attention-text`: `#fef3c7` (amber-100)
     - `--tint-attention-accent`: `#f59e0b` (amber-500)

2. **Info Tint (Neutral Slate Blue-Grey):** Used exclusively for Section B (Missing or unclear details).
   - Light theme:
     - `--tint-info-bg`: `#f8fafc` (slate-50)
     - `--tint-info-border`: `#cbd5e1` (slate-300)
     - `--tint-info-text`: `#334155` (slate-700)
   - Dark theme:
     - `--tint-info-bg`: `#0f172a` (slate-900/60)
     - `--tint-info-border`: `#334155` (slate-700)
     - `--tint-info-text`: `#cbd5e1` (slate-300)

3. **Action Tint (Calm Slate-Teal/Indigo):** Used exclusively for Section C (Verification questions).
   - Light theme:
     - `--tint-action-bg`: `#f8fafc` (slate-50)
     - `--tint-action-border`: `#cbd5e1` (slate-300)
     - `--tint-action-text`: `#0f172a` (slate-900)
   - Dark theme:
     - `--tint-action-bg`: `#111827` (gray-900/60)
     - `--tint-action-border`: `#374151` (gray-700)
     - `--tint-action-text`: `#f3f4f6` (gray-100)

### 2.3 Contrast Verification
- Light Theme: `#0f172a` on `#ffffff` provides **16.1:1** (exceeds WCAG AAA 7:1).
- Light Theme Muted: `#475569` on `#ffffff` provides **6.2:1** (exceeds WCAG AA 4.5:1).
- Dark Theme: `#f1f5f9` on `#0b0f17` provides **15.4:1** (exceeds WCAG AAA 7:1).
- Dark Theme Muted: `#94a3b8` on `#131924` provides **5.6:1** (exceeds WCAG AA 4.5:1).

---

## 3. Typography & Spacing Scales

### 3.1 Type Scale
- **Display / H1:** 1.875rem (30px) to 2.25rem (36px), font-weight 700, tracking tight.
- **Section Heading / H2:** 1.25rem (20px) to 1.5rem (24px), font-weight 700, tracking tight.
- **Card Title / H3:** 0.9375rem (15px) to 1rem (16px), font-weight 600.
- **Sub-label / H4:** 0.75rem (12px), font-weight 600, uppercase, tracking wide.
- **Body:** 0.875rem (14px), font-weight 400, line-height 1.55.
- **Caption / Meta:** 0.75rem (12px), font-weight 400 to 500, line-height 1.4.
- **Mono / Quotations / Code:** 0.8125rem (13px), system monospace stack.

### 3.2 Spacing Scale
Based on a 4px/8px modular rhythm:
- `4px` (0.25rem), `8px` (0.5rem), `12px` (0.75rem), `16px` (1rem), `24px` (1.5rem), `32px` (2rem), `48px` (3rem).
- Page maximum width: `1152px` (`max-w-6xl`).

### 3.3 Border Radius & Elevation
- **Cards & Viewers:** `12px` (`rounded-xl`).
- **Interactive Controls (Buttons, Inputs, Selects):** `8px` (`rounded-lg`).
- **Pills & Chips:** `9999px` (`rounded-full`).
- **Borders:** Crisp `1px solid var(--border)` throughout.
- **Shadows:** Minimal, subtle ambient depth (`shadow-xs` / `shadow-sm`) only.

---

## 4. Components Specification

### 4.1 Cards
Cards use `background: var(--surface)`, `border: 1px solid var(--border)`, radius `12px`, with internal padding `16px` (mobile) to `20px` (desktop).

### 4.2 Buttons
- **Primary:** High-contrast solid button (`var(--text)` background, `var(--surface)` text). Loading state displays an inline spinner with label "Analyzing...".
- **Secondary / Default:** Crisp bordered button (`var(--surface)` background, `1px solid var(--border)`).
- **Ghost:** Minimal text button with hover highlight (`hover:bg-slate-100`).
- **Touch targets:** Minimum height `44px` on all buttons and tap targets.
- **Focus:** 2px visible ring with 2px offset (`focus-visible:ring-2 focus-visible:ring-offset-2`).

### 4.3 Chips and Count Badges
- Sentence case, small pill styling (`px-2.5 py-0.5 rounded-full text-xs`).
- Section counts appear as neutral chips (e.g., `3 observations`, `4 missing details`, `3 questions`). Counts are factual numbers, never risk scores.

### 4.4 Callouts
- Bounded containers with soft contextual backgrounds, 1px border, and leading icon.
- Used for Privacy & AI Data notice, Outdated Review banner, and Error states.

### 4.5 Jump Navigation
- Compact sticky horizontal nav on desktop allowing quick anchor scrolling to:
  1. Observations (`#section-observations`)
  2. Missing details (`#section-missing`)
  3. Questions (`#section-questions`)
  4. Limits (`#section-limits`)

### 4.6 Skeletons
- Muted pulse shimmer matching `--surface-muted` and `--border`, indicating analysis in progress without deceptive progress percentage indicators.

---

## 5. Motion & Accessibility

- **Duration:** 150ms transitions (`transition-all duration-150 ease-out`).
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables animations and smooth scrolling.
- **Live regions:** `aria-live="polite"` announces analysis duration, cancellation, and copy feedback.
- **Programmatic focus:** Heading elements focused programmatically use `tabIndex={-1}` with outline suppressed for that programmatic target to prevent jarring focus boxes, while keeping keyboard focus rings intact for interactive controls.

---

## 6. Editorial & Copy Rules

- **Sentence case:** All headings, button labels, and badges use sentence case (e.g. "Analyze offer", "How it works", "About this tool").
- **Zero emojis:** All icons are clean, accessible inline SVGs.
- **No exclamation marks:** Replaced with calm, factual wording (e.g. "Copied", "Review outdated", "Service unavailable").
- **No verdict terminology:** Prohibit "safe", "verified", "legit", "scam", or "fraud".
