"use client" // This page uses client-side hooks (useSearchParams)

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter
import PostList from '@/components/post-list';
import { PaginatedPostResponse, ErrorResponse } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api";

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Get router instance
    const query = searchParams.get('q');
    const [results, setResults] = useState<PaginatedPostResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1); // Add state for pagination

    useEffect(() => {
        // Redirect to home if the query becomes empty/null
        if (!query) {
            router.push('/');
            return; // Stop execution if redirecting
        }

        const fetchResults = async (page = 1) => {
            // No need to check for !query here anymore as it's handled above
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/posts/search?q=${encodeURIComponent(query)}&page=${page}&size=9`); // Add pagination params
                if (!response.ok) {
                    const errorData: ErrorResponse = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data: PaginatedPostResponse = await response.json();
                setResults(data);
                setCurrentPage(data.current_page); // Update current page from response
            } catch (err: any) {
                console.error("Failed to fetch search results:", err);
                setError(err.message || "Failed to load search results.");
                setResults(null); // Clear results on error
            } finally {
                setLoading(false);
            }
        };

        fetchResults(currentPage); // Fetch results for the current page
        // Add router to dependency array
    }, [query, currentPage, router]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };


    return (
        <div className="container py-6">
            {/* Only render content if query exists */}
            {query && (
                <>
                    <h1 className="mb-6 text-2xl font-bold md:text-3xl">
                        Search Results for "{query}"
                    </h1>

                    {loading && (
                        // Simple Skeleton Loading for PostList
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="space-y-3">
                                    <Skeleton className="h-[200px] w-full rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && <p className="text-red-500">Error: {error}</p>}

                    {!loading && !error && results && results.posts.length > 0 && (
                        <PostList
                            initialPosts={results.posts}
                            initialTotalPages={results.total_pages}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            searchQuery={query || undefined}
                        />
                    )}

                    {!loading && !error && (!results || results.posts.length === 0) && (
                        <p>No posts found matching your search query.</p>
                    )}
                </>
            )}
            {/* If query is null/empty, this part won't render due to the redirect */}
        </div>
    );
}


// Wrap SearchResults with Suspense for useSearchParams
export default function SearchPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SearchResults />
        </Suspense>
    );
}

// Optional: A more specific loading fallback for the Suspense boundary
function LoadingFallback() {
    return (
        <div className="container py-6">
            <Skeleton className="mb-6 h-8 w-1/2" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
