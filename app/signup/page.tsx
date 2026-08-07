"use client";

import { useAppAuth } from "@/src/components/auth/app-auth";
import { AuthForm } from "@/src/components/auth/auth-form";
import { Icon } from "@/src/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function SignupContent() {
  const auth = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "signedIn") router.replace("/chat");
  }, [auth.status, router]);

  if (auth.status === "initializing" || auth.status === "signedIn") {
    return null;
  }

  return (
    <div className="app-shell-canvas flex min-h-svh flex-col px-4 py-8">
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
          <Link href="/" className="mb-6 flex flex-col items-center gap-2">
            <span className="neu-raised bg-surface text-primary flex size-14 items-center justify-center rounded-2xl border">
              <Icon name="school" size={27} />
            </span>
          </Link>
          <h1 className="text-on-surface mb-2 text-2xl font-medium tracking-[-0.02em]">Create an account</h1>
          <p className="text-muted mb-8 text-sm">Sign up to start using Reogent</p>
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
