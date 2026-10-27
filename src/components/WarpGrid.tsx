import { useEffect, useRef } from "react";

/** Canvas grid that bulges away from the cursor. Static for reduced motion. */
export function WarpGrid({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let color = getComputedStyle(document.documentElement).getPropertyValue("--line").trim();
    let accent = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    const GAP = 56;
    const RADIUS = 220;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const target = { x: -9999, y: -9999 };
    const cur = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const warp = (x: number, y: number): [number, number] => {
      const dx = x - cur.x;
      const dy = y - cur.y;
      const d = Math.hypot(dx, dy);
      if (d > RADIUS || d === 0) return [x, y];
      const f = (1 - d / RADIUS) ** 2 * 28;
      return [x + (dx / d) * f, y + (dy / d) * f];
    };

    const line = (pts: [number, number][], near: boolean) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = near ? accent : color;
      ctx.globalAlpha = near ? 0.18 : 1;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      const step = 14;
      for (let x = 0; x <= w; x += GAP) {
        const pts: [number, number][] = [];
        for (let y = 0; y <= h + step; y += step) pts.push(warp(x, y));
        line(pts, Math.abs(x - cur.x) < RADIUS);
      }
      for (let y = 0; y <= h; y += GAP) {
        const pts: [number, number][] = [];
        for (let x = 0; x <= w + step; x += step) pts.push(warp(x, y));
        line(pts, Math.abs(y - cur.y) < RADIUS);
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      cur.x += (target.x - cur.x) * 0.12;
      cur.y += (target.y - cur.y) * 0.12;
      draw();
      if (Math.abs(target.x - cur.x) > 0.5 || Math.abs(target.y - cur.y) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      const r = canvas.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      if (cur.x < -9000) {
        cur.x = target.x;
        cur.y = target.y;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(() => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--line").trim();
      accent = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
    });
    io.observe(canvas);
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });
    resize();

    return () => {
      ro.disconnect();
      themeObserver.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
