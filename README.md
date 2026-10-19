# OfferCheck

> **"Understand the offer. Know what to verify."**

OfferCheck is an internship-offer review assistant designed to help students evaluate internship communications, identify questionable requests (such as upfront payment demands or equipment fees), spot missing employment terms, and prepare concrete verification questions before paying money or sharing personal documents.

OfferCheck is built as a solo submission for **No Hands: The Wispr Challenge** (Builders track).

---

## What OfferCheck Is and Is Not

- **What it is:** A text-review tool that analyzes the specific wording in an offer, highlights explicit items that warrant caution, identifies missing standard terms, and suggests clarification questions.
- **What it is NOT:** It is not a scam detector, company authentication service, legal advisor, or safety guarantee. It cannot verify whether a sender legitimately represents a company.

---

## Current Status: Phase 1 (Deployable Shell)

> [!NOTE]
> **Project in progress:** Only **Phase 1** is currently implemented. Analysis, backend endpoints, and external research integrations are not yet built.

What is currently implemented in Phase 1:
- Project documentation and specifications ([`docs/project-spec.md`](file:///d:/Wispr%20Flow%20hackathon%20we%20make%20devs/project/docs/project-spec.md), [`docs/build-plan.md`](file:///d:/Wispr%20Flow%20hackathon%20we%20make%20devs/project/docs/build-plan.md), [`docs/dev-log.md`](file:///d:/Wispr%20Flow%20hackathon%20we%20make%20devs/project/docs/dev-log.md)).
- Next.js App Router scaffolding with TypeScript, ESLint, and minimal Tailwind CSS.
- Central configuration in [`src/lib/config.ts`](file:///d:/Wispr%20Flow%20hackathon%20we%20make%20devs/project/src/lib/config.ts).
- Home page shell ([`src/app/page.tsx`](file:///d:/Wispr%20Flow%20hackathon%20we%20make%20devs/project/src/app/page.tsx)) featuring:
  - App branding and tagline.
  - Plain-language explanation of capabilities and boundaries.
  - Pre-paste privacy warning reminding users to redact names, phone numbers, addresses, bank details, and government IDs.
  - Accessible textarea with live character counter against the 8,000-character limit and visual over-limit warnings.
  - "Limits of this tool" section.
  - Visible Phase 1 development status banner.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later (developed and verified on Node v24.12.0)
- npm v10 or later (verified on npm v11.6.2)

---

## Getting Started Locally

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration (optional in Phase 1):**
   ```bash
   cp .env.example .env.local
   ```
   *(Note: Environment variables are not used in Phase 1 and contain empty values in `.env.example`.)*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Available Scripts

- `npm run dev`: Runs the local development server with Turbopack.
- `npm run build`: Compiles and builds the production application.
- `npm run lint`: Runs ESLint checks.
- `npm run typecheck`: Runs TypeScript compiler verification (`tsc --noEmit`).
- `npm run start`: Starts the built production application.
