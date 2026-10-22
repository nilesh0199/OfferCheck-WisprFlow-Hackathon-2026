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

const ARBITRARY_PX_FONT_REGEX = /\btext-\[([0-9]+)px\]\b/;
const SUB_REM_CLASS_REGEX = /\btext-(?:2xs|3xs)\b|\btext-\[([0-9.]+)rem\]\b/;
const INLINE_OR_CSS_PX_FONT_REGEX = /(?:font-size|fontSize)\s*[:=]\s*["']?([0-9]+)px/i;
const THEME_TOKEN_REM_REGEX = /--text-[a-z0-9-]+:\s*([0-9.]+)rem/i;

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

  it("ensures no px font size appears under src/ (except html clamp and print 11pt) and no token is below 0.875rem", () => {
    const violations: { file: string; line: number; match: string }[] = [];

    // Scan all .ts, .tsx and .css files under src/
    function getAllSrcFiles(dir: string, out: string[] = []): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          getAllSrcFiles(fullPath, out);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".css"))
        ) {
          out.push(fullPath);
        }
      }
      return out;
    }

    const allSrcFiles = getAllSrcFiles(srcDir);

    for (const filePath of allSrcFiles) {
      const relPath = path.relative(process.cwd(), filePath);
      const isGlobalsCss = relPath.replace(/\\/g, "/").endsWith("src/app/globals.css");
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        // 1. Disallow arbitrary px font classes: e.g. text-[15px]
        const arbitraryPxMatch = line.match(ARBITRARY_PX_FONT_REGEX);
        if (arbitraryPxMatch) {
          violations.push({
            file: relPath,
            line: index + 1,
            match: arbitraryPxMatch[0],
          });
        }

        // 2. Disallow sub-0.875rem classes (e.g. text-2xs, text-3xs, text-[0.8rem])
        const subRemMatch = line.match(SUB_REM_CLASS_REGEX);
        if (subRemMatch) {
          if (subRemMatch[0] === "text-2xs" || subRemMatch[0] === "text-3xs") {
            violations.push({
              file: relPath,
              line: index + 1,
              match: subRemMatch[0],
            });
          } else if (subRemMatch[1]) {
            const rem = parseFloat(subRemMatch[1]);
            if (rem < 0.875) {
              violations.push({
                file: relPath,
                line: index + 1,
                match: subRemMatch[0],
              });
            }
          }
        }

        // 3. Disallow inline fontSize or CSS font-size in px (except html clamp in globals.css)
        const inlinePxMatch = line.match(INLINE_OR_CSS_PX_FONT_REGEX);
        if (inlinePxMatch) {
          // Explicit exception for html clamp in globals.css
          const isAllowedClamp =
            isGlobalsCss &&
            line.includes("font-size: clamp(16px, calc(12px + 0.3125vw), 18px);");

          if (!isAllowedClamp) {
            violations.push({
              file: relPath,
              line: index + 1,
              match: inlinePxMatch[0],
            });
          }
        }

        // 4. Disallow any CSS theme font size token below 0.875rem
        const tokenRemMatch = line.match(THEME_TOKEN_REM_REGEX);
        if (tokenRemMatch && tokenRemMatch[1]) {
          const rem = parseFloat(tokenRemMatch[1]);
          if (rem < 0.875) {
            violations.push({
              file: relPath,
              line: index + 1,
              match: tokenRemMatch[0],
            });
          }
        }
      });
    }

    expect(
      violations,
      `Found px font sizes or sub-0.875rem tokens in source files:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.match}`)
        .join("\n")}`
    ).toEqual([]);
  });
});
