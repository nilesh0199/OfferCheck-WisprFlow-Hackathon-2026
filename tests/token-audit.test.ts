import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Scans all .ts and .tsx files in src/ (excluding globals.css and opengraph-image.tsx)
 * to enforce that no hard-coded default palette color classes or raw hex colors
 * are used in JSX or class strings.
 */
function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllSourceFiles(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      // Exclude opengraph-image.tsx (static image generator running in node canvas environment)
      if (entry.name !== "opengraph-image.tsx") {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const DEFAULT_PALETTE_REGEX =
  /\b(?:text|bg|border|ring|divide|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:[0-9]{2,3})\b|\b(?:text|bg|border|ring)-(?:white|black)\b/;

// Matches raw hex colors in className or style JSX attributes
const RAW_HEX_IN_JSX_REGEX = /(?:className|class)\s*=\s*["`'][^"`']*#[0-9a-fA-F]{3,8}[^"`']*["`']/;

describe("Design Token Audit", () => {
  const srcDir = path.resolve(process.cwd(), "src");
  const files = getAllSourceFiles(srcDir);

  it("finds source files to audit in src/", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("ensures no source file uses Tailwind default palette color classes", () => {
    const violations: { file: string; line: number; match: string }[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const match = line.match(DEFAULT_PALETTE_REGEX);
        if (match) {
          violations.push({
            file: path.relative(process.cwd(), filePath),
            line: index + 1,
            match: match[0],
          });
        }
      });
    }

    expect(
      violations,
      `Found default palette color classes in source files:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.match}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("ensures no source file uses raw hex colors in JSX or class strings", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        // Exclude pure theme meta-tag content attribute assignments
        if (line.includes("metaTheme.setAttribute") || line.includes("meta name=\"theme-color\"")) {
          return;
        }

        if (RAW_HEX_IN_JSX_REGEX.test(line)) {
          violations.push({
            file: path.relative(process.cwd(), filePath),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found raw hex colors in JSX / class strings in source files:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });
});
