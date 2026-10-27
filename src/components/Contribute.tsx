import { useEffect, useRef, useState } from "react";
import { BookOpen, GitFork, Sparkles, Star } from "lucide-react";
import { ISSUES_GOOD_FIRST, REPO_API, REPO_URL, ROADMAP_URL } from "@/lib/downloads";
import { animate, useInView, useReducedMotion } from "motion/react";
import { Magnetic } from "./Magnetic";

const CACHE_KEY = "okytes:gh";
const TTL = 10 * 60 * 1000;

interface Stats {
  stars: number;
  forks: number;
}

function useRepoStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const c = JSON.parse(raw) as Stats & { t: number };
        if (Date.now() - c.t < TTL) {
          setStats(c);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    const ctrl = new AbortController();
    fetch(REPO_API, { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: { stargazers_count: number; forks_count: number }) => {
        const s = { stars: j.stargazers_count, forks: j.forks_count };
        setStats(s);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...s, t: Date.now() }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => !ctrl.signal.aborted && setFailed(true));
    return () => ctrl.abort();
  }, []);
  return { stats, failed };
}

function Counter({ value, failed }: { value: number | undefined; failed: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (value == null || !ref.current || !inView) return;
    const el = ref.current;
    if (reduced) {
      el.textContent = value.toLocaleString();
      return;
    }
    const t = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => {
      t.stop();
    };
  }, [value, inView, reduced]);
  return <span ref={ref}>{failed ? "—" : value == null ? "…" : "0"}</span>;
}

export function Contribute() {
  const { stats, failed } = useRepoStats();

  return (
    <section
      id="contribute"
      aria-labelledby="contribute-title"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5">
        <div data-floating className="glass relative overflow-hidden rounded-[2.5rem] p-6 sm:p-14">
          <div
            aria-hidden
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-[100px]"
          />
          <p className="eyebrow mb-4">Contribute</p>
          <h2 id="contribute-title" className="text-huge relative">
            Build it <span className="text-gradient">with us.</span>
          </h2>
          <p className="relative mt-6 max-w-xl text-muted-foreground">
            A shared engine, reusable components, and real-world edge cases. Reliability, protocol
            compatibility, accessibility, tests, docs — all welcome. So is testing on weird setups.
          </p>

          <div className="relative mt-10 flex flex-wrap gap-8 font-mono">
            <div>
              <p className="text-5xl font-bold text-foreground sm:text-6xl">
                <Counter value={stats?.stars} failed={failed} />
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
                <Star className="h-3.5 w-3.5" aria-hidden /> stars
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-foreground sm:text-6xl">
                <Counter value={stats?.forks} failed={failed} />
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
                <GitFork className="h-3.5 w-3.5" aria-hidden /> forks
              </p>
            </div>
            {failed && (
              <p className="self-end text-xs text-muted-foreground">
                GitHub is rate-limiting us. Numbers are on the repo.
              </p>
            )}
          </div>

          <div className="relative mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground glow-ring"
              >
                <Star className="h-4 w-4" aria-hidden /> Star on GitHub
              </a>
            </Magnetic>
            <a
              href={ROADMAP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-4 font-semibold hover:border-primary/60 hover:text-primary"
            >
              <BookOpen className="h-4 w-4" aria-hidden /> Read the docs
            </a>
            <a
              href={ISSUES_GOOD_FIRST}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-4 font-semibold hover:border-success/60 hover:text-success"
            >
              <Sparkles className="h-4 w-4" aria-hidden /> Good first issues
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
