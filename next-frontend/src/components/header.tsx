"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation" // Import useRouter and useSearchParams
import { useState, useEffect, FormEvent, useRef } from "react" // Import useEffect, FormEvent, and useRef
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useDebounce } from "@/hooks/use-debounce" // Import the debounce hook

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("") // State for search input
  const debouncedSearchQuery = useDebounce(searchQuery, 200) // Debounce search query
  const pathname = usePathname()
  const router = useRouter() // Get router instance
  const searchParams = useSearchParams() // Get search params
  const isInitialMount = useRef(true); // Ref to track initial mount

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Effect to trigger navigation based on debounced query
  useEffect(() => {
    const currentQuery = searchParams.get('q')

    if (debouncedSearchQuery) {
      // Navigate to search page if query exists and is different or not on search page
      if (pathname !== '/search' || (pathname === '/search' && debouncedSearchQuery !== currentQuery)) {
        router.push(`/search?q=${encodeURIComponent(debouncedSearchQuery)}`)
      }
    } else if (pathname === '/search' && currentQuery) { // Only redirect if there WAS a query
      // If debounced query is empty AND we are currently on the search page with a query, redirect to home
      router.push('/')
    }
    // If the debounced query is empty and we are NOT on the search page, do nothing.

  }, [debouncedSearchQuery, router, pathname, searchParams])

  // Handle form submission (e.g., pressing Enter)
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else if (pathname === '/search') {
      // If submitted empty on search page, go home
      router.push('/')
    }
  }

  // Effect to sync input value with URL parameters, less aggressively
  useEffect(() => {
    const queryFromParams = searchParams.get('q') || ''

    // On initial mount on the search page, set the input value
    if (pathname === '/search' && isInitialMount.current) {
      setSearchQuery(queryFromParams)
    }

    // After initial mount, only update if the URL param changes *externally*
    // and differs from the current input value. This allows typing/deleting.
    if (!isInitialMount.current && pathname === '/search' && queryFromParams !== searchQuery) {
      // Check if the change originates from URL navigation (e.g., back/forward)
      // This is tricky to detect perfectly, but comparing against debounced value might help
      // If the URL param matches the *debounced* value, it's likely a result of our own navigation, so don't update input.
      // If it *doesn't* match the debounced value, it's more likely external navigation.
      // However, a simpler approach for now is to just set it if it differs.
      // Let's refine if needed. For now, just update if different.
      // setSearchQuery(queryFromParams); // Re-enable this line if back/forward button sync is desired
    }

    // If navigating away from search, optionally clear the input
    if (pathname !== '/search') {
      // setSearchQuery(''); // Uncomment if you want to clear input when leaving /search
    }

    // Mark initial mount as false after the first run
    isInitialMount.current = false;

    // Dependency array: only run when pathname or searchParams change
  }, [pathname, searchParams]) // Removed searchQuery dependency


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between"> {/* Changed h-16 to h-14 */}
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
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="w-full bg-background pl-8 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query state directly
            />
          </form>
        </div>

        <nav
          className={cn(
            "absolute left-0 right-0 top-14 z-50 flex flex-col gap-4 border-b border-border/40 bg-background p-4 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0", // Changed top-16 to top-14
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

        {/* Mobile Search - Consider implementing a modal or separate view for mobile search */}
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
