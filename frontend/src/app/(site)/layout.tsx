import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow dark:focus:bg-zinc-900"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10 sm:px-6 sm:pt-14">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
