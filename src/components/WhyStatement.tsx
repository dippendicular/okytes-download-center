import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

const STATEMENT =
  "It's free. It's efficient. No trial expiry. Just a download manager that does its job.";
const HIGHLIGHT = new Set(["free.", "efficient.", "job."]);

export function WhyStatement() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.15 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: "[data-statement]",
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: section },
  );

  return (
    <section
      id="why"
      ref={section}
      aria-labelledby="why-title"
      className="relative scroll-mt-24 border-y border-border bg-surface/30 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <p id="why-title" className="eyebrow mb-8">
          Why Okytes
        </p>
        <p
          data-statement
          className="font-display text-[clamp(2.25rem,6vw,5.75rem)] font-semibold leading-[1] tracking-[-0.035em]"
        >
          {STATEMENT.split(" ").map((w, i) => (
            <span key={i} data-word className={HIGHLIGHT.has(w) ? "text-primary" : undefined}>
              {w}{" "}
            </span>
          ))}
        </p>
        <p className="mt-10 font-mono text-sm text-muted-foreground">
          Open source. Local by design. Yours to use, inspect, and improve.
        </p>
      </div>
    </section>
  );
}
