import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * WCAG 2.1 relative luminance and contrast ratio calculations.
 */
function sRGBtoLin(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "").trim();
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Helper to parse CSS variables from globals.css
 */
function parseCssTokens(): { light: Record<string, string>; dark: Record<string, string> } {
  const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  function extractBlock(selectorRegex: RegExp): Record<string, string> {
    const match = css.match(selectorRegex);
    if (!match) return {};
    const blockContent = match[1];
    const tokens: Record<string, string> = {};
    const lines = blockContent.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      const varMatch = trimmed.match(/^(--[a-zA-Z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/);
      if (varMatch) {
        tokens[varMatch[1]] = varMatch[2];
      }
    }
    return tokens;
  }

  const light = extractBlock(/(?::root,\s*\[data-theme=["']light["']\]\s*\{)([\s\S]*?)(?=\n\})/);
  const dark = extractBlock(/(?:\[data-theme=["']dark["']\]\s*\{)([\s\S]*?)(?=\n\})/);

  return { light, dark };
}

describe("WCAG 2.1 Contrast Ratios for Semantic Design Tokens", () => {
  const { light, dark } = parseCssTokens();

  describe("Light Theme Token Contrast", () => {
    it("has all required semantic tokens defined", () => {
      expect(light["--color-header-bg"]).toBeDefined();
      expect(light["--color-header-text"]).toBeDefined();
      expect(light["--color-header-nav-text"]).toBeDefined();
      expect(light["--color-canvas"]).toBeDefined();
      expect(light["--color-surface"]).toBeDefined();
      expect(light["--color-surface-alt"]).toBeDefined();
      expect(light["--color-text"]).toBeDefined();
      expect(light["--color-text-muted"]).toBeDefined();
      expect(light["--color-text-subtle"]).toBeDefined();
      expect(light["--color-border"]).toBeDefined();
      expect(light["--color-border-strong"]).toBeDefined();
      expect(light["--color-primary"]).toBeDefined();
      expect(light["--color-primary-contrast"]).toBeDefined();
      expect(light["--color-accent-highlight"]).toBeDefined();
      expect(light["--color-highlight-ink"]).toBeDefined();
      expect(light["--color-focus-ring"]).toBeDefined();
      expect(light["--color-tint-info-bg"]).toBeDefined();
      expect(light["--color-tint-action-bg"]).toBeDefined();
      expect(light["--color-tint-attention-bg"]).toBeDefined();
      expect(light["--color-command-active-border"]).toBeDefined();
    });

    it("header text and nav text achieve >= 4.5:1 against header-bg", () => {
      expect(contrastRatio(light["--color-header-text"], light["--color-header-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--color-header-nav-text"], light["--color-header-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("primary text achieves >= 7:1 against surface and >= 4.5:1 against canvas", () => {
      expect(contrastRatio(light["--color-text"], light["--color-surface"])).toBeGreaterThanOrEqual(7.0);
      expect(contrastRatio(light["--color-text"], light["--color-canvas"])).toBeGreaterThanOrEqual(4.5);
    });

    it("muted text achieves >= 4.5:1 against surface and canvas", () => {
      expect(contrastRatio(light["--color-text-muted"], light["--color-surface"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--color-text-muted"], light["--color-canvas"])).toBeGreaterThanOrEqual(4.5);
    });

    it("subtle text achieves >= 4.5:1 against surface", () => {
      expect(contrastRatio(light["--color-text-subtle"], light["--color-surface"])).toBeGreaterThanOrEqual(4.5);
    });

    it("primary button contrast achieves >= 4.5:1", () => {
      expect(contrastRatio(light["--color-primary-contrast"], light["--color-primary"])).toBeGreaterThanOrEqual(4.5);
    });

    it("link (primary) achieves >= 4.5:1 on surface, info tint, and action tint", () => {
      expect(contrastRatio(light["--color-primary"], light["--color-surface"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--color-primary"], light["--color-tint-info-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--color-primary"], light["--color-tint-action-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("text achieves >= 4.5:1 on info tint and action tint", () => {
      expect(contrastRatio(light["--color-text"], light["--color-tint-info-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--color-text"], light["--color-tint-action-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("highlight ink on accent highlight achieves >= 4.5:1", () => {
      expect(contrastRatio(light["--color-highlight-ink"], light["--color-accent-highlight"])).toBeGreaterThanOrEqual(4.5);
    });

    it("observation text achieves >= 4.5:1 on observation tint bg", () => {
      expect(contrastRatio(light["--color-tint-attention-text"], light["--color-tint-attention-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("border-strong achieves >= 3:1 against surface", () => {
      expect(contrastRatio(light["--color-border-strong"], light["--color-surface"])).toBeGreaterThanOrEqual(3.0);
    });

    it("focus ring achieves >= 3:1 against canvas and surface", () => {
      expect(contrastRatio(light["--color-focus-ring"], light["--color-canvas"])).toBeGreaterThanOrEqual(3.0);
      expect(contrastRatio(light["--color-focus-ring"], light["--color-surface"])).toBeGreaterThanOrEqual(3.0);
    });

    it("header focus ring achieves >= 3:1 against header-bg", () => {
      // In light mode, keyboard focus on navy bar uses white offset ring
      expect(contrastRatio("#ffffff", light["--color-header-bg"])).toBeGreaterThanOrEqual(3.0);
    });

    it("command active border achieves >= 3:1 against surface and canvas", () => {
      expect(contrastRatio(light["--color-command-active-border"], light["--color-surface"])).toBeGreaterThanOrEqual(3.0);
      expect(contrastRatio(light["--color-command-active-border"], light["--color-canvas"])).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe("Dark Theme Token Contrast", () => {
    it("has all required semantic tokens defined", () => {
      expect(dark["--color-header-bg"]).toBeDefined();
      expect(dark["--color-header-text"]).toBeDefined();
      expect(dark["--color-header-nav-text"]).toBeDefined();
      expect(dark["--color-canvas"]).toBeDefined();
      expect(dark["--color-surface"]).toBeDefined();
      expect(dark["--color-surface-alt"]).toBeDefined();
      expect(dark["--color-text"]).toBeDefined();
      expect(dark["--color-text-muted"]).toBeDefined();
      expect(dark["--color-text-subtle"]).toBeDefined();
      expect(dark["--color-border"]).toBeDefined();
      expect(dark["--color-border-strong"]).toBeDefined();
      expect(dark["--color-primary"]).toBeDefined();
      expect(dark["--color-primary-contrast"]).toBeDefined();
      expect(dark["--color-accent-highlight"]).toBeDefined();
      expect(dark["--color-highlight-ink"]).toBeDefined();
      expect(dark["--color-focus-ring"]).toBeDefined();
      expect(dark["--color-tint-info-bg"]).toBeDefined();
      expect(dark["--color-tint-action-bg"]).toBeDefined();
      expect(dark["--color-command-active-border"]).toBeDefined();
      expect(dark["--color-tint-attention-bg"]).toBeDefined();
    });

    it("header text and nav text achieve >= 4.5:1 against header-bg", () => {
      expect(contrastRatio(dark["--color-header-text"], dark["--color-header-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--color-header-nav-text"], dark["--color-header-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("primary text achieves >= 7:1 against surface and >= 4.5:1 against canvas", () => {
      expect(contrastRatio(dark["--color-text"], dark["--color-surface"])).toBeGreaterThanOrEqual(7.0);
      expect(contrastRatio(dark["--color-text"], dark["--color-canvas"])).toBeGreaterThanOrEqual(4.5);
    });

    it("muted text achieves >= 4.5:1 against surface and canvas", () => {
      expect(contrastRatio(dark["--color-text-muted"], dark["--color-surface"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--color-text-muted"], dark["--color-canvas"])).toBeGreaterThanOrEqual(4.5);
    });

    it("subtle text achieves >= 4.5:1 against surface", () => {
      expect(contrastRatio(dark["--color-text-subtle"], dark["--color-surface"])).toBeGreaterThanOrEqual(4.5);
    });

    it("primary button contrast achieves >= 4.5:1", () => {
      expect(contrastRatio(dark["--color-primary-contrast"], dark["--color-primary"])).toBeGreaterThanOrEqual(4.5);
    });

    it("link (primary) achieves >= 4.5:1 on surface, info tint, and action tint", () => {
      expect(contrastRatio(dark["--color-primary"], dark["--color-surface"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--color-primary"], dark["--color-tint-info-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--color-primary"], dark["--color-tint-action-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("text achieves >= 4.5:1 on info tint and action tint", () => {
      expect(contrastRatio(dark["--color-text"], dark["--color-tint-info-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--color-text"], dark["--color-tint-action-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("highlight ink on accent highlight achieves >= 4.5:1", () => {
      expect(contrastRatio(dark["--color-highlight-ink"], dark["--color-accent-highlight"])).toBeGreaterThanOrEqual(4.5);
    });

    it("observation text achieves >= 4.5:1 on observation tint bg", () => {
      expect(contrastRatio(dark["--color-tint-attention-text"], dark["--color-tint-attention-bg"])).toBeGreaterThanOrEqual(4.5);
    });

    it("border-strong achieves >= 3:1 against surface", () => {
      expect(contrastRatio(dark["--color-border-strong"], dark["--color-surface"])).toBeGreaterThanOrEqual(3.0);
    });

    it("focus ring achieves >= 3:1 against canvas, surface, and header-bg", () => {
      expect(contrastRatio(dark["--color-focus-ring"], dark["--color-canvas"])).toBeGreaterThanOrEqual(3.0);
      expect(contrastRatio(dark["--color-focus-ring"], dark["--color-surface"])).toBeGreaterThanOrEqual(3.0);
      expect(contrastRatio(dark["--color-focus-ring"], dark["--color-header-bg"])).toBeGreaterThanOrEqual(3.0);
    });

    it("command active border achieves >= 3:1 against surface and canvas", () => {
      expect(contrastRatio(dark["--color-command-active-border"], dark["--color-surface"])).toBeGreaterThanOrEqual(3.0);
      expect(contrastRatio(dark["--color-command-active-border"], dark["--color-canvas"])).toBeGreaterThanOrEqual(3.0);
    });
  });
});
