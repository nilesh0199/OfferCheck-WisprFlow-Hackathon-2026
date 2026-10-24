import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Landing section IDs and cross-page anchor links", () => {
  const landingComponentsDir = path.resolve(process.cwd(), "src/components/landing");
  const landingPageFile = path.resolve(process.cwd(), "src/app/page.tsx");

  // Collect all files involved in rendering the landing page
  const landingFiles = [
    landingPageFile,
    ...fs
      .readdirSync(landingComponentsDir)
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
      .map((f) => path.join(landingComponentsDir, f)),
  ];

  // Extract all id="..." attributes defined in landing page source
  const landingIds = new Set<string>();
  const idRegex = /\bid=["']([^"']+)["']/g;

  for (const filePath of landingFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    let match: RegExpExecArray | null;
    while ((match = idRegex.exec(content)) !== null) {
      landingIds.add(match[1]);
    }
  }

  it("defines essential landing section IDs", () => {
    expect(landingIds.has("how-it-works")).toBe(true);
    expect(landingIds.has("what-you-get")).toBe(true);
    expect(landingIds.has("faq")).toBe(true);
    expect(landingIds.has("privacy")).toBe(true);
  });

  it("verifies every /#id cross-page link points to an existing section on landing page", () => {
    const srcDir = path.resolve(process.cwd(), "src");

    function getFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getFiles(fullPath));
        } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const allSrcFiles = getFiles(srcDir);
    const crossPageAnchorRegex = /href=["']\/#([^"']+)["']/g;

    const crossPageAnchors: { file: string; targetId: string }[] = [];

    for (const file of allSrcFiles) {
      const content = fs.readFileSync(file, "utf-8");
      let match: RegExpExecArray | null;
      while ((match = crossPageAnchorRegex.exec(content)) !== null) {
        crossPageAnchors.push({
          file: path.relative(process.cwd(), file),
          targetId: match[1],
        });
      }
    }

    expect(crossPageAnchors.length).toBeGreaterThan(0);

    for (const anchor of crossPageAnchors) {
      expect(
        landingIds.has(anchor.targetId),
        `Link in ${anchor.file} points to /#${anchor.targetId}, but #${anchor.targetId} is not defined on the landing page.`
      ).toBe(true);
    }
  });

  it("verifies every internal landing anchor in src/components/landing points to an existing section", () => {
    const landingAnchorRegex = /href=["']#([^"']+)["']/g;
    const landingAnchors: { file: string; targetId: string }[] = [];

    for (const file of landingFiles) {
      const content = fs.readFileSync(file, "utf-8");
      let match: RegExpExecArray | null;
      while ((match = landingAnchorRegex.exec(content)) !== null) {
        landingAnchors.push({
          file: path.relative(process.cwd(), file),
          targetId: match[1],
        });
      }
    }

    for (const anchor of landingAnchors) {
      expect(
        landingIds.has(anchor.targetId),
        `Landing file ${anchor.file} links to #${anchor.targetId}, but #${anchor.targetId} is not defined on the landing page.`
      ).toBe(true);
    }
  });

  it("scans every internal href in src/, resolves against routes in src/app, and fails on dead routes", () => {
    const srcDir = path.resolve(process.cwd(), "src");

    function getFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getFiles(fullPath));
        } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const allSrcFiles = getFiles(srcDir);

    // Collect all valid known route paths from src/app
    const validRoutes = new Set([
      "/",
      "/check",
      "/resources",
      "/privacy",
      "/about",
      "/ask",
    ]);

    // Collect all id="..." attributes defined across all src files
    const allIds = new Set<string>();
    const idRegex = /\bid=["']([^"']+)["']/g;

    for (const file of allSrcFiles) {
      const content = fs.readFileSync(file, "utf-8");
      let match: RegExpExecArray | null;
      while ((match = idRegex.exec(content)) !== null) {
        allIds.add(match[1]);
      }
    }

    // Match static internal href strings: href="/..." or href="#..."
    const hrefRegex = /href=["'](\/[^"']*|#[^"']*)["']/g;
    const errors: string[] = [];

    for (const file of allSrcFiles) {
      const content = fs.readFileSync(file, "utf-8");
      let match: RegExpExecArray | null;

      while ((match = hrefRegex.exec(content)) !== null) {
        const target = match[1];

        // Case 1: Pure anchor link #id
        if (target.startsWith("#")) {
          const id = target.slice(1);
          if (!allIds.has(id)) {
            errors.push(`${path.relative(process.cwd(), file)}: dead anchor href="${target}"`);
          }
          continue;
        }

        // Case 2: Cross-page anchor /path#id
        if (target.includes("#")) {
          const [baseRoute, hashId] = target.split("#");
          const route = baseRoute === "" ? "/" : baseRoute;
          if (!validRoutes.has(route)) {
            errors.push(`${path.relative(process.cwd(), file)}: dead route in href="${target}"`);
          }
          if (route === "/" && !landingIds.has(hashId)) {
            errors.push(`${path.relative(process.cwd(), file)}: dead anchor in href="${target}"`);
          } else if (!allIds.has(hashId)) {
            errors.push(`${path.relative(process.cwd(), file)}: dead anchor in href="${target}"`);
          }
          continue;
        }

        // Case 3: Query parameter link (e.g. /check?sample=...)
        if (target.includes("?")) {
          const baseRoute = target.split("?")[0];
          if (!validRoutes.has(baseRoute)) {
            errors.push(`${path.relative(process.cwd(), file)}: dead route in href="${target}"`);
          }
          continue;
        }

        // Case 4: Standard internal page route
        if (!validRoutes.has(target)) {
          errors.push(`${path.relative(process.cwd(), file)}: dead route href="${target}"`);
        }
      }
    }

    expect(errors, `Found broken internal links:\n${errors.join("\n")}`).toEqual([]);
  });
});
