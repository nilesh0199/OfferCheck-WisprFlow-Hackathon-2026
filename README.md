# OfferCheck

> **"Understand the offer. Know what to verify."**

OfferCheck is an internship-offer review assistant designed to help students evaluate internship communications, identify questionable requests (such as upfront payment demands or equipment fees), spot missing employment terms, and prepare concrete verification questions before paying money or sharing personal documents.

OfferCheck is built as a solo submission for **No Hands: The Wispr Challenge** (Builders track).

---

## What OfferCheck Is and Is Not

- **What it is:** A text-review tool that analyzes the specific wording in an offer, highlights explicit items that warrant caution, identifies missing standard terms, and suggests clarification questions.
- **What it is NOT:** It is not a scam detector, company authentication service, legal advisor, or safety guarantee. It cannot verify whether a sender legitimately represents a company.

---

## Current Status: Phase 4 (Results UI)

> [!NOTE]
> **Project in progress:** Phases 1 through 4 are complete. The application features a fully functional results UI connected to the server-side Gemini analysis endpoint, rendering findings across four structured sections with verbatim quotation highlights and clipboard exports.

Implemented so far:
- **Phase 1 (Shell):** Project documentation, accessible text input, character counter against 8,000 chars, limits disclaimer, and pre-paste redaction notice.
- **Phase 2 (Analysis Contract & Validator):** Zod schemas, deterministic quote validator with Unicode grapheme mapping, overclaiming guardrails, four synthetic test examples, and test plan.
- **Phase 3 (Gemini Endpoint):** Server-side `/api/analyze` route powered by `@google/genai` Interactions API with multi-model fallback chain (`gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.5-flash-lite`), lowest documented thinking levels, 55s shared deadline, 20s per-attempt timeout cap, and zero logging of user text or credentials.
- **Phase 4 (Results UI):** Complete client interface with input panel above the fold, live elapsed timer, request cancellation via AbortController, synthetic sample picker with overwrite confirmation, calm error recovery, four output sections (Potential Concerns, Missing Info, Questions to Verify, Limits), interactive highlighted text viewer, and one-click summary clipboard export.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later (developed and verified on Node v24.12.0)
- npm v10 or later (verified on npm v11.6.2)
- (Optional for live analysis) A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

---

## Getting Started Locally

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key-here"

   # Optional model fallback chain (default: gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite)
   # GEMINI_MODELS="gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite"

   # Optional thinking level override (default: lowest documented level per model: "low" for 3.8, "minimal" for 3.6/3.5)
   # GEMINI_THINKING_LEVEL="low"
   ```
   *(Note: Offline tests run with injected mock clients and do NOT require an API key or network access.)*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Testing

### Running Offline Unit Tests
Run the comprehensive Vitest test suite (includes quote validation, schema parsing, guardrails, synthetic examples, model fallback chain, shared deadline, and mock endpoint execution):
```bash
npm run test
```
*(All 78 unit tests run entirely offline with zero network calls).*

### Running Live Analysis Tests
To run live end-to-end evaluations against the Gemini API using synthetic examples and prompt-injection fixtures:
```bash
npm run test:live
```
*(Loads `.env.local`; if `GEMINI_API_KEY` is not found, it cleanly skips the suite with a clear message and does not fake results).*

### Testing the Analysis Endpoint Locally (Live)
With `npm run dev` running and `GEMINI_API_KEY` set in `.env.local`, you can test the POST endpoint directly:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Congratulations! We offer you an engineering internship at ExampleCo. A refundable equipment deposit of ₹4,500 is required within 24 hours. Contact hr@example.com."}'
```

---

## Available Scripts

- `npm run dev`: Runs the local development server with Turbopack.
- `npm run test`: Executes the 68 offline Vitest tests once.
- `npm run test:live`: Executes the live Gemini evaluation suite (requires `GEMINI_API_KEY`).
- `npm run build`: Compiles and builds the production application.
- `npm run lint`: Runs ESLint checks.
- `npm run typecheck`: Runs TypeScript compiler verification (`tsc --noEmit`).
- `npm run start`: Starts the built production application.
