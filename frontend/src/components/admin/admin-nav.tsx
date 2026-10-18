"use client";

import { ExternalLink, FileText, LayoutDashboard, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { admin } from "@/lib/browser-api";
import { cn } from "@/lib/cn";

import { useSession } from "./session";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/posts/new", label: "New post", icon: Plus },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useSession();

  async function logout() {
    try {
      await admin.logout();
    } finally {
      router.replace("/admin/login");
    }
  }

  const isActive = (href: string) =>
    href === "/admin/posts" ? pathname === href || /^\/admin\/posts\/\d+$/.test(pathname) : pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/admin" className="mr-3 flex items-baseline gap-1.5">
          <span className="font-semibold tracking-tight">Admin</span>
          <span className="hidden font-mono text-xs text-zinc-500 sm:inline">@{session.username}</span>
        </Link>
        <nav aria-label="Admin" className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
                isActive(href)
                  ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              <Icon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ExternalLink className="size-4" aria-hidden />
            <span className="hidden md:inline">View site</span>
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
