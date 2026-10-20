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
| `summary: contains the disclaimer and title` | Verifies generated summary contains 'OfferCheck Review Summary' and the exact standard disclaimer | Implemented |
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
| `Research ambiguity` | Verifies behavior when company name is generic, missing, or produces ambiguous search results | Planned |
| `Mobile layout and responsiveness` | Tests responsive layout, tap targets, and typography down to ~360px viewport | Planned |

---

## Test Execution Summary

- **Total Implemented Automated Tests (Offline)**: 171 tests across 21 test files in `tests/`.
- **Manual / Live Tests**: 5 sequential live test cases in `tests-live/analyze.live.test.ts` (run via `npm run test:live`), plus manual UI verification checks.
- **Offline Test Command**: `npm run test` (fast, deterministic, zero external network dependency).
- **Live Test Command**: `npm run test:live` (loads `.env.local`; skips cleanly if `GEMINI_API_KEY` is not present; does not fake results).
