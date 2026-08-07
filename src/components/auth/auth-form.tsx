"use client";

import { useAppAuth } from "@/src/components/auth/app-auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const auth = useAppAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const redirect = searchParams.get("redirect") || "/chat";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);

    const result = mode === "login" ? await auth.signIn(username, password) : await auth.register(username, password);

    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push(redirect);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={pending} className="flex w-full max-w-80 flex-col items-center gap-3">
      <input
        type="text"
        placeholder="Username"
        aria-label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        aria-invalid={!!error}
        aria-describedby={error ? "auth-error" : undefined}
        className="neu-inset bg-surface-container-low text-on-surface focus-visible:ring-primary/40 h-11 w-full rounded-lg border px-3 text-sm focus-visible:ring-2"
      />
      <input
        type="password"
        placeholder="Password"
        aria-label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        aria-invalid={!!error}
        aria-describedby={error ? "auth-error" : undefined}
        className="neu-inset bg-surface-container-low text-on-surface focus-visible:ring-primary/40 h-11 w-full rounded-lg border px-3 text-sm focus-visible:ring-2"
      />
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="neu-primary-button bg-primary text-on-primary flex h-12 w-full items-center justify-center rounded-xl text-base font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? mode === "login"
            ? "Signing in…"
            : "Creating account…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>
      {error && (
        <p id="auth-error" role="alert" aria-live="assertive" className="text-error text-center text-xs">
          {error}
        </p>
      )}
      <p className="text-muted text-xs">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
