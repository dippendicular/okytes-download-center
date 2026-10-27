import { motion } from "motion/react";
import type { ReactNode } from "react";
import { FEATURE_STATUS, type FeatureKey } from "@/lib/features";
import {
  AdaptiveDemo,
  CrashDemo,
  EngineDemo,
  FreeDemo,
  HashDemo,
  MismatchDemo,
} from "./FeatureDemos";

const PANELS: { key?: FeatureKey; title: string; body: string; demo: ReactNode }[] = [
  {
    key: "crashSafe",
    title: "Durable checkpoints",
    body: "Recovery is designed around committed bytes, so progress reflects what is actually saved to disk.",
    demo: <CrashDemo />,
  },
  {
    key: "safeResume",
    title: "Source-aware resume",
    body: "Planned validator checks reject a changed source instead of combining bytes from different file versions.",
    demo: <MismatchDemo />,
  },
  {
    key: "verified",
    title: "Integrity before completion",
    body: "The planned SHA-256 gate compares the expected digest before publishing a completed file.",
    demo: <HashDemo />,
  },
  {
    key: "adaptive",
    title: "Measured concurrency",
    body: "Planned engine tuning uses observed throughput to allocate workers, within server and network limits.",
    demo: <AdaptiveDemo />,
  },
  {
    key: "sharedInfra",
    title: "One engine, many clients",
    body: "A shared transfer core is the architectural target for desktop, browser, CLI and local API workflows.",
    demo: <EngineDemo />,
  },
  {
    title: "Free and open source",
    body: "No trial countdown or license key. Inspect the code, report a bug, or build the workflow you need.",
    demo: <FreeDemo />,
  },
];

export function FeatureTrack() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5">
        <p className="eyebrow mb-4">Engineering principles</p>
        <h2 id="features-title" className="text-huge max-w-4xl">
          Built for more than a speed test.
        </h2>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Reliable transfers need explicit recovery rules, integrity checks, and control over
          resources. Explore the engine direction below; planned capabilities are labeled.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PANELS.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              whileHover={{ y: -5 }}
              className="glass flex min-w-0 flex-col rounded-[2rem] p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-primary">0{i + 1} / ENGINE</span>
                <span className="chip">{p.key ? FEATURE_STATUS[p.key] : "available"}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <div className="mt-6 flex min-h-64 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background/50 p-5">
                {p.demo}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
