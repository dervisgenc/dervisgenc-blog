import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { cn } from "@/lib/utils"
import "@/app/global.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "CyberTron - Tech & Cybersecurity Blog",
  description: "Insights on cybersecurity, technology, and computer science topics",
  keywords: ["cybersecurity", "tech", "blog", "computer science"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blog.dervisgenc.com",
    title: "CyberTron - Tech & Cybersecurity Blog",
    description: "Insights on cybersecurity, technology, and computer science topics",
    siteName: "CyberTron",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}