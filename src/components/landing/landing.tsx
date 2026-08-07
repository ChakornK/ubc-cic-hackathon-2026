"use client";

// Surface 1 — the landing page (Persuade). A quiet, tactile introduction to
// the real chat-and-map product, with restrained motion and semantic depth.
import { useAppAuth } from "@/src/components/auth/app-auth";
import { Icon } from "@/src/components/icons";
import { ProductMock } from "@/src/components/landing/product-mock";
import { useReveal } from "@/src/components/landing/reveal";
import { TopoTexture } from "@/src/components/landing/topo-texture";
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
    label: "Course search",
    copy: "Filter by subject, credits, term, or prerequisite status. Returns full course records from the catalog.",
  },
  {
    glyph: <TuitionGlyph />,
    label: "Tuition lookup",
    copy: "Per-credit rates by program, student type, and cohort year. Sourced from the fee schedule, not estimated.",
  },
  {
    glyph: <RoutesGlyph />,
    label: "Campus routes",
    copy: "Walking distance and time between any two buildings, drawn on the map with the actual path.",
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

        <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
          <div
            className={`glass-neu pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border px-3 transition-[border-color,background-color,backdrop-filter] duration-200 sm:px-4 ${
              scrolled
                ? "border-border-subtle bg-background/90 backdrop-blur-md"
                : "bg-background/55 border-transparent backdrop-blur-sm"
            }`}
          >
            <a href="#top" className="group flex items-center gap-2.5 rounded-xl focus-visible:outline-offset-4">
              <span className="bg-surface text-primary border-border-subtle flex size-8 items-center justify-center rounded-lg border transition-transform duration-150 group-hover:-translate-y-0.5">
                <Icon name="school" size={17} />
              </span>
              <span className="text-base font-medium tracking-[-0.02em]">Reogent</span>
            </a>
            <Link
              href="/login"
              className="neu-button bg-surface text-on-surface-variant hover:text-on-surface flex h-9 items-center rounded-xl px-4 text-sm font-medium"
            >
              Sign in
            </Link>
          </div>
        </header>

        <main id="top">
          <section className="relative flex min-h-svh items-center justify-center px-5 pt-24 pb-20">
            <div ref={parallaxRef} className="text-outline pointer-events-none absolute inset-[-15%] opacity-[0.28]">
              <TopoTexture className="h-full w-full opacity-10" />
            </div>

            <div className="relative flex max-w-3xl flex-col items-center text-center">
              <h1 className="max-w-[12ch] text-[clamp(3rem,8vw,5.75rem)] leading-[0.98] font-medium tracking-[-0.04em] text-balance">
                Know your campus.
              </h1>
              <p className="text-on-surface-variant mt-8 max-w-xl text-base leading-relaxed">
                Ask about courses, tuition, prerequisites, or walking routes. Get answers pulled from actual UBC data.
              </p>
              <div id="sign-in" className="mt-10 flex w-full scroll-mt-24 items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="neu-primary-button bg-primary text-on-primary flex h-12 items-center justify-center rounded-xl px-7 text-base font-medium"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="neu-button bg-surface text-on-surface-variant hover:text-on-surface flex h-12 items-center justify-center rounded-xl px-7 text-base font-medium"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low/45 px-3 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">
                Chat meets campus map.
              </h2>
              <p className="text-on-surface-variant mx-auto mt-4 max-w-xl text-base leading-relaxed">
                Ask a question, get a sourced answer. If it involves a location, the map shows you where.
              </p>
            </div>
            <div
              ref={revealMock}
              className="reveal-mock py-3"
              style={{ transform: "perspective(1200px) rotateX(2deg)" }}
            >
              <ProductMock />
            </div>
          </section>

          <section className="bg-background px-5 py-20 sm:py-28">
            <div className="mx-auto max-w-5xl">
              <div className="mb-10 max-w-xl">
                <h2 className="text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">What it knows</h2>
                <p className="text-on-surface-variant mt-4 text-base leading-relaxed">
                  Pulls from the same course catalogs, tuition tables, and campus GeoJSON you'd search manually.
                </p>
              </div>
              <div
                ref={revealCapabilities}
                className="reveal neu-panel bg-surface grid overflow-hidden rounded-2xl sm:grid-cols-3"
              >
                {CAPABILITIES.map((cap) => (
                  <article
                    key={cap.label}
                    className="not-last:border-border-subtle flex flex-col items-start px-6 py-8 not-last:border-b sm:not-last:border-r sm:not-last:border-b-0"
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

          <section className="px-5 pb-20 sm:pb-28">
            <p className="text-muted mx-auto flex max-w-4xl items-center justify-center gap-3 text-center text-xs sm:gap-5">
              <span>Built on UBC course data</span>
              <span className="bg-outline-variant size-1 rounded-full" aria-hidden="true" />
              <span>Updated each term</span>
              <span className="bg-outline-variant size-1 rounded-full" aria-hidden="true" />
              <span>Powered by Amazon Bedrock</span>
            </p>
          </section>

          <section className="relative px-5 pb-12 sm:px-8">
            <div className="neu-inset bg-surface-container-low relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-6 py-20 sm:py-24">
              <div className="text-outline pointer-events-none absolute inset-[-30%] opacity-[0.22]">
                <TopoTexture className="h-full w-full opacity-10" />
              </div>
              <div className="relative flex flex-col items-center text-center">
                <h2 className="text-[1.875rem] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
                  Ready to ask?
                </h2>
                <p className="text-on-surface-variant mt-4 text-base">One chat. Courses, campus, costs.</p>
                <div className="mt-9 flex items-center justify-center gap-3">
                  <Link
                    href="/signup"
                    className="neu-primary-button bg-primary text-on-primary flex h-12 items-center justify-center rounded-xl px-7 text-base font-medium"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login"
                    className="neu-button bg-surface text-on-surface-variant hover:text-on-surface flex h-12 items-center justify-center rounded-xl px-7 text-base font-medium"
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
