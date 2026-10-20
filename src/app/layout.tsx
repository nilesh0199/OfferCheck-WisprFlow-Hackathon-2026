import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, TAGLINE } from "@/lib/config";
import { SessionProvider } from "@/components/SessionProvider";
import { ScrollToTop } from "@/components/ScrollToTop";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} — ${TAGLINE}`,
    template: `%s — ${APP_NAME}`,
  },
  description:
    "Calm, evidence-linked internship and job offer analysis. Paste an offer to spot upfront payment requests, urgent deadlines, and missing details before you pay or share documents.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: `${APP_NAME} — ${TAGLINE}`,
    description:
      "Calm, evidence-linked internship and job offer analysis. Spot upfront deposits, urgent deadlines, and missing terms before you pay or share documents.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${TAGLINE}`,
    description:
      "Calm, evidence-linked internship and job offer analysis. Spot upfront deposits, urgent deadlines, and missing terms before you pay or share documents.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--text)] transition-colors">
        <SessionProvider>
          <ScrollToTop />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
