import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Add metadataBase for resolving social media image URLs
  metadataBase: new URL("https://dervisgenc.com"),
  title: {
    default: "Derviş Genç | Computer Engineering Student",
    template: "%s – Derviş Genç",
  },
  description:
    "Personal portfolio, projects and blog of Derviş Genç – Computer Engineering student at Istanbul Technical University.",
  keywords: [
    "Derviş Genç",
    "Dervis Genc",
    "Bilgisayar Mühendisliği",
    "Computer Engineer",
    "Siber Güvenlik",
    "Cybersecurity",
    "Go developer",
  ],
  authors: [{ name: "Derviş Genç", url: "https://dervisgenc.com" }],
  openGraph: {
    type: "website",
    url: "https://dervisgenc.com",
    title: "Derviş Genç | Computer Engineering Student",
    description:
      "Portfolio and projects of Derviş Genç, focusing on Go, C/C++, cybersecurity and ROS 2.",
    images: [{ url: "/portre.jpg", width: 800, height: 800, alt: "Derviş Genç" }],
    locale: "en_US",
    alternateLocale: ["tr_TR"],
  },
  alternates: {
    canonical: "https://dervisgenc.com",
    languages: {
      tr: "https://dervisgenc.com", // “hreflang=tr” link’i üretir
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
