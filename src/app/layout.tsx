import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted variable fonts (SIL Open Font License), so builds never depend on Google Fonts.
const serif = localFont({
  src: "./fonts/Literata.woff2",
  variable: "--font-serif",
  weight: "200 900",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const sans = localFont({
  src: [
    { path: "./fonts/PublicSans.woff2", style: "normal" },
    { path: "./fonts/PublicSans-Italic.woff2", style: "italic" },
  ],
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NoticeBridge — School circulars parents actually read",
    template: "%s · NoticeBridge",
  },
  description:
    "Turn long school circulars into a WhatsApp message, a translation in the parents' language, key dates and a checklist — in seconds.",
  applicationName: "NoticeBridge",
  keywords: ["school circular", "parent communication", "WhatsApp notice", "school notice translation", "edtech India"],
  openGraph: {
    type: "website",
    title: "NoticeBridge — School circulars parents actually read",
    description:
      "Paste a circular. Get a WhatsApp-ready message, a translation, the key dates and a parent checklist.",
    siteName: "NoticeBridge",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1E4A3C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
