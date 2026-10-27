import { useRef } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";

const PHRASE = "Own your downloads. Trust the result.";

function Row({ reverse }: { reverse?: boolean }) {
  return (
    <div data-row data-reverse={reverse ? "1" : "0"} className="flex w-max whitespace-nowrap will-change-transform">
      {Array.from({ length: 2 }).map((_, half) => (
        <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
          {Array.from({ length: 3 }).map((__, i) => (
            <span
              key={i}
              className={`px-6 font-display text-[clamp(3.5rem,10vw,10rem)] font-semibold leading-none tracking-[-0.04em] ${
                reverse ? "text-transparent [-webkit-text-stroke:1.5px_var(--primary)]" : "text-foreground"
              }`}
            >
              {PHRASE} <span className="text-primary">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** GSAP marquee with scroll-velocity skew + speed boost. */
export function Marquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
        const tweens = rows.map((row) => {
          const rev = row.dataset.reverse === "1";
          return gsap.fromTo(
            row,
            { xPercent: rev ? -50 : 0 },
            { xPercent: rev ? 0 : -50, duration: 40, ease: "none", repeat: -1 },
          );
        });
        const setSkew = gsap.quickSetter(rows, "skewX", "deg");
        let skew = 0;
        let speed = 1;
        let dir = 1;

        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            skew = gsap.utils.clamp(-12, 12, v / -300);
            speed = 1 + Math.min(Math.abs(v) / 1200, 4);
            dir = self.direction < 0 ? -1 : 1;
          },
          onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
        });

        const tick = () => {
          skew *= 0.9;
          speed += (1 - speed) * 0.05;
          setSkew(skew);
          tweens.forEach((t) => t.timeScale(speed * dir));
        };
        gsap.ticker.add(tick);
        return () => {
          st.kill();
          gsap.ticker.remove(tick);
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label={PHRASE} className="relative overflow-hidden border-y border-border py-12 sm:py-16">
      <div className="space-y-4">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
