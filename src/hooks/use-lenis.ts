import { useEffect } from "react";
import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

/** Smoothly scroll to a section id. Falls back to native scrolling. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: -96, duration: 0.9 });
  else el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** Lazy-loaded wheel smoothing; touch scrolling stays native. */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let destroyed = false;

    import("lenis").then(({ default: LenisCtor }) => {
      if (destroyed) return;
      const lenis = new LenisCtor({
        lerp: 0.14,
        smoothWheel: true,
        autoResize: true,
        allowNestedScroll: true,
        autoRaf: true,
      });
      lenisInstance = lenis;
    });

    return () => {
      destroyed = true;
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, []);
}
