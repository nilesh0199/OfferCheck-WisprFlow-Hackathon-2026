# OfferClara Design Brief

## 1. Product Identity: The Annotated Document
OfferClara is a calm, honest review assistant for students and first-time job seekers receiving internship or entry-level job offers. Rather than behaving like an automated judging machine or AI oracle, its visual metaphor is a desk with an **annotated document**: a letter in the margins, real line numbers, high-contrast text, and a physical highlighter pen marking specific phrases of evidence. It renders observations with neutral forensic precision, avoiding alarmist verdicts or false assurances.

## 2. Typography
- **UI & Body**: `IBM Plex Sans` (400, 500, 600) — engineering clarity, high legibility at dense scales.
- **Data, Lines, & Quotes**: `IBM Plex Mono` (400, 500) — precise alignment, tabular figures, and mechanical authenticity for document quotes and line numbers.
- **Editorial Headlines**: `Newsreader` (400, 600) — used selectively on landing hero titles for warm, trustworthy editorial gravity.
- **Metrics**: 15px base body text, 13px secondary captions, 12px absolute minimum. Line-height 1.55–1.65. Tracking is neutral (`letter-spacing: 0` or `>= -0.01em` on headlines). Tabular numbers on all counters. Prose blocks constrained to `<= 70ch`.

## 3. Color & Semantic Tokens
- **Theme Support**: Fully adaptive dual theme with explicit `color-scheme: light` and `color-scheme: dark`. Zero raw hardcoded hex or default palette classes outside token definitions.
- **Palette**: "Ink blue" primary system with deep navy header in light mode, deep dark navy in dark mode, balanced high-contrast slate-blue text and surface tones, and yellow highlighter strictly reserved for quote highlights and observational evidence.
- **Semantic Tokens**:
  - Canvas & Surface: `--color-canvas`, `--color-surface`, `--color-surface-alt`.
  - Header: `--color-header-bg`, `--color-header-text`, `--color-header-nav-text`.
  - Text: `--color-text` (>= 4.5:1), `--color-text-muted` (>= 4.5:1 for body readability), `--color-text-subtle` (>= 3:1 for non-text borders/icons).
  - Borders: `--color-border`, `--color-border-strong`.
  - Action Accent: Single restrained accent `--color-primary` with high-contrast `--color-primary-contrast` and `--color-primary-hover`.
  - Semantic Tints: `--tint-info-bg`, `--tint-info-border`, `--tint-action-bg`, `--tint-action-border`.
  - Evidence Marker: Yellow highlighter (`--color-highlight`, `--color-highlight-ink`) and observation tints (`--color-tint-obs-bg`, `--color-tint-obs-border`, `--color-tint-obs-text`) reserved exclusively for quotes and observational evidence.
- **Hard Guardrails**: No red/green traffic-light review verdicts. No purple/indigo AI gradients. No neon glows or glassmorphic blur blobs.

### Swappable Palettes

OfferClara supports three complete, accessible, production-tested colour palettes. All tokens are declared in ONE clearly marked block in `src/app/globals.css`. Swapping the site's entire color theme requires editing only that single CSS block.

#### Palette A: "Ink Blue" (Active / Default)
*Authoritative editorial look with deep navy header, crisp paper/ink contrast, and warm yellow highlighter evidence.*

| Token | Light Theme | Dark Theme |
| :--- | :--- | :--- |
| `--color-header-bg` | `#10263f` | `#0a111a` |
| `--color-header-text` | `#ffffff` | `#ffffff` |
| `--color-header-nav-text` | `#c5d3e4` | `#c5d3e4` |
| `--color-canvas` | `#f2f5f9` | `#0e1620` |
| `--color-surface` | `#ffffff` | `#152130` |
| `--color-surface-alt` | `#eaf0f7` | `#1b2a3d` |
| `--color-surface-muted` | `#f0f4f9` | `#121c2a` |
| `--color-text` | `#14202e` | `#e8eef6` |
| `--color-text-muted` | `#4b5b6d` | `#a9b7c9` |
| `--color-text-subtle` | `#546578` | `#94a4b8` |
| `--color-border` | `#d5dfeb` | `#223348` |
| `--color-border-strong` | `#7b8ca3` | `#5b7496` |
| `--color-border-muted` | `#e2ebf4` | `#1b2838` |
| `--color-primary` | `#1d5fa8` | `#5b9bf0` |
| `--color-primary-hover` | `#164a85` | `#7cb2f5` |
| `--color-primary-contrast` | `#ffffff` | `#0b1520` |
| `--tint-info-bg` | `#eaf0f7` | `#172333` |
| `--tint-info-border` | `#c8d7e8` | `#24364e` |
| `--tint-action-bg` | `#e3eefb` | `#1a283b` |
| `--tint-action-border` | `#b6d2f3` | `#2b4260` |
| `--focus-ring` | `#1d5fa8` | `#8cb8f7` |
| `--color-highlight` | `#ffe27a` | `#ffe27a` |
| `--color-highlight-ink` | `#1b1b1b` | `#0e1620` |
| `--color-tint-obs-bg` | `#fff6d6` | `#282210` |
| `--color-tint-obs-border` | `#e5c85c` | `#5a4a1a` |
| `--color-tint-obs-text` | `#593e00` | `#fde896` |

#### Palette B: "Petrol" (Alternative: Deep Slate-Teal)
*Subtle cool-toned technical palette with slate-teal primary and balanced grey-green undertones.*

| Token | Light Theme | Dark Theme |
| :--- | :--- | :--- |
| `--color-header-bg` | `#0c262a` | `#081719` |
| `--color-header-text` | `#ffffff` | `#ffffff` |
| `--color-header-nav-text` | `#c0d6d9` | `#c0d6d9` |
| `--color-canvas` | `#f0f5f5` | `#0c181a` |
| `--color-surface` | `#ffffff` | `#132326` |
| `--color-surface-alt` | `#e8f1f2` | `#192e31` |
| `--color-surface-muted` | `#edf4f5` | `#101e21` |
| `--color-text` | `#122022` | `#e4edee` |
| `--color-text-muted` | `#475a5c` | `#a4b5b7` |
| `--color-text-subtle` | `#526668` | `#90a2a4` |
| `--color-border` | `#d2e0e2` | `#1e363b` |
| `--color-border-strong` | `#758e91` | `#53777d` |
| `--color-border-muted` | `#dfebed` | `#172b2f` |
| `--color-primary` | `#185e68` | `#52a3ae` |
| `--color-primary-hover` | `#124a52` | `#6eb4bd` |
| `--color-primary-contrast` | `#ffffff` | `#071517` |
| `--tint-info-bg` | `#e8f1f2` | `#142528` |
| `--tint-info-border` | `#c2d9db` | `#1f393d` |
| `--tint-action-bg` | `#e0eff1` | `#172c30` |
| `--tint-action-border` | `#afd1d5` | `#26474d` |
| `--focus-ring` | `#185e68` | `#7fc1ca` |
| `--color-highlight` | `#ffe27a` | `#ffe27a` |
| `--color-highlight-ink` | `#1b1b1b` | `#0c181a` |
| `--color-tint-obs-bg` | `#fff6d6` | `#282210` |
| `--color-tint-obs-border` | `#e5c85c` | `#5a4a1a` |
| `--color-tint-obs-text` | `#593e00` | `#fde896` |

#### Palette C: "Cobalt with Light Header" (Alternative: Institutional Variant)
*Crisp light-header corporate look for institutions and universities.*

| Token | Light Theme | Dark Theme |
| :--- | :--- | :--- |
| `--color-header-bg` | `#ffffff` | `#09131f` |
| `--color-header-text` | `#0f2238` | `#ffffff` |
| `--color-header-nav-text` | `#445970` | `#c5d3e4` |
| `--color-canvas` | `#f4f6fa` | `#0c141e` |
| `--color-surface` | `#ffffff` | `#131f2d` |
| `--color-surface-alt` | `#edf2fa` | `#182739` |
| `--color-surface-muted` | `#f1f5fa` | `#101b27` |
| `--color-text` | `#111d2c` | `#e7edf6` |
| `--color-text-muted` | `#48596e` | `#a6b6c9` |
| `--color-text-subtle` | `#54667c` | `#92a3b8` |
| `--color-border` | `#d7e1ee` | `#213348` |
| `--color-border-strong` | `#7b8ea7` | `#597497` |
| `--color-border-muted` | `#e3ebf6` | `#1a293b` |
| `--color-primary` | `#1b5bb0` | `#5998f4` |
| `--color-primary-hover` | `#15488c` | `#7bb0f7` |
| `--color-primary-contrast` | `#ffffff` | `#09131f` |
| `--tint-info-bg` | `#edf2fa` | `#152232` |
| `--tint-info-border` | `#cbd8ed` | `#22354e` |
| `--tint-action-bg` | `#e4effc` | `#18283c` |
| `--tint-action-border` | `#bad5f6` | `#294362` |
| `--focus-ring` | `#1b5bb0` | `#8ab6f8` |
| `--color-highlight` | `#ffe27a` | `#ffe27a` |
| `--color-highlight-ink` | `#1b1b1b` | `#0c141e` |
| `--color-tint-obs-bg` | `#fff6d6` | `#282210` |
| `--color-tint-obs-border` | `#e5c85c` | `#5a4a1a` |
| `--color-tint-obs-text` | `#593e00` | `#fde896` |

#### How to Swap Palettes
1. Open `src/app/globals.css`.
2. Locate the token definition block bounded by `/* --- PALETTE TOKENS (LIGHT) --- */` and `/* --- PALETTE TOKENS (DARK) --- */`.
3. Replace the hex values in that block with the values from Palette B or Palette C above.
4. Save the file. All application surfaces, headers, borders, active indicators, and focus rings will immediately adopt the new palette while preserving full WCAG contrast.

## 4. Layout Architecture
- **Global Container Primitive**: Full-bleed responsive container across all pages: `width: min(100% - 2 * gutter, 2000px)` with `gutter = clamp(16px, 2.5vw, 48px)`. No rigid 1152px/max-w-6xl choke-points.
- **Tool Page (`/check`) Three-Zone Desk**:
  - *Pre-analysis*: 7/12 left input card + 5/12 right contextual guidance (samples, explanation, privacy). Step 5 integrates client-side regex masking and an interactive visual preview to manually scrub sensitive data (names, phones, emails, Aadhaar, PAN) with semantic placeholder tokens prior to AI submission.
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
