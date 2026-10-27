import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, MoreHorizontal, Pause } from "lucide-react";

const ROWS = [
  { name: "ubuntu-desktop-amd64.iso", size: "5.7 GB", start: 0.38, duration: 28 },
  { name: "blender-linux-x64.tar.xz", size: "312 MB", start: 0.16, duration: 19 },
];

function Transfer({ row, running }: { row: (typeof ROWS)[number]; running: boolean }) {
  const progress = useMotionValue(row.start);
  const percent = useTransform(progress, (value) => `${Math.round(value * 100)}%`);
  useEffect(() => {
    if (!running) return;
    // Illustrative transfer loop, not a real download or speed benchmark.
    const control = animate(progress, [row.start, 1, 1, 0.04, row.start], {
      duration: row.duration,
      times: [0, 0.7, 0.78, 0.79, 1],
      ease: "linear",
      repeat: Infinity,
    });
    return () => control.stop();
  }, [running, progress, row]);
  return (
    <li className="rounded-2xl border border-border bg-surface/80 p-3 sm:p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 truncate font-mono text-[11px] sm:text-xs">{row.name}</span>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{row.size}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          style={{ scaleX: progress }}
          className="transfer-bar relative h-full w-full origin-left rounded-full bg-gradient-primary"
        >
          <span className="transfer-packet" aria-hidden />
        </motion.div>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5 text-primary">
          <span className="transfer-dot h-1 w-1 rounded-full bg-primary" />
          Downloading
        </span>
        <span className="flex items-center gap-3">
          <motion.span>{percent}</motion.span>
          <Pause className="h-3 w-3" aria-hidden />
        </span>
      </div>
    </li>
  );
}

export function MockApp() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const running = inView && visible && !reduced;
  return (
    <div
      ref={ref}
      data-floating
      data-running={running}
      className="glass mock-app relative rounded-3xl p-4 shadow-[var(--shadow-card)] sm:p-5"
      role="img"
      aria-label="Animated illustrative Okytes desktop queue: two active downloads and one queued file. Not a live speed benchmark."
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-xs font-semibold">
          <ArrowDownToLine className="h-4 w-4 text-primary" aria-hidden />
          okytes
        </span>
        <span className="chip">Okytes Desktop</span>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="mb-4 flex items-end justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="font-display text-xl font-semibold sm:text-2xl">Your downloads</p>
          <p className="mt-1 text-xs text-muted-foreground">Everything in one queue.</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-primary">
          <span className="transfer-dot h-1.5 w-1.5 rounded-full bg-primary" />2 active
        </span>
      </div>
      <ul className="space-y-3">
        {ROWS.map((row) => (
          <Transfer key={row.name} row={row} running={running} />
        ))}
        <li className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-surface/40 px-3 py-3 sm:px-4">
          <span className="min-w-0 truncate font-mono text-[11px]">dataset-shards.parquet</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            Queued · 1.9 GB
          </span>
        </li>
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[10px] text-muted-foreground">
        <span>HTTP / HTTPS</span>
        <span>Windows · Linux</span>
      </div>
    </div>
  );
}
