# Test Plan: OfferCheck

This document tracks all implemented and planned automated tests for OfferCheck across the development phases. Tests marked **Implemented** are currently active in the Vitest test suite (`npm run test`). Tests marked **Planned** will be built during subsequent phases.

---

## Implemented and Planned Tests

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
| `Live model prompt-injection fixture` | Evaluates that real Gemini API output under prompt-injection attacks does not output "verified safe" or suppress concerns | Planned |
| `API failure handling` | Verifies `/api/analyze` handles upstream Gemini API 500 errors, network disconnection, and 503 capacity issues gracefully | Planned |
| `Invalid model output at endpoint` | Tests that `/api/analyze` recovers and returns structured client errors when model produces corrupted or unparseable output | Planned |
| `Research ambiguity` | Verifies behavior when company name is generic, missing, or produces ambiguous search results | Planned |
| `Verification question copy buttons` | Verifies clipboard copying functionality and user feedback state in Results UI | Planned |
| `Mobile layout and responsiveness` | Tests responsive layout, tap targets, and typography down to ~360px viewport | Planned |
| `Long input boundary test` | Tests input text near and at `MAX_INPUT_CHARS` (8000) on both client and server | Planned |
