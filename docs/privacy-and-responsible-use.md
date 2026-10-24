# Privacy and Responsible Use Policy

> **OfferClara** — *"Understand the offer. Know what to verify. Make every offer clear."*  
> Document Version: Phase 10 (Theme System, Console Density, Balanced Workspace & Research Nudge) — October 2026

OfferClara is built with a strict privacy-first, evidence-first design to assist students and first-time job seekers in evaluating internship and job offers safely. This document transparently explains data flows, storage practices, rate limiting, system boundaries, and how to report issues.

---

## 1. What Data is Sent and Where

- **Destination of Offer Text:**  
  When a user submits text for review, the text is transmitted via HTTPS to Google's Gemini API (using the Interactions API with the model fallback chain: `gemini-3.8-flash`, `gemini-3.6-flash`, and `gemini-3.5-flash-lite`).
- **Destination of Uploaded Files (Phase 8 & 9c):**  
  When a user uploads screenshots (PNG, JPEG, WebP) or PDF documents, the files are transmitted over HTTPS to `/api/transcribe` and sent to Gemini's multimodal Interactions API for text transcription.
- **Zero File Name Transmission:**  
  Original file names are never extracted, saved, or sent to Google's Gemini API, nor are they recorded in server logs. Extracted text appended to the editor uses strictly generic numbering markers (such as `---- Text from Screenshot 1 ----` or `---- Text from PDF 1 ----`).
- **Free-Tier Data Terms:**  
  OfferClara runs on Google's Gemini API free tier. According to Google's published API terms, data submitted to the free-tier Gemini API may be retained and used by Google to train, tune, and improve its models and products.
- **Pre-Paste and Pre-Upload Redaction Notices:**  
  Because of the free-tier data terms, OfferClara displays persistent advisories:
  - Above the text input field (`AI_DATA_NOTICE`), advising users to redact personal identifiable information (names, email addresses, phone numbers, home addresses, government IDs, bank details, passwords, and OTPs) prior to pasting.
  - Above the file upload dropzone (`AI_FILE_NOTICE`), reminding users that anything visible in an image or PDF is sent to Gemini, advising them to crop or cover personal details first, or paste text directly.
- **Mandatory Review, Redaction & Undo Workflow:**  
  Transcribed text is appended below any existing text in the editor for the candidate to review, redact, and edit (or revert with a one-click Undo). The analysis pipeline never runs directly on uploaded files; it executes strictly on the candidate-confirmed text.

---

## 2. What Data is NOT Stored

OfferClara operates statelessly with zero persistence for offers or user identities:
- **No Databases or Accounts:**  
  The application maintains no database, user accounts, authentication tokens, tracking cookies, or server-side persistent storage.
- **In-Memory Offer Processing & Single Storage Exception:**  
  All user-submitted offer text, wizard answers (across all 5 steps), uploaded files, and analysis results are held strictly in the active browser tab's volatile memory (`SessionProvider`) and are completely cleared when the tab is closed, refreshed, or cleared via the "Clear and start over" action. The only item saved in browser storage (`localStorage`) is the user's explicit theme preference (`"offercheck-theme"`: `"light"`, `"dark"`, or `"system"`). No text, filenames, wizard responses, or analysis outputs are ever placed in local storage or cookies.
- **Zero In-Browser Speech APIs or Microphone Access:**  
  OfferClara never requests browser microphone permissions, never listens to audio, and never calls proprietary speech-to-text APIs. Voice input is supported solely through the Global Command Bar by accepting text from OS dictation, accessibility tools, or external software like Wispr Flow running entirely outside the browser.
- **Client-Side Sensitive Identifier Warning:**  
  Steps 2, 3, and 4 run client-side regex detection (`detectSensitiveIdentifiers`) for Indian identity documents, payment addresses, and financial coordinates (Aadhaar, PAN, bank account numbers, IFSC codes, UPI IDs, and passports), alerting the user before text is sent to upstream models.
- **No Server-Side File Storage:**  
  Uploaded files are never saved to server disk, temporary directories, or cloud object stores (S3, GCS, Blob). Files exist in memory only during the active request and are discarded immediately.
- **No Third-Party Analytics:**  
  No tracking scripts, advertising beacons, or telemetry SDKs (such as Google Analytics or Segment) are embedded.
- **No Offer Text or File Data Persistence in Logs:**  
  Server logs never record user-submitted text, filenames, file contents, base64 payloads, model outputs, or personal credentials.
- **Log Hygiene:**  
  The server records only operational metadata strictly necessary for debugging upstream availability:
  ```text
  [OfferClara] Analysis attempt failed: code=<CODE>, httpStatus=<STATUS>, attempt=<ATTEMPT>, model=<MODEL>, elapsedMs=<MS>
  ```
  Every log statement is protected by automated regression tests preventing accidental variable leaks.

---

## 3. In-Memory Rate Limiting and Hashed Client Keys

To protect free-tier API quotas and ensure fair availability during public evaluation:
- **Analysis Sliding Window Limits:**  
  Each client is limited to a default maximum of **8 analyses per 15-minute window** and **30 analyses per 24-hour day**.
- **Transcription Sliding Window Limits:**  
  Each client is limited to a default maximum of **6 file transcriptions per 15-minute window** and **20 file transcriptions per 24-hour day**, tracked in an isolated namespace.
- **Cryptographic Key Hashing:**  
  Client identifiers are derived from the first IP entry in the `x-forwarded-for` header (falling back to `x-real-ip`, or `"local"`).
- **Salted SHA-256:**  
  The IP address is immediately hashed using SHA-256 combined with a random 16-byte cryptographic salt generated on server startup (`randomBytes(16)`). The salt changes on each server boot, making hashes irreversible and immune to rainbow-table lookups.
- **Zero Raw IP Persistence:**  
  Raw IP addresses are never retained in memory maps, never logged, and never included in error bodies or headers.
- **Memory Safety:**  
  In-memory tracking maps are capped at 5,000 keys with automatic cleanup of expired records and eviction of oldest accessed keys when capacity thresholds are reached.

---

## 4. What OfferClara is NOT

To maintain absolute ethical integrity and avoid misleading users:
- **NOT a Scam Detector:**  
  It does not output binary labels like "legitimate" or "fraud", nor does it calculate numeric risk scores or percentages.
- **NOT a Company Authentication Service:**  
  It cannot verify whether a recruiter legitimately represents the named enterprise or whether an organisation is legally incorporated.
- **NOT Legal Advice:**  
  All observations and suggested questions are informational prompts for student and job seeker self-advocacy, not legal counsel.
- **NOT a Safety Guarantee:**  
  The absence of identified concerns ("No concerns identified") reflects only the specific text reviewed and does not mean the offer or sender is safe or legitimate.

---

## 5. Security Safeguards

- **Input Hygiene:**  
  Pasted text containing NUL characters (`\0`) or greater than 30% unprintable control codes is rejected with HTTP 422 before reaching upstream models.
- **Upload Validation & Magic-Byte Inspection:**  
  Uploaded files are strictly inspected at the binary level for valid magic byte headers (PNG `\x89PNG\r\n\x1a\n`, JPEG `\xff\xd8\xff`, WebP `RIFF....WEBP`, PDF `%PDF-`). Spoofed file extensions or non-supported types are rejected with HTTP 400.
- **Untrusted Data Isolation:**  
  System instructions for transcription explicitly treat all content inside uploaded files as UNTRUSTED DATA. Prompt injection attempts embedded in screenshots or PDFs (e.g. "Ignore previous instructions") are strictly transcribed as text and never executed.
- **Client-Side Image Downscaling:**  
  Large screenshots are proportionally downscaled via browser canvas (max 1600 px width, 6000 px height, 12 MP cap) to reduce bandwidth and stay comfortably under Vercel's 4.5 MB request limit.
- **Concurrency Guard:**  
  Server instances enforce an in-memory limit of at most 4 concurrent model calls in flight, returning HTTP 503 (`BUSY`) when capacity is saturated.
- **Model Circuit Breaker:**  
  Models experiencing timeouts (5-minute cooldown), rate limits (15-minute cooldown), or 5xx server errors (1-minute cooldown) are temporarily skipped. If all models are on cooldown, the breaker falls back to trying all models normally so the service never fails closed.
- **Cancellation:**  
  Per-attempt timeouts pass an `AbortSignal` directly to `@google/genai` to cancel active HTTP network connections when deadlines expire.
- **Security Headers:**  
  Configured with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and restrictive `Permissions-Policy`.

---

## 6. How to Report a Problem or Vulnerability

If you identify an issue, unexpected behaviour, privacy concern, or bug:
1. Open an issue on the project's public GitHub repository describing the behaviour without pasting sensitive personal data.
2. For private vulnerability disclosures or critical concerns, contact the project maintainer directly via the repository contact links.
