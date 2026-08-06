"use client";

// Scroll-reveal helper: sets `data-inview` once when the element crosses the
// threshold. CSS (.reveal / .reveal-mock) owns the animation; reduced-motion
// users get instant visibility via the media query in globals.css.

import { useCallback } from "react";

export function useReveal(threshold = 0.2): (node: HTMLElement | null) => void {
  return useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      if (typeof IntersectionObserver === "undefined") {
        node.dataset.inview = "";
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).dataset.inview = "";
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold },
      );
      observer.observe(node);
    },
    [threshold],
  );
}
