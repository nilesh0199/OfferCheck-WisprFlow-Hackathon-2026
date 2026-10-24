import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("/about page and slide-over menu architecture", () => {
  const aboutPath = path.resolve(process.cwd(), "src/app/about/page.tsx");
  const menuPath = path.resolve(process.cwd(), "src/components/MenuSheet.tsx");
  const topNavPath = path.resolve(process.cwd(), "src/components/TopNav.tsx");

  it("exists as a static server component file for /about", () => {
    expect(fs.existsSync(aboutPath)).toBe(true);
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content.includes('"use client"')).toBe(false);
  });

  it("includes all required sections in sentence case on /about", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    const requiredHeadings = [
      "What it does",
      "What it does not do",
      "Who made it",
      "Why it exists",
    ];

    for (const heading of requiredHeadings) {
      expect(
        content.includes(heading),
        `Missing required sentence case section heading: "${heading}"`
      ).toBe(true);
    }
  });

  it("attributes Nilesh Thipe with correct profile and repository links", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content).toContain("Nilesh Thipe");
    expect(content).toContain("BCA student");
    expect(content).toContain("https://github.com/nilesh0199");
    expect(content).toContain("https://www.linkedin.com/in/nilesh-h-thipe-372291253/");
    expect(content).toContain('rel="noopener noreferrer"');
    expect(content).toContain('target="_blank"');
  });

  it("links to /privacy and /resources from /about", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content.includes('href="/privacy"')).toBe(true);
    expect(content.includes('href="/resources"')).toBe(true);
  });

  it("enforces calm non-verdict boundaries on /about", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    const bannedVerdicts = /\b(verified safe|definitely a scam|categorically fraud|guaranteed legit)\b/i;
    expect(content).not.toMatch(bannedVerdicts);
  });

  it("MenuSheet uses HTML5 dialog with accessible buttons and tap targets", () => {
    expect(fs.existsSync(menuPath)).toBe(true);
    const content = fs.readFileSync(menuPath, "utf-8");

    // Dialog element
    expect(content).toContain("<dialog");
    expect(content).toContain("showModal()");
    expect(content).toContain("aria-label=\"Open menu\"");
    expect(content).toContain("aria-label=\"Close menu\"");

    // Essential navigation destinations
    expect(content).toContain('href="/check"');
    expect(content).toContain('href="/ask"');
    expect(content).toContain('href="/resources"');
    expect(content).toContain('href="/#how-it-works"');
    expect(content).toContain('href="/#what-you-get"');
    expect(content).toContain('href="/#faq"');
    expect(content).toContain('href="/privacy"');
    expect(content).toContain('href="/about"');
    expect(content).toContain("api.whatsapp.com/send");
    expect(content).toContain("<ThemeToggle");

    // Tap target minimum 44px
    expect(content).toContain("min-h-[44px]");
  });

  it("TopNav provides a canvas-coloured slim row without brand colour bar", () => {
    expect(fs.existsSync(topNavPath)).toBe(true);
    const content = fs.readFileSync(topNavPath, "utf-8");
    expect(content).toContain("bg-[var(--bg)]");
    expect(content).not.toContain("bg-[var(--header-bg)]");
  });

  it("ensures old Header.tsx and LandingNav.tsx are removed", () => {
    const headerPath = path.resolve(process.cwd(), "src/components/Header.tsx");
    const landingNavPath = path.resolve(process.cwd(), "src/components/landing/LandingNav.tsx");
    expect(fs.existsSync(headerPath)).toBe(false);
    expect(fs.existsSync(landingNavPath)).toBe(false);
  });
});
