import { animate, useReducedMotion } from "motion/react";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/** Shared viewport observer and low-resolution canvas; no React updates per frame. */
export function SiteEffects() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const controls = new Set<ReturnType<typeof animate>>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.dataset["inView"] = String(entry.isIntersecting);
          if (!entry.isIntersecting || seen.has(el)) continue;
          seen.add(el);
          if (reduced) {
            el.style.opacity = "1";
            if (!el.matches("[data-floating]")) el.style.transform = "none";
            continue;
          }
          const control = el.matches("[data-floating]")
            ? animate(el, { opacity: [0.4, 1] }, { duration: 0.65 })
            : animate(
                el,
                { opacity: [0.2, 1], y: [22, 0] },
                { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              );
          controls.add(control);
          void control.then(() => controls.delete(control));
        }
      },
      { threshold: 0.08 },
    );
    const selector = "[data-floating], main section h2, .legal-content section";
    const observe = (scope: ParentNode) =>
      scope.querySelectorAll(selector).forEach((el) => observer.observe(el));
    observe(document);
    const mutations = new MutationObserver((entries) => {
      for (const entry of entries)
        for (const node of entry.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(selector)) observer.observe(node);
          observe(node);
        }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      controls.forEach((control) => control.stop());
    };
  }, [pathname, reduced]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d", { alpha: true });
    if (!el || !ctx) return;
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      scroll = 0;
    let color = "";
    let paths: { x: number; y: number; bend: number; end: number; speed: number }[] = [];
    const theme = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1;
      paths.forEach((path, i) => {
        const y = (path.y - scroll * 0.035 + height) % height;
        ctx.globalAlpha = 0.055;
        ctx.beginPath();
        ctx.moveTo(path.x - path.end, y);
        ctx.lineTo(path.x, y);
        ctx.lineTo(path.x, y + path.bend);
        ctx.lineTo(path.x + path.end, y + path.bend);
        ctx.stroke();
        const length = path.end * 2 + path.bend;
        const distance = reduced ? length * 0.42 : (time * path.speed + i * 51) % length;
        const x =
          distance < path.end
            ? path.x - path.end + distance
            : distance < path.end + path.bend
              ? path.x
              : path.x + distance - path.end - path.bend;
        const py =
          distance < path.end
            ? y
            : distance < path.end + path.bend
              ? y + distance - path.end
              : y + path.bend;
        ctx.globalAlpha = 0.28;
        ctx.fillRect(x - 2, py - 2, 4, 4);
        ctx.globalAlpha = 0.09;
        ctx.fillRect(x - 5, py - 5, 10, 10);
        if (i % 4 === 0) {
          ctx.globalAlpha = 0.18;
          ctx.font = "9px monospace";
          ctx.fillText(i % 2 ? "0101" : "1010", x + 10, py + 3);
        }
      });
      ctx.globalAlpha = 1;
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1 : 1.25);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paths = Array.from({ length: width < 768 ? 6 : 12 }, (_, i) => ({
        x: (i * 173 + 32) % width,
        y: (i * 131 + 60) % height,
        bend: 40 + (i % 4) * 34,
        end: 90 + (i % 3) * 45,
        speed: 0.028 + (i % 4) * 0.007,
      }));
      draw(performance.now());
    };
    const tick = (time: number) => {
      if (time - last >= (width < 768 ? 66 : 40)) {
        draw(time);
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      document.documentElement.dataset["pageVisible"] = String(!document.hidden);
      if (!document.hidden && !reduced) frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      scroll = window.scrollY;
    };
    theme();
    resize();
    visibility();
    const themeObserver = new MutationObserver(() => {
      theme();
      if (reduced) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", visibility);
      delete document.documentElement.dataset["pageVisible"];
    };
  }, [reduced]);
  return (
    <div className="site-data-flow" aria-hidden="true">
      <canvas ref={canvas} className="h-full w-full" />
    </div>
  );
}
