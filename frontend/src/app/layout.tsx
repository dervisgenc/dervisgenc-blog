import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { site, siteUrl } from "@/lib/config";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${site.title} · ${site.subtitle}`, template: `%s · ${site.title}` },
    description: site.description,
    authors: [{ name: site.author, url: site.aboutUrl }],
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.title} · ${site.subtitle}` }] },
    },
    openGraph: { type: "website", siteName: `${site.title} · ${site.subtitle}`, locale: "en_US" },
    twitter: { card: "summary_large_image", creator: "@1sabredendervis" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
