/**
 * Feature flags for OfferCheck.
 *
 * All flags reflect features that exist today vs. features planned for future phases.
 * Prevents the landing page and UI from advertising capabilities before they are implemented.
 */

export interface FeatureFlags {
  /** Text analysis of pasted offer content (live today) */
  readonly textAnalysis: boolean;
  /** File/PDF/document upload (planned for later phase) */
  readonly documentUpload: boolean;
  /** Automated in-app company web/registry research (not planned) */
  readonly companyResearch: boolean;
  /** Structured research prompt builder and Perplexity external handoff (live today) */
  readonly companyResearchPrompt: boolean;
  /** Direct verification resource guides and links (live today) */
  readonly officialResources: boolean;
}

export const FEATURES: FeatureFlags = {
  textAnalysis: true,
  documentUpload: false,
  companyResearch: false,
  companyResearchPrompt: true,
  officialResources: true,
};

/**
 * Pure helper to check if a feature flag is enabled.
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return Boolean(FEATURES[flag]);
}
