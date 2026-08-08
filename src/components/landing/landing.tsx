"use client";

// Landing page (Persuade mode). Bold, direct, product-forward.
import { useAppAuth } from "@/src/components/auth/app-auth";
import { Icon } from "@/src/components/icons";
import { ProductMock } from "@/src/components/landing/product-mock";
import { useReveal } from "@/src/components/landing/reveal";
import { TopoTexture } from "@/src/components/landing/topo-texture";
import { ThemeToggle } from "@/src/components/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function useParallax(): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 639px)").matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

function CourseSearchGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" className="text-primary">
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={7 + col * 6}
            cy={10 + row * 6}
            r="1.6"
            fill={row === 0 ? "currentColor" : "var(--outline-variant)"}
          />
        )),
      )}
    </svg>
  );
}

function TuitionGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" className="text-primary" fill="none">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 8.5v15M19.5 11.5c-.7-1.1-2-1.7-3.5-1.7-2 0-3.6 1.1-3.6 2.9 0 3.9 7.2 2 7.2 5.9 0 1.8-1.6 2.9-3.6 2.9-1.5 0-2.8-.6-3.5-1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RoutesGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" className="text-primary" fill="none">
      <path
        d="M7 24 C 12 22, 14 14, 20 10 C 22 8.6, 23.5 8, 25 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <circle cx="7" cy="24" r="3" fill="currentColor" />
      <circle cx="25" cy="8" r="3" fill="currentColor" />
    </svg>
  );
}

const CAPABILITIES = [
  {
    glyph: <CourseSearchGlyph />,
    label: "Courses",
    copy: "Search by subject, credits, or term. Full records with prerequisites from the catalog.",
  },
  {
    glyph: <TuitionGlyph />,
    label: "Tuition",
    copy: "Per-credit rates by program and student type. From the fee schedule, not estimates.",
  },
  {
    glyph: <RoutesGlyph />,
    label: "Routes",
    copy: "Walking distance between buildings drawn on the map. The real pedestrian path, computed.",
  },
] as const;

export function Landing() {
  const auth = useAppAuth();
  const router = useRouter();
  const parallaxRef = useParallax();
  const revealMock = useReveal();
  const revealCapabilities = useReveal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (auth.status === "signedIn") {
      router.replace("/chat");
    } else if (auth.status === "signedOut") {
      delete document.documentElement.dataset.authPending;
    }
  }, [auth.status, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="auth-splash bg-background fixed inset-0 z-50 flex items-center justify-center">
        <div className="neu-panel bg-surface flex items-center gap-3 rounded-2xl px-6 py-4">
          <span className="bg-primary-container text-on-primary-container shadow-inset flex size-9 items-center justify-center rounded-xl">
            <Icon name="school" size={18} />
          </span>
          <span className="text-primary animate-pulse text-xl font-medium tracking-[-0.02em]">Reogent</span>
        </div>
      </div>

      <div className="landing-root bg-background text-on-surface overflow-hidden">
        <a
          href="#sign-in"
          className="focus:bg-surface-bright sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:shadow-md"
        >
          Skip to sign in
        </a>

        {/* Header */}
        <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
          <div
            className={`glass-neu pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-3 transition-[background-color,backdrop-filter] duration-200 sm:px-4 ${
              scrolled ? "bg-background/90 backdrop-blur-md" : "bg-background/55 backdrop-blur-sm"
            }`}
          >
            <a href="#top" className="group flex items-center gap-2 rounded-xl focus-visible:outline-offset-4">
              <span className="bg-surface text-primary flex size-8 items-center justify-center rounded-lg shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5">
                <Icon name="school" size={17} />
              </span>
              <span className="text-base font-medium tracking-[-0.02em]">Reogent</span>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/login"
                className="neu-button bg-surface text-on-surface-variant hover:text-on-surface flex h-9 items-center rounded-xl px-4 text-sm font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </header>

        <main id="top">
          {/* Hero */}
          <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pt-24 pb-16 sm:px-6">
            <div ref={parallaxRef} className="text-outline pointer-events-none absolute inset-[-15%] opacity-[0.22]">
              <TopoTexture className="h-full w-full opacity-10" />
            </div>

            <div className="relative flex max-w-4xl flex-col items-center text-center">
              <h1 className="max-w-[14ch] text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance">
                Your campus, one question away.
              </h1>
              <p className="text-on-surface-variant mt-6 max-w-lg text-lg leading-relaxed sm:mt-8">
                Type a question. Get an answer grounded in UBC course data, fee schedules, and the campus map.
              </p>
              <div id="sign-in" className="mt-8 flex scroll-mt-24 items-center gap-3 sm:mt-10">
                <Link
                  href="/signup"
                  className="neu-primary-button bg-primary text-on-primary flex h-12 items-center rounded-xl px-8 text-base font-medium"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="neu-button bg-surface text-on-surface-variant hover:text-on-surface flex h-12 items-center rounded-xl px-8 text-base font-medium"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="text-muted absolute bottom-8 flex flex-col items-center gap-2">
              <span className="animate-scroll-hint">
                <Icon name="down" size={16} />
              </span>
            </div>
          </section>

          {/* Product showcase */}
          <section className="bg-surface-container-low/40 px-3 py-24 sm:px-6 sm:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 max-w-2xl">
                <h2 className="text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">
                  You ask. It finds. The map shows.
                </h2>
                <p className="text-on-surface-variant mt-4 max-w-lg text-base leading-relaxed">
                  The agent calls real UBC data tools, not its training weights. If the answer involves a place, you see
                  the route.
                </p>
              </div>
              <div ref={revealMock} className="reveal-mock" style={{ transform: "perspective(1200px) rotateX(2deg)" }}>
                <ProductMock />
              </div>
            </div>
          </section>

          {/* Capabilities */}
          <section className="bg-background px-4 py-24 sm:px-6 sm:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 max-w-xl">
                <h2 className="text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">
                  Backed by real data.
                </h2>
                <p className="text-on-surface-variant mt-4 text-base leading-relaxed">
                  Same sources you would search. The agent reads them for you.
                </p>
              </div>
              <div
                ref={revealCapabilities}
                className="reveal neu-panel bg-surface grid overflow-hidden rounded-2xl sm:grid-cols-3"
              >
                {CAPABILITIES.map((cap) => (
                  <article
                    key={cap.label}
                    className="not-last:border-border-subtle flex flex-col items-start px-6 py-8 not-last:border-b sm:px-8 sm:py-10 sm:not-last:border-r sm:not-last:border-b-0"
                  >
                    <span className="neu-inset bg-surface-container-low flex size-12 items-center justify-center rounded-xl">
                      {cap.glyph}
                    </span>
                    <h3 className="text-on-surface mt-6 text-base font-medium">{cap.label}</h3>
                    <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">{cap.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Trust signals */}
          <section className="px-4 pb-24 sm:pb-32">
            <div className="text-muted mx-auto flex max-w-4xl items-center justify-center gap-4 text-center text-xs sm:gap-6">
              <span>UBC course data</span>
              <span className="bg-outline-variant size-1 rounded-full" aria-hidden="true" />
              <span>Updated each term</span>
              <span className="bg-outline-variant size-1 rounded-full" aria-hidden="true" />
              <span>Amazon Bedrock</span>
            </div>
          </section>

          {/* Final CTA */}
          <section className="px-4 pb-12 sm:px-6">
            <div className="neu-inset bg-surface-container-low relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-6 py-24 sm:py-28">
              <div className="text-outline pointer-events-none absolute inset-[-30%] opacity-[0.18]">
                <TopoTexture className="h-full w-full opacity-10" />
              </div>
              <div className="relative flex flex-col items-center text-center">
                <h2 className="text-[1.875rem] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
                  Skip the tab juggling.
                </h2>
                <p className="text-on-surface-variant mt-4 max-w-md text-base leading-relaxed">
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
                    className="neu-button bg-surface text-on-surface-variant hover:text-on-surface flex h-12 items-center rounded-xl px-8 text-base font-medium"
                  >
                    Sign in
                  </Link>
                </div>
                <p className="text-body-sm text-muted mt-4">Free to use</p>
              </div>
            </div>
            <p className="text-muted mt-10 text-center text-xs">Built for UBC CIC Hackathon 2026</p>
          </section>
        </main>
      </div>
    </>
  );
}
