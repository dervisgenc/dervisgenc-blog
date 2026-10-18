// Runtime configuration. Both values are read on the server at request time
// so a single image works in every environment.

const DEFAULT_SITE_URL = "https://blog.dervisgenc.com";
const DEFAULT_API_INTERNAL_URL = "http://localhost:8080";

export function siteUrl(): string {
  return trimTrailingSlash(process.env.SITE_URL || DEFAULT_SITE_URL);
}

export function apiInternalUrl(): string {
  return trimTrailingSlash(process.env.API_INTERNAL_URL || DEFAULT_API_INTERNAL_URL);
}

/** Resolves a site-relative path such as /api/uploads/x.jpg to an absolute URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl() + (path.startsWith("/") ? path : `/${path}`);
}

export const site = {
  title: "Derviş Genç",
  subtitle: "Blog",
  description:
    "Notes on Linux, networking, Go, security and the systems I build and run — by Derviş Genç.",
  author: "Derviş Genç",
  aboutUrl: "https://dervisgenc.com",
  social: {
    github: "https://github.com/dervisgenc",
    linkedin: "https://www.linkedin.com/in/dervisgenc/",
    x: "https://x.com/1sabredendervis",
  },
} as const;

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
