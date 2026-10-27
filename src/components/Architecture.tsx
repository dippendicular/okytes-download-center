import { motion } from "motion/react";
import { ArrowDown, ArrowRight, Boxes, ListOrdered, Monitor, Puzzle } from "lucide-react";
import { REPO_URL } from "@/lib/downloads";

export function Architecture() {
  return (
    <section
      id="architecture"
      aria-labelledby="arch-title"
      className="relative scroll-mt-24 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow mb-4">Architecture</p>
            <h2
              id="arch-title"
              className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            >
              Native at the core.
              <br />
              <span className="text-primary">Open at every layer.</span>
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
              The browser extension hands links to the desktop app. The shared engine handles
              transfers, while the persistent queue keeps work organized.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-primary hover:underline"
            >
              Explore the source <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div
            data-floating
            className="glass rounded-[2rem] p-6 sm:p-8"
            role="group"
            aria-label="Browser extension and desktop app connect to the shared engine and persistent queue"
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: Puzzle, label: "Browser extension" },
                { Icon: Monitor, label: "Desktop app" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-background/60 p-5 text-center"
                >
                  <Icon className="mx-auto h-6 w-6 text-primary" aria-hidden />
                  <p className="mt-3 text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
            <div className="my-4 flex justify-around" aria-hidden>
              <ArrowDown className="h-5 w-5 text-primary" />
              <ArrowDown className="h-5 w-5 text-primary" />
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center gap-3 rounded-2xl bg-primary p-6 text-primary-foreground"
            >
              <Boxes className="h-7 w-7" aria-hidden />
              <span className="font-display text-2xl font-semibold">Native transfer engine</span>
            </motion.div>
            <ArrowDown className="mx-auto my-4 h-5 w-5 text-primary" aria-hidden />
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-background/60 p-5">
              <ListOrdered className="h-5 w-5 text-primary" aria-hidden />
              <span className="text-sm font-semibold">Persistent queue</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
