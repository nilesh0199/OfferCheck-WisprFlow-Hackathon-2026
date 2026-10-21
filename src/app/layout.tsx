import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, TAGLINE } from "@/lib/config";
import { THEME_INLINE_SCRIPT } from "@/lib/theme";
import { SessionProvider } from "@/components/SessionProvider";
import { ScrollToTop } from "@/components/ScrollToTop";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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
      data-theme="light"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#10263f" />
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INLINE_SCRIPT,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--text)] transition-colors">
        <SessionProvider>
          <ScrollToTop />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
