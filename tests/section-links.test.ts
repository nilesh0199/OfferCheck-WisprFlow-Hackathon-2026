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

    // Recursively collect all ts/tsx files in src/
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
});
