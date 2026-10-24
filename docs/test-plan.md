# Test Plan: OfferClara

This document tracks all implemented, live, and planned automated tests for OfferClara across the development phases.
- **Implemented**: Automated offline unit and integration tests active in Vitest (`npm test` — **477 tests passing across 49 test files as of 24 Oct 2026**).
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
| `gemini-wrapper: parseModelChain returns default chain when env vars unset` | Verifies `DEFAULT_MODEL_CHAIN` is returned when `GEMINI_MODELS` and `GEMINI_MODEL` are undefined | Implemented |
| `gemini-wrapper: parseModelChain parses comma-separated GEMINI_MODELS capped at 3` | Verifies comma-separated chain is parsed, trimmed, empty items dropped, and capped at 3 | Implemented |
| `gemini-wrapper: parseModelChain falls back to legacy GEMINI_MODEL` | Verifies legacy single-model env var is parsed as a single-item array | Implemented |
| `gemini-wrapper: resolveThinkingLevel resolves lowest documented level per model` | Verifies default thinking level is "low" for 3.8-flash and "minimal" for 3.6-flash and 3.5-flash-lite | Implemented |
| `gemini-wrapper: resolveThinkingLevel applies override only when supported` | Verifies `GEMINI_THINKING_LEVEL` override is validated against model allowed specs; unlisted models return undefined | Implemented |
| `gemini-wrapper: returns EMPTY_INPUT on empty/whitespace text` | Verifies empty/whitespace inputs return `EMPTY_INPUT` (422) without calling model | Implemented |
| `gemini-wrapper: returns TOO_SHORT under 40 chars` | Verifies input under 40 characters returns `TOO_SHORT` (422) without calling model | Implemented |
| `gemini-wrapper: returns TOO_LONG over 8000 chars` | Verifies input over 8,000 characters returns `TOO_LONG` (413) without calling model | Implemented |
| `gemini-wrapper: returns NOT_CONFIGURED on missing API key` | Verifies missing `GEMINI_API_KEY` returns `NOT_CONFIGURED` (500) | Implemented |
| `gemini-wrapper: 400/401/403 fails immediately with no fallback and exactly one call` | Verifies non-retryable configuration errors (400, 401, 403) fail immediately without fallback calls | Implemented |
| `gemini-wrapper: primary 429 -> secondary used and modelUsed reported` | Verifies rate-limited primary model falls back to secondary model and reports `modelUsed` | Implemented |
| `gemini-wrapper: primary 503 overloaded -> falls back to next model` | Verifies 503 overloaded primary model falls back to secondary model | Implemented |
| `gemini-wrapper: primary timeout -> falls back to next model within deadline` | Verifies timeout on primary falls back to secondary without retrying the same model | Implemented |
| `gemini-wrapper: all three fail with 429 -> returns RATE_LIMITED after exactly 3 attempts` | Verifies when all models in chain fail with 429, returns `RATE_LIMITED` after exactly 3 attempts | Implemented |
| `gemini-wrapper: invalid output on the first model -> valid output on the next model succeeds` | Verifies unparseable model response triggers fallback to next model | Implemented |
| `gemini-wrapper: never makes more than 3 attempts even if chain has more models` | Verifies maximum attempt budget is strictly capped at 3 | Implemented |
| `gemini-wrapper: shared deadline stops further attempts when little time remains` | Verifies remaining deadline under threshold skips further attempts and returns `TIMEOUT` | Implemented |
| `gemini-wrapper: passes correct thinking_level and max_output_tokens in generation_config` | Verifies `generation_config` contains resolved `thinking_level` and `max_output_tokens = 2500` | Implemented |
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
| `api-route: route response never contains model names or attempts list in success or error bodies` | Verifies HTTP route response never leaks internal model names or attempts list | Implemented |
| `labels: covers every concern category in ConcernCategoryEnum` | Verifies that all concern categories in the schema have non-empty human-readable labels | Implemented |
| `labels: covers every topic in MissingInfoTopicEnum` | Verifies that all missing info topics in the schema have non-empty human-readable labels | Implemented |
| `labels: getConcernCategoryLabel returns mapped label or fallback` | Verifies category label lookup returns mapped name and falls back gracefully for unknown values | Implemented |
| `labels: getMissingInfoTopicLabel returns mapped label or fallback` | Verifies topic label lookup returns mapped name and falls back gracefully for unknown values | Implemented |
| `api-response: recognizes a valid success response` | Verifies valid success shape { ok: true, analysis } passes type guard | Implemented |
| `api-response: recognizes a valid error response` | Verifies valid error shape { ok: false, error: { code, message } } passes type guard | Implemented |
| `api-response: validates zero-concern valid analysis` | Verifies analysis with empty concerns passes defensive schema check | Implemented |
| `api-response: rejects non-object and null values` | Verifies null, undefined, strings, numbers, arrays fail response type guards | Implemented |
| `api-response: rejects malformed success responses` | Verifies missing fields, malformed spans, negative dropped counts fail type guards | Implemented |
| `api-response: rejects malformed error responses` | Verifies missing error object, empty code, or non-string message fail type guards | Implemented |
| `highlights: returns empty array for empty or non-string text` | Verifies buildHighlightSegments returns [] on empty or invalid text | Implemented |
| `highlights: returns single unhighlighted segment when spans array is empty` | Verifies text with no spans returns a single unhighlighted segment preserving text | Implemented |
| `highlights: handles a single span in the middle of text` | Verifies single quotation span splits text into before, highlighted, and after segments | Implemented |
| `highlights: handles a span spanning the entire text` | Verifies full-string span produces a single highlighted segment | Implemented |
| `highlights: handles adjacent spans cleanly` | Verifies touching spans without gap are segmented into distinct highlighted chunks | Implemented |
| `highlights: handles overlapping spans and retains matching concernIds` | Verifies overlapping spans split into non-overlapping segments with composite concern IDs | Implemented |
| `highlights: clamps out-of-range spans and ignores invalid/reversed spans` | Verifies negative starts clamped to 0, over-length ends clamped to text length, reversed spans ignored | Implemented |
| `highlights: preserves exact character offsets with emoji and Devanagari text before spans` | Verifies multi-byte UTF-16 character offsets correctly slice matching text | Implemented |
| `highlights: handles out-of-order spans and sorts them` | Verifies unordered input spans are processed in ascending offset order | Implemented |
| `summary: contains the disclaimer and title` | Verifies generated summary contains 'OfferClara Review Summary' and the exact standard disclaimer | Implemented |
| `summary: contains quotes copied exactly character-for-character` | Verifies concern quotes and observations appear character-for-character in the summary | Implemented |
| `summary: contains missing information and verification questions` | Verifies missing info topics and numbered verification questions appear in summary | Implemented |
| `summary: contains limits and note on dropped unverified items` | Verifies review limits and dropped item warnings appear in the plain-text summary | Implemented |
| `summary: contains NO model names, attempt logs, or verdict words` | Verifies summary text never leaks model identifiers, attempt logs, or verdict terms | Implemented |
| `summary: handles zero concerns calmly without declaring safety` | Verifies zero-concern analysis produces calm disclaimer without proclaiming safety | Implemented |
| `sentence-case: capitalises first letter of lower-case string` | Verifies leading lowercase letter is converted to uppercase | Implemented |
| `sentence-case: preserves already capitalised string` | Verifies already capitalised string remains unchanged | Implemented |
| `sentence-case: preserves leading whitespace before capitalising` | Verifies leading spaces or indents are preserved while first non-whitespace character is capitalised | Implemented |
| `sentence-case: safely handles empty and whitespace-only strings` | Verifies empty strings, null values, or whitespace-only strings return safely without crash | Implemented |
| `sentence-case: leaves strings starting with numbers or symbols unchanged` | Verifies strings starting with digits, quotes, or symbols remain intact | Implemented |
| `sentence-case: handles non-Latin Unicode characters properly` | Verifies accented and non-Latin characters (e.g. umlauts) are correctly uppercase-converted | Implemented |
| `validate-analysis: case (a) 'as soon as possible.' (payment_urgency) nested in a longer sensitive_information_request quote is still dropped` | Verifies non-payment nested quotes are dropped without incrementing droppedCount | Implemented |
| `validate-analysis: case (b) a short refundable_deposit quote nested in a longer 'other' quote is KEPT, both appear, droppedCount unchanged` | Verifies refundable_deposit and upfront_payment are exempt from nested drop and kept alongside enclosing quote | Implemented |
| `validate-analysis: case (c) exact duplicates still collapse to one` | Verifies identical quote spans are deduplicated without incrementing droppedCount | Implemented |
| `validate-analysis: case (d) overlapping-but-not-nested spans keeps both` | Verifies spans that overlap partially but are not contained keep both concerns | Implemented |
| `summary: contains self-checks and selected official resources with conditional reason lines` | Verifies summary text includes self-check actions, official resources, and conditional reason lines | Implemented |
| `priorities: sorts concerns according to specified category priority` | Verifies category priority order: upfront_payment, refundable_deposit, payment_urgency, sensitive_information_request, off_platform_communication, other | Implemented |
| `priorities: maintains stable original order for multiple concerns within the same category` | Verifies stable sort preserving original model order within each category | Implemented |
| `priorities: handles empty arrays cleanly` | Verifies empty array handling returns empty array | Implemented |
| `resources: always includes cybercrime and mca for empty text and empty categories with no matchedTerm` | Verifies default inclusion of cybercrime and mca resources with matchedTerm undefined | Implemented |
| `resources: flags cybercrime as expanded when upfront_payment category is present` | Verifies expanded=true on upfront payment concern | Implemented |
| `resources: flags cybercrime as expanded when refundable_deposit category is present` | Verifies expanded=true on refundable deposit concern | Implemented |
| `resources: flags cybercrime as expanded when payment_urgency category is present` | Verifies expanded=true on payment urgency concern | Implemented |
| `resources: flags cybercrime as expanded when sensitive_information_request is present` | Verifies expanded=true on sensitive document request concern | Implemented |
| `resources: leaves cybercrime non-expanded for other or off_platform_communication categories` | Verifies expanded=false when no financial/sensitive categories are present | Implemented |
| `resources: includes aicte when text contains word AICTE and populates matchedTerm` | Verifies AICTE resource inclusion on word match with matchedTerm | Implemented |
| `resources: does not include aicte for partial word matches like 'Aicted'` | Verifies word-boundary enforcement for AICTE regex | Implemented |
| `resources: includes ncs when text contains word NCS or National Career Service and populates matchedTerm` | Verifies NCS resource inclusion on acronym or full name match with matchedTerm | Implemented |
| `resources: selects NCS card with matchedTerm 'NCS' when text is 'NCS Group offers a role'` | Verifies match on substring like 'NCS Group' populates matchedTerm 'NCS' | Implemented |
| `resources: does not include ncs for partial word matches like 'NCSU'` | Verifies word-boundary enforcement for NCS regex | Implemented |
| `resources: returns stable order [cybercrime, aicte, ncs, mca] when all are triggered with matchedTerm for conditional cards` | Verifies stable resource list ordering and matchedTerm population | Implemented |
| `self-checks: contains exactly six static self-checks` | Verifies static existence of all 6 self-check items | Implemented |
| `self-checks: returns default order [1, 2, 3, 4, 5, 6] when no categories are provided` | Verifies default ordering of self-checks | Implemented |
| `self-checks: prioritizes check 4 (pause_before_paying) first when upfront_payment is present` | Verifies payment category prioritization of check 4 | Implemented |
| `self-checks: prioritizes check 4 (pause_before_paying) first when refundable_deposit is present` | Verifies deposit category prioritization of check 4 | Implemented |
| `self-checks: prioritizes check 4 (pause_before_paying) first when payment_urgency is present` | Verifies urgency category prioritization of check 4 | Implemented |
| `self-checks: prioritizes check 5 (pause_before_sharing_docs) first when sensitive_information_request is present` | Verifies sensitive document category prioritization of check 5 | Implemented |
| `self-checks: prioritizes checks 2 and 3 first when off_platform_communication is present` | Verifies off-platform category prioritization of checks 2 and 3 | Implemented |
| `self-checks: handles payment and sensitive categories simultaneously without duplicating items` | Verifies combined category prioritization with no duplicate items | Implemented |
| `self-checks: returns default order for 'other' category` | Verifies fallback to default order on other categories | Implemented |
| `rate-limit: anonymizes client IP using SHA-256 and salt; raw IP never appears in result` | Verifies SHA-256 hashing with salt on x-forwarded-for, x-real-ip, and local fallback | Implemented |
| `rate-limit: different salts generate different hashes for the same IP` | Verifies unique per-process salts prevent rainbow table lookups | Implemented |
| `rate-limit: enforces sliding window limit (default 8 per 15 minutes)` | Verifies 8 allowed in 15m window and 9th rejected with Retry-After math | Implemented |
| `rate-limit: enforces daily cap (default 30 per 24 hours)` | Verifies daily limit enforcement and DayExceeded reason | Implemented |
| `rate-limit: evicts oldest entries when capacity limit is reached` | Verifies memory protection and eviction down to capacity | Implemented |
| `rate-limit: returns 429 with Retry-After header and RATE_LIMITED_CLIENT body from route` | Verifies route returns 429, Retry-After header, and calm client error message | Implemented |
| `rate-limit: validation failures do NOT consume rate limit allowance` | Verifies empty/short/long inputs fail before rate limit consumption | Implemented |
| `model-health: puts model on cooldown for 5 minutes after TIMEOUT` | Verifies 5-minute cooldown on timeout failure | Implemented |
| `model-health: puts model on cooldown for 15 minutes after RATE_LIMITED (429)` | Verifies 15-minute cooldown on 429 rate limit failure | Implemented |
| `model-health: puts model on cooldown for 1 minute after 5xx server error` | Verifies 1-minute cooldown on upstream 5xx server error | Implemented |
| `model-health: recordSuccess immediately clears cooldown for that model` | Verifies successful analysis clears active cooldown | Implemented |
| `model-health: skips cooled-down models when filtering` | Verifies filtering omits models on cooldown | Implemented |
| `model-health: never fails closed: if ALL models are on cooldown, tries all models normally` | Verifies fallback when all models are on cooldown to try all models | Implemented |
| `model-health: skipped model does not count toward MAX_MODEL_ATTEMPTS in analyzeOfferText` | Verifies skipped cooled-down models do not consume attempts | Implemented |
| `concurrency: permits acquisitions up to configured limit, then blocks further acquisitions` | Verifies concurrency guard bounds active tasks to 4 | Implemented |
| `concurrency: release is idempotent and never drops below zero` | Verifies safe decrementing and floor at zero | Implemented |
| `concurrency: route returns 503 with BUSY when concurrency limit is exceeded` | Verifies HTTP 503 response with BUSY code when saturated | Implemented |
| `concurrency: always decrements concurrency slot in finally block even when analyzeOfferText throws` | Verifies guaranteed release in finally block | Implemented |
| `input-hygiene: accepts clean plain text with standard length` | Verifies clean text passes hygiene check | Implemented |
| `input-hygiene: accepts text with standard whitespace characters (tabs, newlines)` | Verifies tabs and newlines are permitted | Implemented |
| `input-hygiene: rejects text containing NUL characters with 422 INVALID_CHARACTERS` | Verifies NUL character detection and 422 rejection | Implemented |
| `input-hygiene: rejects text with >30% non-printable control characters with 422 INVALID_CHARACTERS` | Verifies control character ratio enforcement | Implemented |
| `input-hygiene: rejects empty or whitespace-only input with 422 EMPTY_INPUT` | Verifies empty input rejection | Implemented |
| `input-hygiene: rejects text shorter than MIN_INPUT_CHARS (40) with 422 TOO_SHORT` | Verifies minimum input length check | Implemented |
| `input-hygiene: rejects text longer than MAX_INPUT_CHARS (8000) with 413 TOO_LONG` | Verifies maximum character limit check | Implemented |
| `input-hygiene: does NOT normalise CRLF to LF if doing so would alter character offsets` | Verifies CRLF strings are preserved to protect quotation offsets | Implemented |
| `cancellation: passes an AbortSignal to client.interactions.create options` | Verifies AbortSignal is supplied to @google/genai options | Implemented |
| `cancellation: aborts the AbortSignal when the per-attempt timeout fires` | Verifies signal abort event fires on timeout | Implemented |
| `cancellation: a completed attempt clears the timeout handle and does not leave a pending timer` | Verifies clearTimeout runs on completion | Implemented |
| `logging-audit: finds source files in src directory` | Verifies audit scanner finds source files | Implemented |
| `logging-audit: no source file in src/ contains console.log` | Verifies absence of console.log across src/ | Implemented |
| `logging-audit: no console.* call in src/ logs sensitive variables (text, body, analysis, apiKey, ip)` | Verifies absence of sensitive variable logging | Implemented |
| `logging-audit: the only allowed logging call in src/ is logSafeAttemptError in gemini.ts` | Verifies single audited metadata logging function | Implemented |
| `live-analysis: evaluates Synthetic Example 1 (Urgent payment request) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates Synthetic Example 2 (Incomplete offer) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates Synthetic Example 3 (Detailed offer) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates Synthetic Example 4 (Ambiguous offer) via Gemini Interactions API` | Live execution asserting verified quotes, no overclaiming, and source offset slice match | Manual / live |
| `live-analysis: evaluates prompt-injection fixture against Gemini API` | Live execution asserting prompt injection does not suppress concerns or trip guardrails | Manual / live |
| `UI: Sample picker loads synthetic offer into textarea` | Manual check that selecting a sample and clicking 'Load example' populates the textarea | Manual |
| `UI: Sample picker shows synthetic offer badge` | Manual check that badge 'Synthetic example, not a real offer' appears when textarea matches sample | Manual |
| `UI: Inline confirmation on custom text replacement` | Manual check that 'Replace your text?' confirmation appears before overwriting custom text | Manual |
| `UI: Loading state shows elapsed timer and cancel button` | Manual check that timer ticks, button shows 'Analyzing...', and cancel button aborts | Manual |
| `UI: Outdated banner appears after editing analyzed text` | Manual check that banner appears when user edits textarea after a review | Manual |
| `UI: Show in text scrolls to highlight` | Manual check that clicking 'Show in text' scrolls text viewer and emphasizes highlight | Manual |
| `UI: Copy buttons provide user feedback` | Manual check that clicking copy buttons shows 'Copied' feedback (no exclamation marks) | Manual |
| `UI: Mobile responsiveness at 360px` | Manual check that page exhibits no horizontal scroll and tap targets >= 44px at 360px width | Manual |
| `UI: Keyboard-only navigation` | Manual check that all interactive controls are reachable and operable via Tab/Shift+Tab and Enter/Space | Manual |
| `UI: Visible focus indicators` | Manual check that visible 2px focus ring appears on focused interactive elements, suppressed on programmatic headings | Manual |
| `UI: Screen reader live announcements` | Manual check that aria-live polite regions announce loading time, cancel, and clipboard copy operations | Manual |
| `UI: Tap target accessibility` | Manual check that buttons and interactive tap targets meet or exceed ~44px minimum touch height | Manual |
| `UI: Motion sensitivity compliance` | Manual check that prefers-reduced-motion media query suppresses animations and transitions | Manual |
| `UI: Theme contrast verification` | Manual check that light and dark themes (prefers-color-scheme: dark) both maintain high readability and WCAG contrast | Manual |
| `UI: Responsive viewport testing (360px, 768px, 1280px)` | Manual check verifying no horizontal overflow and proper column stacking/side-by-side transition | Manual |
| `UI: Check these yourself ordering` | Manual check that self-checks reorder based on concern category relevance (payment/sensitive/off-platform) | Manual |
| `UI: Official resources collapsible state` | Manual check that cybercrime card is open by default on payment/sensitive concerns, and closed otherwise | Manual |
| `UI: External link attributes` | Manual check that official links open in a new tab with rel="noopener noreferrer" and visible helper text | Manual |
| `UI: Resource contact copy feedback` | Manual check that clicking Copy on helpline or email announces copy state via aria-live | Manual |
| `features: reflects today's live capabilities truthfully` | Verifies textAnalysis and officialResources are enabled while future features are disabled | Implemented |
| `features: disables future features so the landing page cannot advertise what does not exist` | Verifies documentUpload and companyResearch are false | Implemented |
| `features: isFeatureEnabled returns expected boolean for valid flags` | Verifies pure helper function evaluates all feature flags correctly | Implemented |
| `landing-annotations: ensures every defined annotation phrase exists exactly in synthetic Example 1` | Verifies all landing demo annotations match exact text in Example 1 | Implemented |
| `landing-annotations: finds all annotations with accurate, verifiable character offsets in Example 1` | Verifies character slice offsets match verbatim phrases in Example 1 | Implemented |
| `landing-annotations: ensures annotations are non-overlapping and sorted chronologically by start offset` | Verifies annotation ordering and lack of overlap for document card | Implemented |
| `landing-annotations: guarantees text segmentation invariant: segments joined exactly equal source text` | Verifies pure segmentation function preserves complete text fidelity | Implemented |
| `landing-annotations: handles empty or missing input gracefully` | Verifies pure annotation functions handle empty text safely | Implemented |
| `session-reducer: initializes with empty, idle state` | Verifies default state for ephemeral tab session | Implemented |
| `session-reducer: updates offerText on SET_OFFER_TEXT` | Verifies offerText state transition | Implemented |
| `session-reducer: handles START_ANALYSIS by setting loading and resetting timers/errors` | Verifies start analysis transition resets timers and error state | Implemented |
| `session-reducer: updates elapsed seconds via TICK_ELAPSED` | Verifies timer ticker updates elapsed seconds | Implemented |
| `session-reducer: transitions to success and records analysis result on ANALYSIS_SUCCESS` | Verifies success transition stores analysis and snapshot text | Implemented |
| `session-reducer: transitions to error on ANALYSIS_ERROR` | Verifies error dispatch sets error type and message | Implemented |
| `session-reducer: handles CANCEL_ANALYSIS with CANCELLED error type` | Verifies user cancellation transitions to CANCELLED state | Implemented |
| `session-reducer: resets to initial state on CLEAR_SESSION` | Verifies full state reset on clear | Implemented |
| `research-extract: extracts multiple emails and domains with lowercasing and deduplication` | Verifies conservative email regex and lowercased deduplicated domain extraction | Implemented |
| `research-extract: extracts multiple distinct domains in order of first appearance` | Verifies domain ordering and deduplication | Implemented |
| `research-extract: extracts URLs starting with http, https, and www., trimming trailing punctuation` | Verifies URL regex and punctuation stripping (periods, commas, etc.) | Implemented |
| `research-extract: correctly trims URLs wrapped in parentheses` | Verifies prose parentheses around URLs are trimmed cleanly | Implemented |
| `research-extract: handles internal parentheses in URLs without mangling` | Verifies Wikipedia style URLs with balanced parens are preserved | Implemented |
| `research-extract: deduplicates identical URLs regardless of case` | Verifies case-insensitive URL deduplication | Implemented |
| `research-extract: returns empty arrays when text contains no emails or URLs` | Verifies empty array handling on non-contact text | Implemented |
| `research-extract: handles empty or non-string text safely` | Verifies defensive non-string handling | Implemented |
| `research-extract: isFreeEmailDomain identifies all documented free webmail domains` | Verifies detection of gmail, yahoo, outlook, hotmail, proton, icloud, rediffmail | Implemented |
| `research-extract: isFreeEmailDomain returns false for corporate domains` | Verifies corporate domains like example.com are not classified as free email | Implemented |
| `research-extract: isFreeEmailDomain handles empty or whitespace values safely` | Verifies defensive handling for empty/null domains | Implemented |
| `validate-analysis: keeps entities that occur in source text` | Verifies companyName and roleTitle substrings are retained | Implemented |
| `validate-analysis: matches entities case-insensitively with collapsed whitespace` | Verifies case and whitespace normalization for entity matching | Implemented |
| `validate-analysis: sets entity to null if it does not occur in source text` | Verifies hallucinated/unfound entities are normalized to null | Implemented |
| `validate-analysis: sets entity to null when input is explicitly null` | Verifies null entity passthrough | Implemented |
| `validate-analysis: sets entity to null if length exceeds 100 characters` | Verifies entity max length threshold | Implemented |
| `validate-analysis: preserves backward compatibility when entities object is omitted` | Verifies analysis functions without entities object | Implemented |
| `summary: includes company name and role title when entities are present` | Verifies plain-text export summary formats entities when present | Implemented |
| `research-prompt: sanitizeField converts null, undefined, and whitespace to Not provided` | Verifies default placeholder generation | Implemented |
| `research-prompt: sanitizeField strips control characters and line breaks` | Verifies control character and newline suppression | Implemented |
| `research-prompt: sanitizeField cuts field to max length and trims remaining string` | Verifies character truncation limits per field | Implemented |
| `research-prompt: configures short mode with 300 words and smaller caps` | Verifies short prompt limit substitution | Implemented |
| `research-prompt: configures detailed mode with 600 words and expanded caps` | Verifies detailed prompt limit substitution | Implemented |
| `research-prompt: replaces missing or blank fields with Not provided` | Verifies placeholder substitution inside template | Implemented |
| `research-prompt: strips line breaks from malicious inputs and preserves RULES structure` | Verifies prompt injection cannot break out of data block | Implemented |
| `research-prompt: enforces maximum field lengths` | Verifies field-specific length caps (name: 100, website: 200, domain: 100, role: 100, location: 100) | Implemented |
| `research-prompt: is structurally impossible to include the full offer text` | Verifies type and function accept only confirmed entity fields | Implemented |
| `research-prompt: never contains verdict assertions outside of negative instruction` | Verifies safe/legitimate/scam only exist in prohibition line | Implemented |
| `UI: Landing page CTA visible above fold` | Manual check that CTA is visible above fold at 1366x768 and 390x844 | Manual |
| `UI: Interactive document tilt & reduced-motion fallback` | Manual check that 3D tilt tracks pointer and smoothly turns off on touch / reduced motion | Manual |
| `UI: In-memory session survives client-side navigation` | Manual check that entered text and results persist between / and /check without storage | Manual |
| `UI: Research card collapse state under empty state and open state in results` | Manual check that card renders collapsed before analysis and open after Section C | Manual |
| `UI: Research prompt copy feedback and clipboard fallback` | Manual check that Copy button announces copied state and falls back to selectable textarea | Manual |
| `UI: Open Perplexity link attributes` | Manual check that Perplexity link opens in new tab with rel=noopener noreferrer | Manual |
| `UI: Claimed website displayed as plain text and never as a clickable link` | Manual check that claimed website is rendered strictly as plain text | Manual |
| `upload-helpers: detects PNG, JPEG, WebP, PDF from magic bytes` | Verifies binary magic header inspection for all allowed image and document types | Implemented |
| `upload-helpers: rejects truncated or spoofed headers cleanly` | Verifies non-throwing null return on truncated or non-matching byte arrays | Implemented |
| `upload-helpers: validates healthy mixed upload set` | Verifies valid sets of images and PDFs pass upload validation | Implemented |
| `upload-helpers: rejects empty file set, >5 files, 0-byte file, unsupported types, >4MB total` | Verifies boundary validation for count, empty file, total bytes, and types | Implemented |
| `upload-helpers: plans image compression downscaling and quality ladder` | Verifies target dimensions max 1600x6000 and quality ladder planning | Implemented |
| `upload-helpers: joinTranscripts inserts [File N of M] headers in order` | Verifies file index sorting and multi-file section formatting | Implemented |
| `upload-helpers: sanitizeTranscript strips NUL/control characters and caps at 40k chars` | Verifies NUL stripping, control character removal, and max transcript truncation | Implemented |
| `transcribe: clean schema and verbatim untrusted data system instructions` | Verifies clean schema without $schema and security instructions against prompt injection | Implemented |
| `transcribe: validates input constraints and checks API key before model calls` | Verifies early rejection of empty sets, >5 files, zero-byte files, and missing key | Implemented |
| `transcribe: transcribes multiple files with ordered headers and extracts text parts` | Verifies multimodal payload construction, Interactions API call, and header formatting | Implemented |
| `transcribe: handles unreadable files with readable flags and calm warnings` | Verifies unreadable file flagging without crashing or failing whole transcript | Implemented |
| `transcribe: flags exceedsInputLimit when transcript length exceeds 8,000 characters` | Verifies length boundary check and review limit warning | Implemented |
| `transcribe: falls back to secondary model on 429` | Verifies rate-limited primary model falls back to secondary model in chain | Implemented |
| `transcribe: aborts immediately on 401/403 with NOT_CONFIGURED without fallback` | Verifies non-retryable auth errors fail immediately | Implemented |
| `api-transcribe: rejects non-POST methods with 405 Method Not Allowed` | Verifies GET, PUT, DELETE, PATCH return 405 with Allow: POST | Implemented |
| `api-transcribe: rejects non-multipart requests with 415 Unsupported Media Type` | Verifies application/json rejected with 415 | Implemented |
| `api-transcribe: rejects payloads over 4 MB with 413 TOTAL_TOO_LARGE` | Verifies early rejection on Content-Length header | Implemented |
| `api-transcribe: rejects spoofed files failing magic-byte inspection with 400` | Verifies binary inspection catches spoofed extensions | Implemented |
| `api-transcribe: enforces separate transcribe rate limiter (429 with Retry-After)` | Verifies isolated sliding-window rate limit without impacting analysis quota | Implemented |
| `api-transcribe: enforces concurrency guard (503 BUSY)` | Verifies server instance concurrency bound | Implemented |
| `api-transcribe: returns 200 with transcript on valid upload` | Verifies end-to-end route success and no-store headers | Implemented |
| `resources: contains exactly the four official verification resources` | Verifies cybercrime, aicte, ncs, and mca are defined with valid fields | Implemented |
| `resources: ensures every resource has HTTPS sourceUrl within allowed government hostnames` | Verifies sourceUrl starts with https:// and host is in allowlist | Implemented |
| `resources: ensures all link action URLs use HTTPS and are strictly within allowed host list` | Verifies action URLs, email formats, and phone numbers are verified | Implemented |
| `resources: exports POST_PAYMENT_STEPS with exactly 4 calm, numbered steps with exact required text` | Verifies post-payment guidance exports 4 numbered steps with calm, verified text | Implemented |
| `resources: ensures user-facing text of /resources, post-payment steps, and FAQ contains none of the forbidden words` | Verifies freeze, dispute, statutory, immediately, and police report are completely absent | Implemented |
| `entrance: computes path where duration never exceeds 3200 ms` | Verifies computed timeline path constraints | Implemented |
| `entrance: at t = 0 nothing is revealed, lens opacity is 0, and done is false` | Verifies initial unrevealed state | Implemented |
| `entrance: guarantees reveal count never decreases as time advances` | Verifies monotonic non-decreasing target reveals | Implemented |
| `entrance: at t >= duration all three targets are revealed, lens opacity is 0, and done is true` | Verifies completed state and lens cleanup | Implemented |
| `entrance: handles zero targets and one target without throwing` | Verifies edge case safety with fewer targets | Implemented |
| `entrance: produces deterministic results for identical inputs` | Verifies purity and determinism of entrance math | Implemented |
| `scene: clamps progress values below 0 and above 1, and handles NaN` | Verifies progress clamping and numerical resilience | Implemented |
| `scene: evaluates correct step boundaries for 3 steps` | Verifies step slice math across progress thresholds | Implemented |
| `scene: guarantees activeStep is monotonic with increasing progress` | Verifies monotonic step advancement | Implemented |
| `scene: handles stepCount = 1 gracefully` | Verifies boundary safety with single step | Implemented |
| `landing-phrases: verifies every phrase in hero entrance and scroll scene is exact substring of Example 1` | Verifies exact textual quotation grounding | Implemented |
| `landing-phrases: verifies no step text contains forbidden verdict words` | Verifies compliance against verdict and alarm words | Implemented |
| `landing-phrases: verifies closing line contains required non-verdict wording` | Verifies closing line presence and disclaimer integrity | Implemented |
| `landing-phrases: verifies landing annotations and scene text contain no unsupported claims about hiring practice` | Verifies standard internship, typically, usually, and legitimate employer are absent from annotations and scene | Implemented |
| `entrance: heroMotionReducer settles into finished state without auto-playing in reduced-motion mode` | Verifies reduced motion initializes settled with button label Play animation | Implemented |
| `entrance: heroMotionReducer safely ignores automatic start in reduced-motion mode` | Verifies automatic playback cannot start when reduced motion is preferred | Implemented |
| `entrance: heroMotionReducer user click triggers playback and completion transitions to Replay animation` | Verifies user-initiated playback runs and finishes in settled state | Implemented |
| `session-reducer: appendTranscript pure function appends with double newline` | Verifies transcript is added below existing text with `\n\n` separator and trims cleanly | Implemented |
| `session-reducer: TRANSCRIBE_SUCCESS stores undo, appends text, clears pending files` | Verifies successful transcription updates offer text, preserves previous text for undo, and clears pending files | Implemented |
| `session-reducer: UNDO_APPEND_TRANSCRIPT reverts offer text to previous state` | Verifies undo restores original offer text and clears undo state | Implemented |
| `session-reducer: SET_OFFER_TEXT clears undoOfferText on manual edit` | Verifies 1-level undo is discarded on subsequent manual typing | Implemented |
| `session-reducer: TRANSCRIBE_ERROR preserves pending files and records error code` | Verifies failed transcription keeps attached files in UI and records reference error code | Implemented |
| `markers: formatSourceMarker produces expected marker strings for image and pdf` | Verifies deterministic source marker labels for screenshots and PDFs | Implemented |
| `markers: isSourceMarkerLine identifies marker lines correctly` | Verifies strict recognition of source marker lines and rejection of partials | Implemented |
| `markers: containsSourceMarkerLine identifies lines within multi-line text` | Verifies multiline text scanning for source marker lines | Implemented |
| `markers: nextSourceNumber returns 1 for empty or starts after highest existing number` | Verifies sequential numbering continuing from existing document text | Implemented |
| `markers: buildAppendBlock appends file items preserving user text byte-for-byte` | Verifies user text is unchanged byte-for-byte with exactly one blank line before appended blocks | Implemented |
| `examples: contains exactly five examples` | Verifies five synthetic examples exist in dataset | Implemented |
| `examples: Example 5 represents a described phone call with synthetic employer name` | Verifies Example 5 has synthetic employer name and fee account | Implemented |
| `validate-analysis: drops concerns or related quotes containing source marker lines` | Verifies prompt injection or markers inside quotes are dropped or stripped | Implemented |
| `validate-analysis: includes 7th review limit for candidate-described accounts` | Verifies 7th immutable limit explaining candidate verbal descriptions | Implemented |
| `validate-analysis: validates mock analysis for Example 5 (phone call account) with zero droppedCount` | Verifies mock output for phone call account passes with droppedCount = 0 | Implemented |
| `gemini-wrapper: model-specific 400 falls through to next model in fallback chain` | Verifies modality/capability 400 errors fall through while syntax 400 aborts immediately | Implemented |
| `resources: MCA action label is 'Open the MCA company or LLP name search'` | Verifies exact verified action button label for MCA lookup | Implemented |
| `resources: all verified URLs from docs/resources-verification.md appear in data` | Verifies runtime resource URLs match verified registry documentation | Implemented |
| `resources: GitHub privacy links point to default branch 'main' and exact doc path` | Verifies repository links use valid branch and file target | Implemented |
| `logging-audit: safe logging in gemini.ts and route.ts never leaks offer text or API keys` | Verifies console spies prove zero text leakage across transcription and analysis | Implemented |
| `theme: parseStoredTheme returns DEFAULT_THEME_PREFERENCE for null, undefined, invalid` | Verifies defensive parsing of stored theme preferences | Implemented |
| `theme: parseStoredTheme parses valid theme preferences correctly` | Verifies light, dark, and system string parsing | Implemented |
| `theme: resolveTheme resolves explicit light and dark regardless of OS setting` | Verifies explicit user theme overrides system mode | Implemented |
| `theme: resolveTheme resolves system preference based on OS dark mode status` | Verifies system preference dynamically mirrors OS color scheme | Implemented |
| `theme: exports standard storage key and default preference` | Verifies THEME_STORAGE_KEY is 'offercheck-theme' and DEFAULT is 'light' | Implemented |
| `research-nudge: returns optional with no reasons for fully documented offer` | Verifies fully confirmed employer and contacts require no nudge | Implemented |
| `research-nudge: recommends research when company name is missing or blank` | Verifies unnamed company triggers research recommendation | Implemented |
| `research-nudge: recommends research when sender uses free email and no website is provided` | Verifies free email domain without website triggers recommendation | Implemented |
| `research-nudge: does not trigger free email reason if a website is also provided` | Verifies presence of website suppresses free email nudge | Implemented |
| `research-nudge: recommends research for an internship missing mentor or reporting contact` | Verifies internship without mentor/reporting manager triggers nudge | Implemented |
| `research-nudge: strict word boundary on intern prevents international or internal matches` | Verifies international business or internal transfers never trigger internship condition | Implemented |
| `research-nudge: accumulates multiple reasons when multiple conditions match` | Verifies compound reasons array generation | Implemented |
| `UI: Hero document entrance animation plays smoothly and finishes <= 3.2s` | Manual check that lens enters, glides, pauses, reveals, and exits cleanly | Manual |
| `UI: Skip triggers immediately complete entrance to end state` | Manual check that pointerdown, keypress, or scroll > 10px skips instantly | Manual |
| `UI: Replay animation ghost button resets and replays entrance` | Manual check that button replays entrance when motion is allowed | Manual |
| `UI: Scroll scene sticky stage on desktop updates steps in order` | Manual check that stage stays pinned on desktop while steps advance smoothly | Manual |
| `UI: Scroll scene switches to stacked cards on mobile and viewports <640px height` | Manual check that no sticky pinning occurs on mobile or short screens | Manual |
| `UI: prefers-reduced-motion disables entrance motion, hides lens/replay, and renders stacked scene` | Manual check verifying immediate settled state when reduced motion is preferred | Manual |
| `UI: CSS failsafe reveals highlights after 3.8s if JS is blocked` | Manual check verifying static fallback visibility | Manual |
| `wcag-contrast: all text token pairs meet >= 4.5:1 contrast in light and dark mode` | Verifies canvas/surface background against text, text-muted, text-subtle, and primary tokens meet WCAG 2.1 AA/AAA | Implemented |
| `wcag-contrast: UI borders, focus rings, and divider tokens meet >= 3:1 contrast` | Verifies border, border-strong, and focus-ring tokens against canvas/surface satisfy non-text contrast | Implemented |
| `wcag-contrast: yellow highlight tokens maintain dark ink contrast >= 4.5:1` | Verifies accent-highlight and highlight-ink pairing meets WCAG text readability standards | Implemented |
| `token-audit: zero raw hex colors and zero un-tokenised tailwind color classes in production components` | Verifies scanner finds no hardcoded palette classes or raw hex values across src/ | Implemented |
| `token-audit: ensures no px font size appears under src/ (except html clamp and print 11pt) and no token is below 0.875rem` | Verifies scanner traverses all source files under src/, enforcing no raw px font sizes and 0.875rem minimum floor | Implemented |
| `wcag-contrast: navy header background against white text and header-nav-text meets AAA standard` | Verifies header bar contrast reaches >= 10:1 in both light and dark themes | Implemented |
| `wcag-contrast: primary action against primary contrast and tints meets AA standard` | Verifies Ink Blue primary buttons and tints reach >= 5.2:1 in both light and dark themes | Implemented |
| `wcag-contrast: observation background against observation text meets AAA standard` | Verifies yellow observation cards reach >= 9:1 text contrast in both themes | Implemented |
| `wcag-contrast: border-strong and focus-ring tokens meet >= 3:1 non-text contrast in both themes` | Verifies strong container borders and focus rings satisfy WCAG non-text contrast | Implemented |
| `line-offset: calculates 1-based line numbers from zero-based character offsets` | Verifies line number mapping for start/middle/end offsets, empty text, CRLF newlines, out-of-bounds, and Unicode | Implemented |
| `faq: splitIntoColumns splits array into two balanced columns (ceil(n/2) left, rest right)` | Verifies pure split function correctly partitions empty, single-item, odd, and even lists without mutability side-effects | Implemented |
| `privacy: renders static privacy page with all 7 required sentence-case sections` | Verifies /privacy route renders all 7 sentence-case headers matching spec | Implemented |
| `privacy: embeds verbatim AI_DATA_NOTICE and AI_FILE_NOTICE` | Verifies official data and file policies are present verbatim on the page | Implemented |
| `privacy: displays Last updated 22 Oct 2026 timestamp` | Verifies explicit update timestamp is present | Implemented |
| `privacy: zero prohibited verdict words in privacy page content` | Verifies absence of 'safe', 'verified', 'legit', 'scam', 'fraud' as verdicts | Implemented |
| `privacy: UI navigation and footer elements link directly to /privacy` | Verifies all UI links point to /privacy instead of markdown files | Implemented |
| `groq: plain fetch client and token estimation` | Verifies Groq fetch headers, model id, token estimation, and error mapping | Implemented |
| `groq: fallback chain integration in analyzeOfferText` | Verifies Groq runs after Gemini failures, respects 12s reserve, and handles 429 cooldown | Implemented |
| `groq: token guard skips Groq when estimate > 7000` | Verifies large payloads skip Groq and preserve original Gemini error | Implemented |
| `groq: live synthetic evaluation (tests-live/groq.live.test.ts)` | Live execution through Groq fallback verifying latency, JSON validity, and quotes | Manual / live |
| `ask: AskResponseSchema validation and enum enforcement` | Verifies Zod schema parsing, language enum, and resource id constraints | Implemented |
| `ask: guardrails drop banned verdict words and overclaiming` | Verifies detection of scam/fraud/safe/legit verdicts and strips invalid content | Implemented |
| `ask: deterministic offline fallback in English and Hindi` | Verifies zero-failure calm fallback response based on official advisories | Implemented |
| `ask: rate limiter separate namespace and sliding window` | Verifies independent askRateLimiter enforcing 10/15m and 40/day limits | Implemented |
| `after-payment: mutual exclusivity normalization for Q2 and Q4` | Verifies nothing_yet and nothing_sensitive are mutually exclusive with active options | Implemented |
| `after-payment: priority rules and section order` | Verifies doNow, keepEvidence, askOrCheck, report, and protectAccounts order | Implemented |
| `after-payment: exhaustive option space property check and banned words audit` | Verifies all 400 answer combinations produce valid checklists with zero banned words | Implemented |
| `resources: click-to-load YouTube embeds and questionnaire questions` | Verifies youtube-nocookie host, lazy loading, #already-paid anchor, and questionnaire | Implemented |
| `UI: Bi-directional evidence linking between observation cards and offer viewer lines` | Manual check that hovering/focusing observation highlights line in viewer and clicking quote scrolls to observation | Manual |
| `UI: Widescreen fluid container scaling up to 2000px without horizontal overflow` | Manual check verifying fluid container clamping across mobile, tablet, desktop, and ultra-wide displays | Manual |
| `UI: Mobile bottom action bar on viewports <640px with safe area insets` | Manual check verifying sticky bottom bar renders with proper touch targets and safe area padding | Manual |
| `UI: Phone checklist verification at 360, 390, and 430px (no horizontal overflow, >=44px tap targets, caret never covered)` | Manual check verifying full phone usability across viewports with single-column FAQ and stacked step cards | Manual |

---

## Test Execution Summary

- **Automated Offline Unit Tests**: Complete coverage across all modules in `tests/`, covering deterministic quote validation, schema parsing, rate limits, concurrency, multimodal transcription, hero entrance timeline, scroll scene math, and vocabulary guardrails.
- **Manual / Live Tests**: 5 sequential live test cases in `tests-live/analyze.live.test.ts` (run via `npm run test:live`), plus manual UI verification checks.
- **Offline Test Command**: `npm run test` (fast, deterministic, zero external network dependency).
- **Live Test Command**: `npm run test:live` (loads `.env.local`; skips cleanly if `GEMINI_API_KEY` is not present; does not fake results).
