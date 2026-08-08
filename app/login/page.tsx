"use client";

import { useAppAuth } from "@/src/components/auth/app-auth";
import { AuthForm } from "@/src/components/auth/auth-form";
import { Icon } from "@/src/components/icons";
import { ThemeToggle } from "@/src/components/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginContent() {
  const auth = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "signedIn") router.replace("/chat");
  }, [auth.status, router]);

  if (auth.status === "initializing" || auth.status === "signedIn") {
    return null;
  }

  return (
    <div className="auth-canvas flex min-h-svh flex-col px-4 py-8">
      <nav className="flex items-center">
        <Link
          href="/"
          className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors duration-150"
        >
          <Icon name="left" size={16} />
          <span>Home</span>
        </Link>
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="flex w-full max-w-sm flex-col items-center">
          <span className="neu-raised bg-surface text-primary mb-8 flex size-14 items-center justify-center rounded-2xl">
            <Icon name="school" size={27} />
          </span>
          <h1 className="text-on-surface mb-2 text-2xl font-medium tracking-[-0.02em]">Welcome back</h1>
          <p className="text-muted mb-6 text-sm">Sign in to continue to Reogent</p>
          <AuthForm mode="login" />
        </div>
      </div>
      <footer className="flex items-center justify-center pb-2">
        <ThemeToggle />
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
