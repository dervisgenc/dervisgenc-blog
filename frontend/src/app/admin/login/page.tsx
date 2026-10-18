import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
