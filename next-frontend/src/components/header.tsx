"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons"
import SearchInput, { SearchInputFallback } from "./search-input"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <Cross2Icon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              Cyber<span className="text-cyan-500">Tron</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:justify-center md:px-4">
          <Suspense fallback={<SearchInputFallback />}>
            <SearchInput />
          </Suspense>
        </div>

        <nav
          className={cn(
            "absolute left-0 right-0 top-14 z-50 flex flex-col gap-4 border-b border-border/40 bg-background p-4 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0",
            isMenuOpen ? "block" : "hidden md:flex",
          )}
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className={cn(pathname === "/" && "bg-accent text-accent-foreground")}>
              Home
            </Button>
          </Link>
          <a href="https://dervisgenc.com" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              About
            </Button>
          </a>
          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className={cn(pathname === "/admin" && "bg-accent text-accent-foreground")}
            >
              Admin
            </Button>
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => alert('Mobile search TBD')}>
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
