"use client";

import { useAppAuth } from "@/src/components/auth/app-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignInButton({ wide = false }: { wide?: boolean }) {
  const auth = useAppAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);

    const result = mode === "login" ? await auth.signIn(username, password) : await auth.register(username, password);

    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/chat");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full flex-col items-center gap-3 ${wide ? "max-w-80" : "max-w-72"}`}
    >
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="neu-inset bg-surface-container-low text-on-surface h-10 w-full rounded-lg border px-3 text-sm"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        className="neu-inset bg-surface-container-low text-on-surface h-10 w-full rounded-lg border px-3 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="neu-primary-button bg-primary text-on-primary flex h-12 w-full items-center justify-center rounded-xl text-base font-medium disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
      {error && <p className="text-error text-center text-xs">{error}</p>}
      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="text-muted text-xs underline"
      >
        {mode === "login" ? "Create an account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
