"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useDebounce } from "@/hooks/use-debounce"

export default function SearchInput() {
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(searchQuery, 300) // Slightly increased debounce
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const isInitialMount = useRef(true);

    // Effect to trigger navigation based on debounced query
    useEffect(() => {
        const currentQuery = searchParams.get('q')

        if (debouncedSearchQuery) {
            if (pathname !== '/search' || (pathname === '/search' && debouncedSearchQuery !== currentQuery)) {
                router.push(`/search?q=${encodeURIComponent(debouncedSearchQuery)}`)
            }
        } else if (pathname === '/search' && currentQuery) {
            router.push('/')
        }

    }, [debouncedSearchQuery, router, pathname, searchParams])

    // Handle form submission (e.g., pressing Enter)
    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (searchQuery.trim()) {
            // Prevent pushing the same query again if already on search page
            if (pathname !== '/search' || searchQuery.trim() !== searchParams.get('q')) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            }
        } else if (pathname === '/search') {
            router.push('/')
        }
    }

    // Effect to sync input value with URL parameters
    useEffect(() => {
        const queryFromParams = searchParams.get('q') || ''

        if (pathname === '/search') {
            // Update input only if it differs from URL param
            // This helps with back/forward navigation syncing
            if (searchQuery !== queryFromParams) {
                setSearchQuery(queryFromParams)
            }
        } else {
            // Optionally clear input when navigating away from search
            // setSearchQuery('');
        }

        isInitialMount.current = false;
    }, [pathname, searchParams]) // Removed searchQuery dependency to avoid loops

    return (
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search posts..."
                className="w-full bg-background pl-8 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </form>
    )
}

// Simple fallback component
export function SearchInputFallback() {
    return (
        <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search posts..."
                className="w-full bg-background pl-8 pr-4"
                disabled // Disable input in fallback
            />
        </div>
    )
}
