"use client";

// /chat mints a fresh client-side session id and replaces into it.
// (This is also the Cognito redirect_uri target; the auth callback params are
// stripped by the provider before this replace runs.)

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/chat/${crypto.randomUUID()}`);
  }, [router]);

  return null;
}
