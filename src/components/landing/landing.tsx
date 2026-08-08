"use client";

import { useAppAuth } from "@/src/components/auth/app-auth";
import { Icon } from "@/src/components/icons";
import { ProductMock } from "@/src/components/landing/product-mock";
import { useReveal } from "@/src/components/landing/reveal";
import { TopoTexture } from "@/src/components/landing/topo-texture";
import { ThemeToggle } from "@/src/components/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Landing() {
  const { status } = useAppAuth();
  const router = useRouter();
  const revealMock = useReveal();
  const revealCaps = useReveal();
  const revealCta = useReveal();

  useEffect(() => {
    if (status === "signedIn") {
      router.replace("/chat");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "signedOut") {
      delete document.documentElement.dataset.authPending;
    }
  }, [status]);

  if (status === "initializing") {
    return (
      <div className="auth-splash bg-background fixed inset-0 z-50 flex items-center justify-center">
        <div className="neu-panel bg-surface flex items-center gap-3 rounded-2xl px-6 py-4">
          <span className="bg-primary-container text-on-primary-container shadow-inset flex size-9 items-center justify-center rounded-xl">
            <Icon name="school" size={18} />
          </span>
          <span className="text-primary animate-pulse text-xl font-medium tracking-[-0.02em]">Reogent</span>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-root bg-background text-on-surface overflow-hidden">
      {/* Skip link */}
      <a
        href="#main"
        className="bg-primary text-on-primary fixed top-2 left-2 z-[60] rounded-lg px-4 py-2 text-sm font-medium opacity-0 focus:opacity-100"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Reogent home">
          <span className="bg-primary-container text-on-primary-container flex size-8 items-center justify-center rounded-xl">
            <Icon name="school" size={16} />
          </span>
          <span className="text-on-surface text-sm font-medium tracking-[-0.02em]">Reogent</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="neu-button bg-surface text-on-surface rounded-xl px-4 py-2 text-sm font-medium"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main */}
      <main id="main">
        {/* Hero */}
        <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-16 pb-20">
          <TopoTexture className="text-on-surface pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]" />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
            <h1 className="text-on-surface text-4xl leading-[1.1] font-medium tracking-[-0.03em] sm:text-5xl md:text-6xl">
              Ask UBC anything.
              <br />
              <span className="text-primary">Get a real answer.</span>
            </h1>

            <p className="text-on-surface-variant mt-5 max-w-md text-base leading-relaxed sm:text-lg">
              Courses, tuition, walking routes, deadlines. Reogent searches indexed campus data and responds with facts
              you can trust.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/signup"
                className="neu-primary-button bg-primary text-on-primary rounded-xl px-6 py-3 text-sm font-medium"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="neu-button bg-surface text-on-surface rounded-xl px-6 py-3 text-sm font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Icon name="down" size={20} className="text-muted animate-scroll-hint" />
          </div>
        </section>

        {/* Product proof */}
        <section className="relative px-4 py-16 sm:py-24">
          <div ref={revealMock} className="reveal-mock mx-auto max-w-[1000px]">
            <ProductMock />
          </div>
          <p className="text-muted mt-6 text-center text-sm">
            You ask a question. Reogent retrieves the answer from real UBC data and shows you on a map when it helps.
          </p>
        </section>

        {/* Capabilities */}
        <section className="px-4 py-16 sm:py-24">
          <div ref={revealCaps} className="reveal mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
            <div className="neu-panel bg-surface rounded-2xl p-6">
              <span className="bg-primary-container text-on-primary-container mb-4 flex size-10 items-center justify-center rounded-xl">
                <Icon name="search" size={20} />
              </span>
              <h3 className="text-on-surface text-sm font-medium">Grounded in data</h3>
              <p className="text-on-surface-variant text-body-sm mt-1.5 leading-relaxed">
                Every answer traces back to official UBC sources. Course catalogs, fee schedules, academic calendars.
              </p>
            </div>

            <div className="neu-panel bg-surface rounded-2xl p-6">
              <span className="bg-primary-container text-on-primary-container mb-4 flex size-10 items-center justify-center rounded-xl">
                <Icon name="route" size={20} />
              </span>
              <h3 className="text-on-surface text-sm font-medium">Campus-aware maps</h3>
              <p className="text-on-surface-variant text-body-sm mt-1.5 leading-relaxed">
                Ask "how do I get to Buchanan?" and see the walking route. The map activates when distance matters.
              </p>
            </div>

            <div className="neu-panel bg-surface rounded-2xl p-6">
              <span className="bg-primary-container text-on-primary-container mb-4 flex size-10 items-center justify-center rounded-xl">
                <Icon name="chat1" size={20} />
              </span>
              <h3 className="text-on-surface text-sm font-medium">Plain conversation</h3>
              <p className="text-on-surface-variant text-body-sm mt-1.5 leading-relaxed">
                No dropdowns, no portals, no five-tab searches. Type your question like you would text a friend.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative px-4 py-16 sm:py-24">
          <TopoTexture className="text-on-surface pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]" />
          <div ref={revealCta} className="reveal relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
            <h2 className="text-on-surface text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
              Your next semester starts with a question.
            </h2>
            <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">
              Create a free account and ask your first one.
            </p>
            <Link
              href="/signup"
              className="neu-primary-button bg-primary text-on-primary mt-6 rounded-xl px-6 py-3 text-sm font-medium"
            >
              Sign up free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-border-subtle border-t px-4 py-6 text-center">
        <p className="text-muted text-xs">
          Built for UBC students. Not affiliated with the University of British Columbia.
        </p>
      </footer>
    </div>
  );
}
