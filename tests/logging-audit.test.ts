import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllSourceFiles(fullPath, fileList);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe("Logging Audit and Privacy Guard", () => {
  const srcDir = path.resolve(__dirname, "../src");
  const sourceFiles = getAllSourceFiles(srcDir);

  it("finds source files in src directory", () => {
    expect(sourceFiles.length).toBeGreaterThan(10);
  });

  it("no source file in src/ contains non-exempt console.log", () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const allowedConsoleLogFiles: string[] = [];

    for (const file of sourceFiles) {
      const relFile = path.relative(srcDir, file).replace(/\\/g, "/");
      if (allowedConsoleLogFiles.includes(relFile)) continue;

      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (/console\.log\s*\(/.test(line)) {
          violations.push({
            file: relFile,
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found non-exempt console.log calls in src/: ${JSON.stringify(violations, null, 2)}`
    ).toHaveLength(0);
  });

  it("no console.* call in src/ logs sensitive variables (text, body, analysis, apiKey, ip)", () => {
    const forbiddenPattern =
      /console\.(log|info|warn|error|debug)\s*\([^)]*\b(text|body|analysis|apiKey|rawBody|clientIp|ip|rawOutput)\b[^)]*\)/i;

    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (forbiddenPattern.test(line)) {
          violations.push({
            file: path.relative(srcDir, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found sensitive variable logging in src/: ${JSON.stringify(violations, null, 2)}`
    ).toHaveLength(0);
  });

  it("the only allowed logging calls in src/ are safe diagnostic loggers in gemini.ts and api/transcribe/route.ts", () => {
    const allConsoleCalls: { file: string; line: number; text: string }[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (/console\.(log|info|warn|error|debug)\s*\(/.test(line)) {
          allConsoleCalls.push({
            file: path.relative(srcDir, file).replace(/\\/g, "/"),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    // Exactly 2 allowed safe diagnostic console calls across entire src/
    expect(allConsoleCalls).toHaveLength(2);
    const filesWithLogging = allConsoleCalls.map((c) => c.file);
    expect(filesWithLogging).toContain("lib/analysis/gemini.ts");
    expect(filesWithLogging).toContain("app/api/transcribe/route.ts");

    const geminiContent = fs.readFileSync(
      path.join(srcDir, "lib/analysis/gemini.ts"),
      "utf-8"
    );
    expect(geminiContent).toContain("[OfferClara] Analysis attempt failed:");

    const transcribeContent = fs.readFileSync(
      path.join(srcDir, "app/api/transcribe/route.ts"),
      "utf-8"
    );
    expect(transcribeContent).toContain("[OfferClara] Transcription attempt failed:");
  });
});
