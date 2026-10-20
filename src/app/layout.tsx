import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NoticeBridge | School Circular & Parent Communication Engine",
  description:
    "AI-powered platform that transforms dense school circulars into 30-second WhatsApp parent updates, multi-language translations, and actionable checklists.",
  keywords: ["school notice", "parent communication", "whatsapp circular", "edtech", "school AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏫</text></svg>" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
