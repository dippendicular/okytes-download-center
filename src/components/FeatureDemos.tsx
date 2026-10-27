import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Puzzle, Terminal, Webhook } from "lucide-react";

const loop = (duration: number, times: number[]) => ({
  duration,
  times,
  repeat: Infinity,
  ease: "easeInOut" as const,
});

export function CrashDemo() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-3 flex justify-between font-mono text-xs text-muted-foreground">
        <span>archive.tar.zst</span>
        <motion.span
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={loop(4, [0, 0.45, 0.5, 0.65, 0.7])}
          className="text-destructive"
        >
          crashed
        </motion.span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full origin-left rounded-full bg-gradient-primary"
          animate={{ scaleX: [0, 0.72, 0.72, 0.15, 0.63, 1] }}
          transition={loop(4, [0, 0.42, 0.48, 0.55, 0.7, 1])}
        />
        <motion.div
          className="absolute inset-0 bg-destructive"
          animate={{ opacity: [0, 0, 0.9, 0, 0.9, 0] }}
          transition={loop(4, [0, 0.47, 0.5, 0.53, 0.56, 0.6])}
        />
        <span className="absolute inset-y-0 left-[63%] w-0.5 bg-success" />
      </div>
      <p className="mt-3 font-mono text-xs text-success">
        ↳ checkpoint @ 63% · committed bytes only
      </p>
    </div>
  );
}

export function MismatchDemo() {
  return (
    <div className="relative flex w-full max-w-sm items-center justify-center gap-4 py-6">
      {[
        { v: "v1", tag: 'etag "a1f3"', from: -60 },
        { v: "v2", tag: 'etag "9c0e"', from: 60 },
      ].map((f) => (
        <motion.div
          key={f.v}
          animate={{ x: [f.from, 0, 0, f.from] }}
          transition={loop(3.6, [0, 0.35, 0.8, 1])}
          className="rounded-2xl border border-border bg-surface-2 px-4 py-5 text-center"
        >
          <p className="font-display text-2xl font-semibold">{f.v}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{f.tag}</p>
        </motion.div>
      ))}
      <motion.span
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [2, 2, 1, 1, 1], rotate: -12 }}
        transition={loop(3.6, [0, 0.35, 0.42, 0.8, 0.9])}
        className="absolute rounded-lg border-2 border-destructive px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-destructive"
      >
        mismatch
      </motion.span>
    </div>
  );
}

const HEX = "0123456789abcdef";
const FINAL = "4ba67440aadac67a";

export function HashDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [text, setText] = useState(FINAL);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const id = setInterval(() => {
      frame = (frame + 1) % 70;
      if (frame < 30) {
        setOk(false);
        const locked = Math.floor((frame / 30) * FINAL.length);
        setText(
          FINAL.slice(0, locked) +
            Array.from(
              { length: FINAL.length - locked },
              () => HEX[Math.floor(Math.random() * 16)],
            ).join(""),
        );
      } else {
        setText(FINAL);
        setOk(true);
      }
    }, 50);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <code
        className={`font-mono text-2xl tracking-wider sm:text-3xl ${ok ? "text-success" : "text-muted-foreground"}`}
      >
        {text}
      </code>
      <motion.span
        animate={{ scale: ok ? 1 : 0.4, opacity: ok ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="glow-success inline-flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground"
      >
        <Check className="h-6 w-6" aria-hidden />
      </motion.span>
      <p className="font-mono text-xs text-muted-foreground">expected === actual → publish</p>
    </div>
  );
}

const WORKER_PLAN = [3, 5, 7, 6, 4, 6];

export function AdaptiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [i, setI] = useState(2);

  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % WORKER_PLAN.length), 1300);
    return () => clearInterval(id);
  }, [inView]);

  const n = WORKER_PLAN[i] ?? 3;
  return (
    <div ref={ref} className="w-full max-w-sm">
      <div className="flex h-28 items-end gap-1.5">
        {Array.from({ length: 14 }).map((_, b) => (
          <span
            key={b}
            className="flex-1 origin-bottom rounded-t bg-primary/70"
            style={{
              height: "100%",
              animation: `bar-grow ${1.6 + (b % 4) * 0.35}s ease-in-out ${b * -0.17}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">workers</span>
        <div className="flex gap-1">
          <AnimatePresence initial={false}>
            {Array.from({ length: n }).map((_, w) => (
              <motion.span
                key={w}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className="h-3 w-3 rounded-full bg-primary"
              />
            ))}
          </AnimatePresence>
        </div>
        <span className="ml-auto font-mono text-xs text-primary">{n} live</span>
      </div>
    </div>
  );
}

const CLIENTS = [
  { label: "Desktop", Icon: Monitor, x: 40, y: 40 },
  { label: "Browser", Icon: Puzzle, x: 260, y: 40 },
  { label: "CLI", Icon: Terminal, x: 40, y: 180 },
  { label: "API", Icon: Webhook, x: 260, y: 180 },
];

export function EngineDemo() {
  return (
    <div className="relative aspect-[15/11] w-full max-w-[300px]">
      <svg viewBox="0 0 300 220" className="absolute inset-0 h-full w-full" aria-hidden>
        {CLIENTS.map((c) => (
          <line
            key={c.label}
            x1={c.x}
            y1={c.y}
            x2={150}
            y2={110}
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            style={{ animation: "dash-flow 0.8s linear infinite" }}
          />
        ))}
      </svg>
      {CLIENTS.map(({ label, Icon, x, y }) => (
        <span
          key={label}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${(x / 300) * 100}%`, top: `${(y / 220) * 100}%` }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-2">
            <Icon className="h-5 w-5 text-foreground" aria-hidden />
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
        </span>
      ))}
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="glow-ring absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground"
      >
        core
      </motion.span>
    </div>
  );
}

const TAGS = ["Ads", "Subscriptions", "License keys", "Accounts", "Telemetry"];

export function FreeDemo() {
  return (
    <div className="flex max-w-sm flex-wrap justify-center gap-2.5">
      {TAGS.map((t, i) => (
        <span
          key={t}
          className="relative rounded-full border border-border px-4 py-2 font-mono text-sm text-muted-foreground"
        >
          {t}
          <motion.span
            className="absolute inset-x-2 top-1/2 h-0.5 origin-left bg-destructive"
            animate={{ scaleX: [0, 1, 1, 0] }}
            transition={{
              duration: 3.4,
              times: [0, 0.2, 0.85, 1],
              repeat: Infinity,
              delay: i * 0.18,
            }}
          />
        </span>
      ))}
      <span className="mt-2 w-full text-center font-display text-6xl font-semibold text-success">
        $0
      </span>
    </div>
  );
}
