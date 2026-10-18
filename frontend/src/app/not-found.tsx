import { Compass } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Notice } from "@/components/site/notice";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-14 sm:px-6">
        <Notice icon={Compass} title="Page not found">
          <p>The page you are looking for does not exist or has been moved.</p>
          <Link href="/" className={buttonClasses("primary", "sm", "mt-6")}>
            Back to all posts
          </Link>
        </Notice>
      </main>
      <SiteFooter />
    </div>
  );
}
