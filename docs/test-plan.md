# Test Plan: OfferCheck

This document tracks all implemented, live, and planned automated tests for OfferCheck across the development phases.
- **Implemented**: Automated offline unit and integration tests active in Vitest (`npm run test`).
- **Manual / live**: Live test cases in `tests-live/analyze.live.test.ts` executed via `npm run test:live` (requires `GEMINI_API_KEY`). These are defined and ready to execute when an API key is supplied, without claiming they have been run in continuous offline verification.
- **Planned**: Tests scheduled for implementation in subsequent phases.

---

## Test Inventory

| Test Identifier | What It Checks | Status |
| :--- | :--- | :--- |
| `guardrails: flags 'verified safe' assertions` | Verifies phrases asserting "verified safe" are detected and flagged | Implemented |
| `guardrails: flags 'definitely/certainly a scam or fraud'` | Verifies definitive fraud/scam assertions are flagged | Implemented |
| `guardrails: flags 'this is a scam/fraud'` | Verifies categorical scam accusations are flagged | Implemented |
| `guardrails: flags 'guaranteed safe/legitimate'` | Verifies absolute safety or legitimacy guarantees are flagged | Implemented |
| `guardrails: flags numeric likelihood / probability scores` | Verifies numeric percentages (e.g. 85% probability/chance/risk) are flagged | Implemented |
| `guardrails: does NOT flag hedged or objective observations` | Verifies no false positives on objective/hedged phrases like "may not be verified" or "does not prove it is safe" | Implemented |
| `guardrails: checks multiple fields via checkFieldsForOverclaiming` | Verifies that any flagged field in an object causes the multi-field check to flag the violation | Implemented |
| `quote-validator: accepts an exact verbatim match` | Verifies verbatim quote extracts from source text and returns exact start/end offsets | Implemented |
| `quote-validator: accepts a match where whitespace differs` | Verifies match succeeds across multi-space, tab, and newline differences, returning offsets pointing to original text | Implemented |
| `quote-validator: rejects a completely fabricated quote` | Verifies that quotes not present in the input are rejected with descriptive reason | Implemented |
| `quote-validator: rejects when there is a case mismatch` | Verifies case mismatch is rejected without fuzzy normalization | Implemented |
| `quote-validator: rejects empty or whitespace-only quotes` | Verifies empty or whitespace-only quotes are rejected immediately | Implemented |
| `quote-validator: rejects quotes shorter than MIN_QUOTE_CHARS` | Verifies quotes shorter than `MIN_QUOTE_CHARS` (4) are rejected | Implemented |
| `quote-validator: rejects quotes longer than MAX_QUOTE_CHARS` | Verifies quotes exceeding `MAX_QUOTE_CHARS` (300) are rejected | Implemented |
| `quote-validator: returns first occurrence for repeated quotes` | Verifies first occurrence offset is returned when quote appears multiple times | Implemented |
| `quote-validator: precomposed vs decomposed Unicode & vice versa` | Verifies precomposed quote matches decomposed source text and decomposed quote matches precomposed source text | Implemented |
| `quote-validator: asserts start/end offsets slice into original text` | Verifies slicing `sourceText.slice(start, end)` gives the exact original characters that matched | Implemented |
| `quote-validator: preserves offsets after whitespace, emoji, and Devanagari` | Verifies offsets stay correct after earlier whitespace runs, newlines, tabs, and non-ASCII characters (emoji and Devanagari) | Implemented |
| `quote-validator: rejects quote differing by only one character` | Verifies a fabricated quote differing by only one letter or digit is rejected | Implemented |
| `parse-model-output: successfully parses valid object input` | Verifies compliant raw model output is parsed to typed ModelOutput | Implemented |
| `parse-model-output: successfully parses valid JSON string input` | Verifies stringified JSON model output is safely parsed without errors | Implemented |
| `parse-model-output: safely handles null and undefined` | Verifies null and undefined inputs return `ok: false` without throwing | Implemented |
| `parse-model-output: safely handles invalid JSON strings` | Verifies malformed JSON returns `ok: false` without throwing | Implemented |
| `parse-model-output: safely handles wrong types` | Verifies numbers, booleans, arrays return `ok: false` without throwing | Implemented |
| `parse-model-output: safely handles missing required fields` | Verifies schema validation fails if required arrays or fields are missing | Implemented |
| `parse-model-output: safely handles invalid enum values in concerns` | Verifies unlisted category enum values are caught by schema validation | Implemented |
| `parse-model-output: tolerates extra unknown fields` | Verifies extraneous fields from LLMs are tolerated without crashing | Implemented |
| `parse-model-output: rejects over-length arrays exceeding max 10` | Verifies arrays exceeding 10 items fail schema validation | Implemented |
| `validate-analysis: drops concerns with fabricated quotes` | Verifies concerns with unverified quotes are dropped and increment `droppedCount` | Implemented |
| `validate-analysis: drops items that trip overclaiming guardrails` | Verifies findings tripping overclaiming guardrails are dropped and counted | Implemented |
| `validate-analysis: removes only invalid relatedQuote from missingInfo` | Verifies invalid `relatedQuote` in missingInfo is stripped while retaining the missingInfo item | Implemented |
| `validate-analysis: clears relatedConcernId for dropped concerns` | Verifies question `relatedConcernId` is cleared if the target concern was dropped | Implemented |
| `validate-analysis: always attaches immutable review limits` | Verifies immutable `REVIEW_LIMITS` strings are always attached to the output | Implemented |
| `validate-analysis: validates Example 1 (Urgent payment request)` | Verifies mock output for payment urgency passes with `droppedCount = 0` | Implemented |
| `validate-analysis: validates Example 2 (Incomplete offer)` | Verifies mock output for incomplete offer passes with `droppedCount = 0` | Implemented |
| `validate-analysis: validates Example 3 (Detailed offer)` | Verifies mock output for detailed offer passes with `droppedCount = 0` | Implemented |
| `validate-analysis: validates Example 4 (Ambiguous offer)` | Verifies mock output for ambiguous offer passes with `droppedCount = 0` | Implemented |
| `examples: contains exactly four examples` | Verifies exactly four synthetic examples exist | Implemented |
| `examples: has unique IDs for every example` | Verifies all synthetic examples have distinct IDs | Implemented |
| `examples: all examples are labelled 'Synthetic example'` | Verifies every example has label "Synthetic example" | Implemented |
| `examples: all examples are under MAX_INPUT_CHARS` | Verifies all examples are under `MAX_INPUT_CHARS` (8000) and non-trivial | Implemented |
| `examples: all email addresses use reserved example.* domains` | Verifies all email addresses use reserved `example.com`, `example.org`, or `example.net` domains | Implemented |
| `examples: Example 3 contains NO payment-request words` | Verifies Example 3 contains NO payment-request words ("deposit", "fee", "pay", etc.) | Implemented |
| `fixtures: prompt injection fixture storage & length` | Verifies injection fixture is stored, under `MAX_INPUT_CHARS`, and contains override pattern | Implemented |
| `fixtures: ensures mock claiming 'verified safe' is dropped` | Verifies mock output generated from injection attempt is dropped by guardrails | Implemented |
| `gemini-wrapper: cleanJsonSchemaForGemini removes unsupported keywords` | Verifies `$schema`, `minLength`, `maxLength`, and `pattern` are stripped from JSON schema | Implemented |
| `gemini-wrapper: GEMINI_RESPONSE_SCHEMA is valid without $schema` | Verifies exported schema has no `$schema` keyword | Implemented |
| `gemini-wrapper: returns EMPTY_INPUT on empty/whitespace text` | Verifies empty/whitespace inputs return `EMPTY_INPUT` (422) without calling model | Implemented |
| `gemini-wrapper: returns TOO_SHORT under 40 chars` | Verifies input under 40 characters returns `TOO_SHORT` (422) without calling model | Implemented |
| `gemini-wrapper: returns TOO_LONG over 8000 chars` | Verifies input over 8,000 characters returns `TOO_LONG` (413) without calling model | Implemented |
| `gemini-wrapper: returns NOT_CONFIGURED on missing API key` | Verifies missing `GEMINI_API_KEY` returns `NOT_CONFIGURED` (500) | Implemented |
| `gemini-wrapper: returns RATE_LIMITED on 429` | Verifies upstream 429 / RESOURCE_EXHAUSTED maps to `RATE_LIMITED` (429) | Implemented |
| `gemini-wrapper: returns TIMEOUT on abort / timeout` | Verifies request timeout maps to `TIMEOUT` (504) | Implemented |
| `gemini-wrapper: returns UPSTREAM_ERROR on generic upstream failure` | Verifies network / server errors map to `UPSTREAM_ERROR` (502) | Implemented |
| `gemini-wrapper: a second invalid model response produces INVALID_MODEL_OUTPUT after exactly 2 attempts and not more` | Verifies model call is retried once on unparseable output, returning `INVALID_MODEL_OUTPUT` after exactly 2 attempts and not more | Implemented |
| `gemini-wrapper: retries once on invalid output and succeeds if attempt 2 returns valid JSON` | Verifies recovery when second attempt produces valid structured JSON | Implemented |
| `gemini-wrapper: runs validateAnalysis and returns structured validated analysis on valid model output` | Verifies end-to-end processing with quote validation on valid response | Implemented |
| `gemini-wrapper: a concern with a fabricated quote is dropped and droppedCount increments through analyzeOfferText` | Verifies hallucinated quotes are dropped and increment `droppedCount` when run through `analyzeOfferText` | Implemented |
| `gemini-wrapper: console spies prove no logged call ever contains the offer text, even when the model call fails` | Verifies console spies prove no logged call ever contains offer text or secrets on error or success | Implemented |
| `gemini-wrapper: wraps prompt injection content in delimiters without altering system instructions` | Verifies untrusted text is enclosed in delimiters and does not alter system prompt | Implemented |
| `api-route: returns 405 Method Not Allowed for non-POST HTTP methods` | Verifies GET, PUT, DELETE, PATCH return 405 with `Allow: POST` and `Cache-Control: no-store` | Implemented |
| `api-route: returns 413 when Content-Length header exceeds 40 KB` | Verifies oversized payloads rejected early by Content-Length header | Implemented |
| `api-route: returns 413 when body length exceeds 40 KB` | Verifies oversized raw body text rejected before parsing | Implemented |
| `api-route: returns 400 when body is not valid JSON` | Verifies unparseable JSON returns 400 Bad Request | Implemented |
| `api-route: returns 400 when 'text' field is missing from request body` | Verifies missing "text" property returns 400 Bad Request | Implemented |
| `api-route: the route returns 400 for a non-string text field` | Verifies non-string "text" property (numbers, booleans, arrays) returns 400 Bad Request | Implemented |
| `api-route: returns 200 with { ok: true, analysis } on successful analysis` | Verifies valid POST returns 200 with `{ ok: true, analysis }` and `Cache-Control: no-store` | Implemented |
| `api-route: maps wrapper error codes to appropriate status codes and error shape` | Verifies downstream error status codes and error payload shape | Implemented |
| `live-analysis: evaluates Synthetic Example 1 (Urgent payment request) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates Synthetic Example 2 (Incomplete offer) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates Synthetic Example 3 (Detailed offer) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates Synthetic Example 4 (Ambiguous offer) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates prompt-injection fixture against Gemini API` | Live execution asserting prompt injection does not suppress concerns or trip guardrails | Manual / live |
| `Research ambiguity` | Verifies behavior when company name is generic, missing, or produces ambiguous search results | Planned |
| `Verification question copy buttons` | Verifies clipboard copying functionality and user feedback state in Results UI | Planned |
| `Mobile layout and responsiveness` | Tests responsive layout, tap targets, and typography down to ~360px viewport | Planned |

---

## Test Execution Summary

- **Total Implemented Automated Tests (Offline)**: 68 tests across 7 test files in `tests/`.
- **Manual / Live Tests**: 5 sequential live test cases in `tests-live/analyze.live.test.ts` (run via `npm run test:live`).
- **Offline Test Command**: `npm run test` (fast, deterministic, zero external network dependency).
- **Live Test Command**: `npm run test:live` (loads `.env.local`; skips cleanly if `GEMINI_API_KEY` is not present; does not fake results).
