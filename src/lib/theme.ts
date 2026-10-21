/**
 * Theme configuration and pure resolution utilities for OfferCheck.
 *
 * OfferCheck supports three theme settings: "light", "dark", and "system".
 * The active theme is reflected via the `data-theme` attribute on the root <html> element.
 *
 * Local storage key: "offercheck-theme".
 * Default theme: "light".
 */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "offercheck-theme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";

/**
 * Pure function: parses stored theme preference defensively.
 * Accepts only "light", "dark", or "system". Defaults to "light" for null,
 * undefined, or any unrecognised value.
 */
export function parseStoredTheme(raw: unknown): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return DEFAULT_THEME_PREFERENCE;
}

/**
 * Pure function: resolves the active visual theme ("light" | "dark")
 * from a preference and the operating system's color scheme query match.
 */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme {
  if (preference === "dark") {
    return "dark";
  }
  if (preference === "light") {
    return "light";
  }
  // "system"
  return systemPrefersDark ? "dark" : "light";
}

/**
 * Self-contained inline script string for inclusion in <head>.
 * Executes before first paint to prevent theme flash (FOUC) by applying
 * `data-theme` attribute synchronously from localStorage or default.
 */
export const THEME_INLINE_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var p=localStorage.getItem(k);var t=(p==='dark'||p==='light'||p==='system')?p:'${DEFAULT_THEME_PREFERENCE}';var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(m?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);var c=document.querySelector('meta[name="theme-color"]');if(c){c.setAttribute('content',r==='dark'?'#14130f':'#1f2933');}}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME_PREFERENCE}');}})();`;
