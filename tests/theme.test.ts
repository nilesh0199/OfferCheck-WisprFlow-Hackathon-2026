import { describe, it, expect } from "vitest";
import {
  parseStoredTheme,
  resolveTheme,
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

describe("Theme utilities", () => {
  describe("parseStoredTheme", () => {
    it("returns DEFAULT_THEME_PREFERENCE ('light') for missing or unexpected values", () => {
      expect(parseStoredTheme(null)).toBe(DEFAULT_THEME_PREFERENCE);
      expect(parseStoredTheme(undefined)).toBe(DEFAULT_THEME_PREFERENCE);
      expect(parseStoredTheme("")).toBe(DEFAULT_THEME_PREFERENCE);
      expect(parseStoredTheme("invalid")).toBe(DEFAULT_THEME_PREFERENCE);
      expect(parseStoredTheme(123)).toBe(DEFAULT_THEME_PREFERENCE);
      expect(parseStoredTheme({})).toBe(DEFAULT_THEME_PREFERENCE);
    });

    it("parses valid theme preferences correctly", () => {
      expect(parseStoredTheme("light")).toBe("light");
      expect(parseStoredTheme("dark")).toBe("dark");
      expect(parseStoredTheme("system")).toBe("system");
    });
  });

  describe("resolveTheme", () => {
    it("resolves explicit 'light' preference regardless of OS setting", () => {
      expect(resolveTheme("light", false)).toBe("light");
      expect(resolveTheme("light", true)).toBe("light");
    });

    it("resolves explicit 'dark' preference regardless of OS setting", () => {
      expect(resolveTheme("dark", false)).toBe("dark");
      expect(resolveTheme("dark", true)).toBe("dark");
    });

    it("resolves 'system' preference based on OS dark mode status", () => {
      expect(resolveTheme("system", false)).toBe("light");
      expect(resolveTheme("system", true)).toBe("dark");
    });
  });

  describe("constants", () => {
    it("exports standard storage key and default preference", () => {
      expect(THEME_STORAGE_KEY).toBe("offercheck-theme");
      expect(DEFAULT_THEME_PREFERENCE).toBe("light");
    });
  });
});
