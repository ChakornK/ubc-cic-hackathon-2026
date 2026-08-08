"use client";

import { useAppAuth } from "@/src/components/auth/app-auth";
import { Icon } from "@/src/components/icons";
import { ProductMock } from "@/src/components/landing/product-mock";
import { useReveal } from "@/src/components/landing/reveal";
import { TopoTexture } from "@/src/components/landing/topo-texture";
import { ThemeToggle } from "@/src/components/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Landing() {
  const { status } = useAppAuth();
  const router = useRouter();
  const revealMock = useReveal(0.15);
  const revealFeatures = useReveal();
  const revealCta = useReveal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (status === "signedIn") router.replace("/chat");
  }, [status, router]);

  useEffect(() => {
    if (status === "signedOut") delete document.documentElement.dataset.authPending;
  }, [status]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <a
        href="#main"
        className="bg-primary text-on-primary fixed top-2 left-2 z-[60] rounded-lg px-4 py-2 text-sm font-medium opacity-0 focus:opacity-100"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
        <nav
          className={`pointer-events-auto mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl px-4 transition-all duration-200 ${
            scrolled ? "glass-neu" : ""
          }`}
        >
          <Link href="/" className="flex items-center gap-2" aria-label="Reogent home">
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
        </nav>
      </header>

      <main id="main">
        {/* Hero + Product in one flow */}
        <section className="relative min-h-[100dvh] px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
          <TopoTexture className="text-on-surface pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]" />

          <div className="relative z-10 mx-auto max-w-5xl">
            {/* Headline */}
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl leading-[1.05] font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Ask UBC anything.
                <br />
                <span className="text-primary">Get a real answer.</span>
              </h1>
              <p className="text-on-surface-variant mx-auto mt-6 max-w-md text-base leading-relaxed sm:text-lg">
                Courses, tuition, walking routes, deadlines. Reogent searches indexed campus data and responds with
                facts you can trust.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3 sm:mt-10">
                <Link
                  href="/signup"
                  className="neu-primary-button bg-primary text-on-primary flex h-12 items-center rounded-xl px-8 text-base font-medium"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="neu-button bg-surface text-on-surface flex h-12 items-center rounded-xl px-8 text-base font-medium"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Product mock — integrated into hero as proof */}
            <div ref={revealMock} className="reveal-mock mt-16 sm:mt-20">
              <ProductMock />
            </div>
          </div>
        </section>

        {/* Features — not cards, just statements with weight */}
        <section className="px-4 py-24 sm:px-6 sm:py-32">
          <div ref={revealFeatures} className="reveal mx-auto max-w-3xl">
            <h2 className="text-on-surface text-center text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
              Backed by real data. Drawn on a real map.
            </h2>

            <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8">
              <div className="text-center sm:text-left">
                <Icon name="search" size={24} className="text-primary mx-auto sm:mx-0" />
                <p className="text-on-surface mt-3 text-sm font-medium">Grounded answers</p>
                <p className="text-on-surface-variant mt-1 text-sm leading-relaxed">
                  Traces back to official UBC sources. Course catalogs, fee schedules, academic calendars.
                </p>
              </div>
              <div className="text-center sm:text-left">
                <Icon name="route" size={24} className="text-primary mx-auto sm:mx-0" />
                <p className="text-on-surface mt-3 text-sm font-medium">Campus-aware</p>
                <p className="text-on-surface-variant mt-1 text-sm leading-relaxed">
                  Ask how to get somewhere and see the walking route drawn on the map. The real path, computed.
                </p>
              </div>
              <div className="text-center sm:text-left">
                <Icon name="chat1" size={24} className="text-primary mx-auto sm:mx-0" />
                <p className="text-on-surface mt-3 text-sm font-medium">One conversation</p>
                <p className="text-on-surface-variant mt-1 text-sm leading-relaxed">
                  No portals, no five-tab searches. Type your question like you would text a friend.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div
            ref={revealCta}
            className="reveal neu-inset bg-surface-container-low relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] px-6 py-20 sm:px-12 sm:py-24"
          >
            <TopoTexture className="text-on-surface pointer-events-none absolute inset-[-20%] h-[140%] w-[140%] opacity-[0.025]" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="max-w-sm text-2xl font-medium tracking-[-0.025em] text-balance sm:text-3xl lg:text-4xl">
                Skip the tab juggling.
              </h2>
              <p className="text-on-surface-variant mt-4 max-w-sm text-base leading-relaxed">
                One conversation replaces the course catalog, tuition calculator, and campus map.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Link
                  href="/signup"
                  className="neu-primary-button bg-primary text-on-primary flex h-12 items-center rounded-xl px-8 text-base font-medium"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="neu-button bg-surface text-on-surface flex h-12 items-center rounded-xl px-8 text-base font-medium"
                >
                  Sign in
                </Link>
              </div>
              <p className="text-muted mt-4 text-xs">Free to use</p>
            </div>
          </div>
          <p className="text-muted mt-8 text-center text-xs">Built for UBC CIC Hackathon 2026</p>
        </section>
      </main>
    </div>
  );
}
