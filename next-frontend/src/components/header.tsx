"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
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
          <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search posts..." className="w-full bg-background pl-8 pr-4" />
          </div>
        </div>

        <nav
          className={cn(
            "absolute left-0 right-0 top-16 z-50 flex flex-col gap-4 border-b border-border/40 bg-background p-4 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0",
            isMenuOpen ? "block" : "hidden md:flex",
          )}
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className={cn(pathname === "/" && "bg-accent text-accent-foreground")}>
              Home
            </Button>
          </Link>
          <a href="https://dervisgenc.com" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="sm"

            >
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
          <Button variant="ghost" size="icon" className="md:hidden">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
