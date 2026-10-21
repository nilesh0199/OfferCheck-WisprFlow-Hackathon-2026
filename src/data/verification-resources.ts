/**
 * Official Indian verification resources and reporting channels.
 *
 * All resources and contact points are static, verified against official government portals,
 * and contain NO affiliate links or unofficial channels.
 */

export type ResourceActionType = "link" | "email" | "phone";

export interface VerificationResourceAction {
  readonly label: string;
  readonly type: ResourceActionType;
  readonly value: string;
}

export interface VerificationResource {
  readonly id: "cybercrime" | "aicte" | "ncs" | "mca";
  readonly title: string;
  readonly summary: string;
  readonly actions: readonly VerificationResourceAction[];
  readonly lastChecked: string;
  readonly sourceUrl: string;
}

export const VERIFICATION_RESOURCES: readonly VerificationResource[] = [
  {
    id: "cybercrime",
    title: "If you have already paid or shared documents",
    summary:
      "Report cyber financial fraud on the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call the 1930 helpline; keep screenshots, messages and payment proofs.",
    actions: [
      {
        label: "Open cybercrime portal",
        type: "link",
        value: "https://cybercrime.gov.in",
      },
      {
        label: "Helpline",
        type: "phone",
        value: "1930",
      },
    ],
    lastChecked: "2026-10-20",
    sourceUrl: "https://cybercrime.gov.in",
  },
  {
    id: "aicte",
    title: "AICTE National Internship Portal",
    summary:
      "If this message claims a connection to the AICTE National Internship Portal, the portal states that registration and applications are free for students, and that anyone asking for payment to apply through the portal should be reported to internship@aicte-india.org.",
    actions: [
      {
        label: "Open AICTE portal",
        type: "link",
        value: "https://internship.aicte-india.org",
      },
      {
        label: "Report fee demands",
        type: "email",
        value: "internship@aicte-india.org",
      },
    ],
    lastChecked: "2026-10-20",
    sourceUrl: "https://internship.aicte-india.org",
  },
  {
    id: "ncs",
    title: "National Career Service",
    summary:
      "If this message claims a connection to the National Career Service (NCS), NCS states its services are free and that job seekers should not pay employers; verify NCS claims only on ncs.gov.in; helpline 1514; email support.ncs@gov.in.",
    actions: [
      {
        label: "Open NCS portal",
        type: "link",
        value: "https://www.ncs.gov.in",
      },
      {
        label: "Toll-free helpline",
        type: "phone",
        value: "1514",
      },
      {
        label: "Support email",
        type: "email",
        value: "support.ncs@gov.in",
      },
    ],
    lastChecked: "2026-10-20",
    sourceUrl: "https://www.ncs.gov.in",
  },
  {
    id: "mca",
    title: "Check a company's registration",
    summary:
      "Search the exact legal name on the MCA \"Check Company/LLP Name\" page to see whether a registered entity exists and its status/identifier. A registered company does not prove that the sender or offer is genuine, and an unregistered name does not by itself prove anything is wrong.",
    actions: [
      {
        label: "Open the MCA company or LLP name search",
        type: "link",
        value:
          "https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html",
      },
    ],
    lastChecked: "2026-10-20",
    sourceUrl:
      "https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html",
  },
];
