import { NextResponse, type NextRequest } from "next/server";

import { apiInternalUrl } from "@/lib/config";

// Forwards /api requests to the backend. In production nginx routes /api to
// the backend before requests reach Next.js; this keeps the browser on a
// single origin wherever the frontend runs on its own (development, a bare
// container). It runs at request time, so API_INTERNAL_URL is read from the
// runtime environment rather than baked in at build time.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  return NextResponse.rewrite(new URL(pathname + search, apiInternalUrl()));
}

export const config = {
  matcher: "/api/:path*",
};
