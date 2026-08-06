"use client";

// Surface 1 — the landing page (Persuade). Cinematic scroll: hero → proof at
// scale → three specifics → trust → close. See UX_SPEC.md "Surface 1".

import { useAppAuth } from "@/src/components/auth/app-auth";
import { Icon } from "@/src/components/icons";
import { ProductMock } from "@/src/components/landing/product-mock";
import { useReveal } from "@/src/components/landing/reveal";
import { SignInButton } from "@/src/components/landing/sign-in-button";
import { TopoTexture } from "@/src/components/landing/topo-texture";
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
        node.style.transform = `translateY(${window.scrollY * 0.3}px)`;
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
      <path d="M7 24 C 12 22, 14 14, 20 10 C 22 8.6, 23.5 8, 25 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" />
      <circle cx="7" cy="24" r="3" fill="currentColor" />
      <circle cx="25" cy="8" r="3" fill="currentColor" />
    </svg>
  );
}

const CAPABILITIES = [
  {
    glyph: <CourseSearchGlyph />,
    label: "Course search",
    copy: "Find courses by subject, credits, or prerequisites. Filter to exactly what fits your schedule.",
  },
  {
    glyph: <TuitionGlyph />,
    label: "Tuition lookup",
    copy: "Per-credit rates by program, student type, and cohort year. No more PDF hunting.",
  },
  {
    glyph: <RoutesGlyph />,
    label: "Campus routes",
    copy: "Walking distance and time between any two buildings. See the route on a real map.",
  },
] as const;

export function Landing() {
  const auth = useAppAuth();
  const router = useRouter();
  const parallaxRef = useParallax();
  const revealMock = useReveal();
  const revealCard = useReveal();
  const [scrolled, setScrolled] = useState(false);

  // Returning signed-in users go straight to /chat (splash covers the swap).
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
      {/* Splash for returning users, shown pre-paint via html[data-auth-pending] */}
      <div className="auth-splash fixed inset-0 z-50 flex items-center justify-center bg-background">
        <span className="animate-pulse text-xl font-medium tracking-[-0.02em] text-primary">UBC Assistant</span>
      </div>

      <div className="landing-root bg-background text-on-surface">
        <a
          href="#sign-in"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-bright focus:px-4 focus:py-2 focus:shadow-md"
        >
          Skip to sign in
        </a>

        {/* Minimal top bar: transparent until scroll */}
        <header
          className={`fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-5 transition-all duration-200 sm:px-8 ${
            scrolled ? "border-b border-border-subtle bg-background/80 backdrop-blur-md" : "border-b border-transparent"
          }`}
        >
          <span className="text-[15px] font-medium tracking-[-0.02em]">UBC Assistant</span>
          <button
            type="button"
            onClick={() => (auth.configured ? auth.signIn() : undefined)}
            className="h-9 rounded-lg px-4 text-sm font-medium text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high hover:text-on-surface"
          >
            Sign in
          </button>
        </header>

        {/* SECTION 1 — HERO */}
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, var(--accent-subtle) 0%, transparent 70%)" }}
          />
          <div ref={parallaxRef} className="pointer-events-none absolute inset-[-15%] text-outline opacity-[0.35]">
            <TopoTexture className="h-full w-full opacity-10" />
          </div>

          <div className="relative flex max-w-2xl flex-col items-center text-center">
            <h1 className="text-[2.5rem] font-medium leading-[1.15] tracking-[-0.03em] sm:text-[3.5rem]">
              Know your campus.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-on-surface-variant sm:text-lg">
              Courses, prerequisites, tuition, walking routes—answered instantly from real UBC data.
            </p>
            <div id="sign-in" className="mt-10 flex w-full justify-center">
              <SignInButton />
            </div>
            <p className="mt-4 text-body-sm text-muted">Free to use · Sign in with Google</p>
          </div>

          <div className="absolute bottom-8 animate-scroll-hint text-muted" aria-hidden="true">
            <Icon name="down" size={20} />
          </div>
        </section>

        {/* SECTION 2 — PRODUCT SHOWCASE */}
        <section className="border-y border-border-subtle bg-surface-bright py-20 dark:bg-surface-container-lowest sm:py-30">
          <h2 className="mb-8 text-center text-body-sm uppercase tracking-[0.05em] text-muted">See it in action</h2>
          <div ref={revealMock} className="reveal-mock" style={{ transform: "perspective(1200px) rotateX(2deg)" }}>
            <ProductMock />
          </div>
        </section>

        {/* SECTION 3 — CAPABILITIES */}
        <section className="bg-background py-16 sm:py-25">
          <h2 className="mb-12 text-center text-body-sm uppercase tracking-[0.05em] text-muted">What it knows</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 px-5 sm:grid-cols-3">
            {CAPABILITIES.map((cap, i) => (
              <article
                key={cap.label}
                ref={revealCard}
                className="reveal flex flex-col items-start gap-4 rounded-[14px] border border-border-subtle bg-surface p-6 text-left sm:items-center sm:px-6 sm:py-7 sm:text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {cap.glyph}
                <h3 className="text-[15px] font-medium">{cap.label}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">{cap.copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 4 — TRUST STRIP */}
        <section className="border-y border-border-subtle bg-surface-bright py-10 dark:bg-surface-container-lowest">
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 text-center text-body-sm text-muted">
            <span>Built on UBC course data</span>
            <span aria-hidden="true">·</span>
            <span>Updated each term</span>
            <span aria-hidden="true">·</span>
            <span>Powered by Amazon Bedrock</span>
          </p>
        </section>

        {/* SECTION 5 — CLOSING CTA */}
        <section className="relative overflow-hidden bg-background pb-12 pt-20 sm:pt-30">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, var(--accent-subtle) 0%, transparent 70%)" }}
          />
          <div className="pointer-events-none absolute inset-[-20%] text-outline opacity-[0.3]">
            <TopoTexture className="h-full w-full opacity-10" />
          </div>
          <div className="relative flex flex-col items-center px-5 text-center">
            <h2 className="text-[2rem] font-medium tracking-[-0.02em]">Ready to ask?</h2>
            <p className="mt-3 text-base text-on-surface-variant">Your courses, your campus, one conversation.</p>
            <div className="mt-9 flex w-full justify-center">
              <SignInButton wide />
            </div>
            <p className="mt-3.5 text-body-sm text-muted">Sign in with your Google account. Free to use.</p>
            <p className="mt-12 text-xs text-muted">Built for UBC CIC Hackathon 2026</p>
          </div>
        </section>
      </div>
    </>
  );
}
