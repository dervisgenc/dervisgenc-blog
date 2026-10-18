"use client";

import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { admin, ApiError } from "@/lib/browser-api";
import { site } from "@/lib/config";

import { safeNextPath } from "./session";

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Invalid username or password.";
    if (error.status === 429) return "Too many attempts. Wait a minute and try again.";
    return error.message;
  }
  return "Could not reach the server.";
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Skip the form when a session is still valid.
  useEffect(() => {
    admin
      .session()
      .then(() => router.replace(next))
      .catch(() => {
        // Not logged in; show the form.
      });
  }, [router, next]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await admin.login(username.trim(), password);
      router.replace(next);
    } catch (cause) {
      setError(loginErrorMessage(cause));
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm p-6 shadow-sm">
      <div className="mb-6 space-y-2 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
          <LockKeyhole className="size-5" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Admin login</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {site.title} · {site.subtitle}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username" htmlFor="username">
          <Input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoFocus
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">
          ← Back to the blog
        </Link>
      </p>
    </Card>
  );
}
