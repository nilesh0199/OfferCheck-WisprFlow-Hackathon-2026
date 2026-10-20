import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME, TAGLINE } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${TAGLINE}`,
  description:
    "Internship-offer review assistant helping students identify questionable requests, see missing information, and prepare verification questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
