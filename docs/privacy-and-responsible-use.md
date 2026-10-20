# Privacy and Responsible Use Policy

> **OfferCheck** — *"Understand the offer. Know what to verify."*  
> Document Version: Phase 6 (Safeguards for Public Demo) — October 2026

OfferCheck is built with a strict privacy-first, evidence-first design to assist students in evaluating internship communications safely. This document transparently explains data flows, storage practices, rate limiting, system boundaries, and how to report issues.

---

## 1. What Data is Sent and Where

- **Destination of Offer Text:**  
  When a user submits text for review, the text is transmitted via HTTPS to Google's Gemini API (using the Interactions API with the model fallback chain: `gemini-3.8-flash`, `gemini-3.6-flash`, and `gemini-3.5-flash-lite`).
- **Free-Tier Data Terms:**  
  OfferCheck runs on Google's Gemini API free tier. According to Google's published API terms, data submitted to the free-tier Gemini API may be retained and used by Google to train, tune, and improve its models and products.
- **Pre-Paste Redaction Notice:**  
  Because of the free-tier data terms, OfferCheck displays a persistent advisory above the input field advising users to redact personal identifiable information—including personal names, email addresses, phone numbers, home addresses, government IDs, bank details, passwords, and OTPs—prior to pasting.

---

## 2. What Data is NOT Stored

OfferCheck operates entirely statelessly:
- **No Databases or Accounts:**  
  The application maintains no database, user accounts, authentication tokens, cookies, or persistent storage.
- **No Third-Party Analytics:**  
  No tracking scripts, advertising beacons, or telemetry SDKs (such as Google Analytics or Segment) are embedded.
- **No Offer Text Persistence in Logs:**  
  Server logs never record user-submitted text, prompt payloads, model outputs, or personal credentials.
- **Log Hygiene:**  
  The server records only operational metadata strictly necessary for debugging upstream availability:
  ```text
  [OfferCheck] Analysis attempt failed: code=<CODE>, httpStatus=<STATUS>, attempt=<ATTEMPT>, model=<MODEL>, elapsedMs=<MS>
  ```
  Every log statement is protected by automated regression tests preventing accidental variable leaks.

---

## 3. In-Memory Rate Limiting and Hashed Client Keys

To protect free-tier API quotas and ensure fair availability during public evaluation:
- **Sliding Window Limits:**  
  Each client is limited to a default maximum of **8 analyses per 15-minute window** and **30 analyses per 24-hour day**.
- **Cryptographic Key Hashing:**  
  Client identifiers are derived from the first IP entry in the `x-forwarded-for` header (falling back to `x-real-ip`, or `"local"`).
- **Salted SHA-256:**  
  The IP address is immediately hashed using SHA-256 combined with a random 16-byte cryptographic salt generated on server startup (`randomBytes(16)`). The salt changes on each server boot, making hashes irreversible and immune to rainbow-table lookups.
- **Zero Raw IP Persistence:**  
  Raw IP addresses are never retained in memory maps, never logged, and never included in error bodies or headers.
- **Memory Safety:**  
  The in-memory tracking map is capped at 5,000 keys with automatic cleanup of expired records and eviction of oldest accessed keys when capacity thresholds are reached.

---

## 4. What OfferCheck is NOT

To maintain absolute ethical integrity and avoid misleading users:
- **NOT a Scam Detector:**  
  It does not output binary labels like "legitimate" or "fraud", nor does it calculate numeric risk scores or percentages.
- **NOT a Company Authentication Service:**  
  It cannot verify whether a recruiter legitimately represents the named enterprise or whether an organization is legally incorporated.
- **NOT Legal Advice:**  
  All observations and suggested questions are informational prompts for student self-advocacy, not legal counsel.
- **NOT a Safety Guarantee:**  
  The absence of identified concerns ("No concerns identified") reflects only the specific text reviewed and does not mean the internship or sender is safe or legitimate.

---

## 5. Security Safeguards

- **Input Hygiene:**  
  Pasted text containing NUL characters (`\0`) or greater than 30% unprintable control codes is rejected with HTTP 422 before reaching upstream models.
- **Concurrency Guard:**  
  Server instances enforce an in-memory limit of at most 4 concurrent analyses in flight, returning HTTP 503 (`BUSY`) when capacity is saturated.
- **Model Circuit Breaker:**  
  Models experiencing timeouts (5-minute cooldown), rate limits (15-minute cooldown), or 5xx server errors (1-minute cooldown) are temporarily skipped. If all models are on cooldown, the breaker falls back to trying all models normally so the service never fails closed.
- **Cancellation:**  
  Per-attempt timeouts pass an `AbortSignal` directly to `@google/genai` to cancel active HTTP network connections when deadlines expire.
- **Security Headers:**  
  Configured with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and restrictive `Permissions-Policy`.

---

## 6. How to Report a Problem or Vulnerability

If you identify an issue, unexpected behavior, privacy concern, or bug:
1. Open an issue on the project's public GitHub repository describing the behavior without pasting sensitive personal data.
2. For private vulnerability disclosures or critical concerns, contact the project maintainer directly via the repository contact links.
