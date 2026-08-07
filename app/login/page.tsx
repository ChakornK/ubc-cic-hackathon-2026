"use client";

import { useAppAuth } from "@/src/components/auth/app-auth";
import { AuthForm } from "@/src/components/auth/auth-form";
import { Icon } from "@/src/components/icons";
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
    <div className="app-shell-canvas flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center">
        <span className="neu-raised bg-surface text-primary mb-6 flex size-14 items-center justify-center rounded-2xl border">
          <Icon name="school" size={27} />
        </span>
        <h1 className="text-on-surface mb-2 text-2xl font-medium tracking-[-0.02em]">Welcome back</h1>
        <p className="text-muted mb-8 text-sm">Sign in to continue to Reogent</p>
        <AuthForm mode="login" />
      </div>
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
