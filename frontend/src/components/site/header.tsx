import { Rss } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonClasses } from "@/components/ui/button";
import { site } from "@/lib/config";

import { SearchForm } from "./search-form";
import { ThemeToggle } from "./theme-toggle";

const navLinkClasses =
  "rounded-md px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2" aria-label={`${site.title} — home`}>
          <span className="font-semibold tracking-tight">{site.title}</span>
          <span className="font-mono text-xs text-teal-600 transition-colors group-hover:text-teal-500 dark:text-teal-400">
            /{site.subtitle.toLowerCase()}
          </span>
        </Link>

        <nav aria-label="Main" className="ml-2 hidden items-center sm:flex">
          <Link href="/" className={navLinkClasses}>
            Posts
          </Link>
          <a href={site.aboutUrl} className={navLinkClasses}>
            About
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden w-56 md:block">
            <Suspense>
              <SearchForm />
            </Suspense>
          </div>
          <a href="/rss.xml" className={buttonClasses("ghost", "icon")} aria-label="RSS feed" title="RSS feed">
            <Rss className="size-4" aria-hidden />
          </a>
          <ThemeToggle />
        </div>
      </div>
      <div className="border-t border-zinc-200/70 px-4 py-2 md:hidden dark:border-zinc-800/70">
        <div className="flex items-center gap-2">
          <nav aria-label="Main mobile" className="flex items-center sm:hidden">
            <Link href="/" className={navLinkClasses}>
              Posts
            </Link>
            <a href={site.aboutUrl} className={navLinkClasses}>
              About
            </a>
          </nav>
          <div className="flex-1">
            <Suspense>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
