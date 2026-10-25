import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("/about page and TopBar/Sidebar architecture", () => {
  const aboutPath = path.resolve(process.cwd(), "src/app/about/page.tsx");
  const topBarPath = path.resolve(process.cwd(), "src/components/TopBar.tsx");
  const sidebarPath = path.resolve(process.cwd(), "src/components/Sidebar.tsx");

  it("exists as a static server component file for /about", () => {
    expect(fs.existsSync(aboutPath)).toBe(true);
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content.includes('"use client"')).toBe(false);
  });

  it("includes 'Why the name OfferClara?' section directly above 'Why it exists'", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    const nameIdx = content.indexOf("Why the name OfferClara?");
    const existsIdx = content.indexOf("Why it exists");

    expect(nameIdx).toBeGreaterThanOrEqual(0);
    expect(existsIdx).toBeGreaterThanOrEqual(0);
    expect(nameIdx).toBeLessThan(existsIdx);

    expect(content).toContain("represents the job and internship offers candidates receive.");
    expect(content).toContain(
      "represents clarity — helping people understand an offer, recognise potential red flags, and know what to verify before paying money or sharing documents."
    );
    expect(content).toContain("Together,");
    expect(content).toContain("means bringing clarity to every offer.");
  });

  it("includes all required sections in exact order on /about (P3)", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    const requiredHeadings = [
      "Why it exists",
      "What it does",
      "What it does not do",
      "Who made it",
      "Policies and official reporting",
    ];

    let lastIndex = -1;
    for (const heading of requiredHeadings) {
      const idx = content.indexOf(heading);
      expect(
        idx,
        `Missing required sentence case section heading: "${heading}"`
      ).toBeGreaterThanOrEqual(0);
      expect(
        idx,
        `Section "${heading}" appears out of required order on /about`
      ).toBeGreaterThan(lastIndex);
      lastIndex = idx;
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

  it("links to /privacy and /resources (Help and reporting) from /about", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content.includes('href="/privacy"')).toBe(true);
    expect(content.includes('href="/resources"')).toBe(true);
    expect(content).toContain("Help, reporting and official resources");
  });

  it("enforces calm non-verdict boundaries on /about and avoids scam/scammer/fraud in new copy", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    const bannedVerdicts = /\b(verified safe|definitely a scam|categorically fraud|guaranteed legit)\b/i;
    expect(content).not.toMatch(bannedVerdicts);
  });

  it("TopBar renders a single shared navy header bar with toggle, logo, Home link, and CTA", () => {
    expect(fs.existsSync(topBarPath)).toBe(true);
    const content = fs.readFileSync(topBarPath, "utf-8");
    expect(content).toContain("bg-[var(--header-bg)]");
    expect(content).toContain("text-[var(--header-text)]");
    expect(content).toContain("text-[var(--header-nav-text)]");
    expect(content).toContain('aria-controls="app-sidebar"');
    expect(content).toContain('aria-label="OfferClara, home"');
    expect(content).toContain('href="/"');
    expect(content).toContain('href="/check"');
    expect(content).toContain("Commands");
    expect(content).toContain("Hide command bar");
  });

  it("Sidebar uses HTML5 dialog with zero-scroll flex layout and no WhatsApp link", () => {
    expect(fs.existsSync(sidebarPath)).toBe(true);
    const content = fs.readFileSync(sidebarPath, "utf-8");

    expect(content).toContain('<dialog');
    expect(content).toContain('id="app-sidebar"');
    expect(content).toContain("showModal()");
    expect(content).toContain('aria-label="Close sidebar"');
    expect(content).toContain("overflow-hidden");
    expect(content).toContain("Command bar: ");

    // Links to /ask in Part 2 now that /ask is live
    expect(content).toContain('href="/ask"');
    expect(content).toContain("Clear doubt with AI");

    // No WhatsApp sharing
    expect(content).not.toContain("api.whatsapp.com/send");
    expect(content).not.toContain("Share via WhatsApp");
    expect(content).not.toContain("Share on WhatsApp");

    // Essential navigation destinations
    expect(content).toContain('href="/check"');
    expect(content).toContain('href="/resources"');
    expect(content).toContain("Help and reporting");
    expect(content).toContain('href="/#how-it-works"');
    expect(content).toContain('href="/#what-you-get"');
    expect(content).toContain('href="/#faq"');
    expect(content).toContain('href="/privacy"');
    expect(content).toContain('href="/about"');
    expect(content).toContain("<ThemeToggle");
  });

  it("ensures old TopNav.tsx and MenuSheet.tsx are removed", () => {
    const topNavPath = path.resolve(process.cwd(), "src/components/TopNav.tsx");
    const menuSheetPath = path.resolve(process.cwd(), "src/components/MenuSheet.tsx");
    expect(fs.existsSync(topNavPath)).toBe(false);
    expect(fs.existsSync(menuSheetPath)).toBe(false);
  });
});
