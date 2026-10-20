import { describe, it, expect } from "vitest";
import {
  extractContactDetails,
  isFreeEmailDomain,
  FREE_EMAIL_DOMAINS,
} from "@/lib/research/extract";

describe("Research Contact Extraction (extractContactDetails)", () => {
  it("extracts multiple emails and domains with lowercased domains and deduplication", () => {
    const text =
      "Please write to HR@Example.COM or jobs@example.com. For queries, contact HR@EXAMPLE.COM again.";
    const result = extractContactDetails(text);

    expect(result.emails).toEqual(["hr@example.com", "jobs@example.com"]);
    expect(result.senderDomains).toEqual(["example.com"]);
  });

  it("extracts multiple distinct domains in order of first appearance", () => {
    const text =
      "Reach out to recruiter@acme.org, then cc support@portal.co.in and hr@acme.org.";
    const result = extractContactDetails(text);

    expect(result.emails).toEqual([
      "recruiter@acme.org",
      "support@portal.co.in",
      "hr@acme.org",
    ]);
    expect(result.senderDomains).toEqual(["acme.org", "portal.co.in"]);
  });

  it("extracts URLs starting with http://, https://, and www., trimming trailing punctuation", () => {
    const text =
      "Visit https://example.com/careers. Also check http://jobs.example.org, or www.example.net/portal! Check details at https://careers.example.com;";
    const result = extractContactDetails(text);

    expect(result.urls).toEqual([
      "https://example.com/careers",
      "http://jobs.example.org",
      "www.example.net/portal",
      "https://careers.example.com",
    ]);
  });

  it("correctly trims URLs wrapped in parentheses", () => {
    const text =
      "You can review our company page (https://www.example.com/about) for details.";
    const result = extractContactDetails(text);

    expect(result.urls).toEqual(["https://www.example.com/about"]);
  });

  it("handles URLs that contain internal parentheses like Wikipedia paths without mangling", () => {
    const text =
      "See https://en.wikipedia.org/wiki/Company_(disambiguation) for background.";
    const result = extractContactDetails(text);

    expect(result.urls).toEqual([
      "https://en.wikipedia.org/wiki/Company_(disambiguation)",
    ]);
  });

  it("deduplicates identical URLs regardless of case", () => {
    const text =
      "Go to HTTPS://EXAMPLE.COM/portal or visit https://example.com/portal.";
    const result = extractContactDetails(text);

    expect(result.urls).toHaveLength(1);
    expect(result.urls[0].toLowerCase()).toBe("https://example.com/portal");
  });

  it("returns empty arrays when text contains no emails or URLs", () => {
    const text = "We are pleased to offer you a role as an intern starting next month.";
    const result = extractContactDetails(text);

    expect(result.emails).toEqual([]);
    expect(result.senderDomains).toEqual([]);
    expect(result.urls).toEqual([]);
  });

  it("handles empty or non-string text safely without throwing", () => {
    expect(extractContactDetails("")).toEqual({
      emails: [],
      senderDomains: [],
      urls: [],
    });
    // @ts-expect-error testing invalid input runtime safety
    expect(extractContactDetails(null)).toEqual({
      emails: [],
      senderDomains: [],
      urls: [],
    });
  });
});

describe("isFreeEmailDomain", () => {
  it("identifies all documented free and webmail domains", () => {
    for (const domain of FREE_EMAIL_DOMAINS) {
      expect(isFreeEmailDomain(domain)).toBe(true);
      expect(isFreeEmailDomain(`@${domain}`)).toBe(true);
      expect(isFreeEmailDomain(domain.toUpperCase())).toBe(true);
    }
  });

  it("returns false for corporate or institutional domains", () => {
    expect(isFreeEmailDomain("example.com")).toBe(false);
    expect(isFreeEmailDomain("aetherflume.com")).toBe(false);
    expect(isFreeEmailDomain("tcs.com")).toBe(false);
    expect(isFreeEmailDomain("university.edu.in")).toBe(false);
  });

  it("handles empty, null, or whitespace values safely", () => {
    expect(isFreeEmailDomain("")).toBe(false);
    expect(isFreeEmailDomain("   ")).toBe(false);
    expect(isFreeEmailDomain(null)).toBe(false);
    expect(isFreeEmailDomain(undefined)).toBe(false);
  });
});
