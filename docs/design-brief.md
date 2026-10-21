# OfferCheck Design Brief

## 1. Product Identity: The Annotated Document
OfferCheck is a calm, honest review assistant for students and first-time job seekers receiving internship or entry-level job offers. Rather than behaving like an automated judging machine or AI oracle, its visual metaphor is a desk with an **annotated document**: a letter in the margins, real line numbers, high-contrast text, and a physical highlighter pen marking specific phrases of evidence. It renders observations with neutral forensic precision, avoiding alarmist verdicts or false assurances.

## 2. Typography
- **UI & Body**: `IBM Plex Sans` (400, 500, 600) — engineering clarity, high legibility at dense scales.
- **Data, Lines, & Quotes**: `IBM Plex Mono` (400, 500) — precise alignment, tabular figures, and mechanical authenticity for document quotes and line numbers.
- **Editorial Headlines**: `Newsreader` (400, 600) — used selectively on landing hero titles for warm, trustworthy editorial gravity.
- **Metrics**: 15px base body text, 13px secondary captions, 12px absolute minimum. Line-height 1.55–1.65. Tracking is neutral (`letter-spacing: 0` or `>= -0.01em` on headlines). Tabular numbers on all counters. Prose blocks constrained to `<= 70ch`.

## 3. Color & Semantic Tokens
- **Theme Support**: Fully adaptive dual theme with explicit `color-scheme: light` and `color-scheme: dark`. Zero raw hardcoded hex or default slate palette classes outside token definitions.
- **Palette**: Deep slate/charcoal tones in dark mode, crisp paper/ink tones in light mode.
- **Semantic Tokens**:
  - Canvas & Surface: `--color-canvas`, `--color-surface`, `--color-surface-alt`.
  - Text: `--color-text` (>= 4.5:1), `--color-text-muted` (>= 4.5:1 for body readability), `--color-text-subtle` (>= 3:1 for non-text borders/icons).
  - Borders: `--color-border`, `--color-border-strong`.
  - Action Accent: Single restrained accent `--color-primary` with high-contrast `--color-primary-contrast`.
  - Evidence Marker: Yellow highlighter (`--color-accent-highlight`) reserved exclusively for quotes and observational evidence.
- **Hard Guardrails**: No red/green traffic-light review verdicts. No purple/indigo AI gradients. No neon glows or glassmorphic blur blobs.

## 4. Layout Architecture
- **Global Container Primitive**: Full-bleed responsive container across all pages: `width: min(100% - 2 * gutter, 2000px)` with `gutter = clamp(16px, 2.5vw, 48px)`. No rigid 1152px/max-w-6xl choke-points.
- **Tool Page (`/check`) Three-Zone Desk**:
  - *Pre-analysis*: 7/12 left input card + 5/12 right contextual guidance (samples, explanation, privacy).
  - *Post-analysis (>= 1280px)*: Left rail (original offer text with line numbers and interactive evidence highlights), Center fluid column (findings, checklist, questions, resources), Right rail (sticky section outline and actions).
  - *1024–1279px*: 2-column layout with collapsible offer panel in center.
  - *< 1024px*: Single column with sticky horizontal section pills.
- **Mobile Floor**: 44px minimum touch targets, sticky bottom action bar on input, zero horizontal overflow at 360px–1920px.

## 5. Motion & Interaction
- Lightweight, dependency-free CSS/JS animations only.
- Strict `prefers-reduced-motion` compliance with visible opt-in controls ("Play animation" / "Replay animation").
- Hero entrance and scroll scene orchestrated cleanly without scroll hijacking or parent overflow clipping.

## 6. Design Skill Guidance: Adopted vs. Rejected
- **Adopted from `frontend-design` & `design-taste-frontend`**: Subject-grounded design (the annotated letter), elimination of AI template tells (no all-caps eyebrows, no decorative sparkles, no fake metrics, no template cards), high-contrast typography, and restrained purposeful motion.
- **Adopted from `ui-ux-pro-max`**: WCAG AA contrast standards (>= 4.5:1 for normal text, >= 3:1 for large/borders), minimum 44px tap targets, visible focus rings, and strict avoidance of emoji icons.
- **Adopted from `nextjs-app-router-patterns`**: Server Components where possible, minimal client-side hydration, resilient route layouts, and robust font loading via `next/font/google`.
- **Rejected**: Commercial SaaS template styles (multi-colored status chips, purple gradients, decorative floating shapes), automated verdict badges ("Safe"/"Scam"), and heavy runtime animation or UI libraries.
