"use client";

import { useEffect } from "react";

import { engagement } from "@/lib/browser-api";

/** Records one view per page load; the backend deduplicates per visitor and day. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    engagement.recordView(slug).catch(() => {
      // Statistics are best effort; never bother the reader with failures.
    });
  }, [slug]);

  return null;
}
