import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the href for a page number, keeping the current filters. */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={buttonClasses("secondary", "sm")} rel="prev">
          <ChevronLeft className="size-4" aria-hidden /> Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        page {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={buttonClasses("secondary", "sm")} rel="next">
          Older <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
