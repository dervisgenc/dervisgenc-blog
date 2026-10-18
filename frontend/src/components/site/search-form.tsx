"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search posts"
        aria-label="Search posts"
        className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pr-3 pl-8 text-sm placeholder:text-zinc-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900"
      />
    </form>
  );
}
