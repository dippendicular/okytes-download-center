import { motion } from "motion/react";
import { Globe, ListOrdered, Puzzle } from "lucide-react";
import { BENTO, FEATURE_STATUS } from "@/lib/features";

const ICONS = { http: Globe, queue: ListOrdered, extensions: Puzzle };
const DETAILS = {
  http: {
    title: "HTTP & HTTPS",
    body: "Parallel byte-range transfers, retries with backoff, and server-aware throttling.",
    code: "Range: bytes=start-end",
  },
  queue: {
    title: "A persistent queue",
    body: "Organize transfers in one place and keep your queue across app restarts.",
    code: "queue → transfer → complete",
  },
  extensions: {
    title: "Browser handoff",
    body: "Send downloads from Chromium browsers or Firefox to the native desktop app.",
    code: "browser → desktop → transfer engine",
  },
};

export function Bento() {
  const available = BENTO.flatMap((group) => group.items).filter(
    (item) => FEATURE_STATUS[item.key] === "available",
  );
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="relative scroll-mt-24 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5">
        <p className="eyebrow mb-4">Inside Okytes</p>
        <h2 id="features-title" className="text-huge max-w-4xl">
          From link to local file.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {available.map((item, index) => {
            const key = item.key as keyof typeof DETAILS;
            const detail = DETAILS[key];
            const Icon = ICONS[key];
            if (!detail || !Icon) return null;
            return (
              <motion.article
                data-floating
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -8, scale: 1.015 }}
                className="glass flex min-w-0 flex-col rounded-3xl p-6 sm:p-8"
              >
                <Icon className="h-7 w-7 text-primary" aria-hidden />
                <h3 className="mt-6 font-display text-2xl font-semibold">{detail.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {detail.body}
                </p>
                <code className="mt-8 block break-words rounded-xl border border-border bg-background/60 p-3 font-mono text-[11px] text-primary">
                  {detail.code}
                </code>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
