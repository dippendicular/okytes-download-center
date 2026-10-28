import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Check, LockKeyhole, Monitor, Puzzle, ShieldCheck } from "lucide-react";
import type { FeatureKey } from "@/lib/features";

type DemoProps = { active?: boolean };
const loop = (active: boolean, duration: number, times: number[]) => ({
  duration: active ? duration : 0,
  times,
  repeat: active ? Infinity : 0,
  ease: "easeInOut" as const,
});

function useDemoActive(active: boolean) {
  const reduced = useReducedMotion();
  return active && !reduced;
}

export function CrashDemo({ active = true }: DemoProps) {
  const run = useDemoActive(active);
  return (
    <div className="w-full max-w-sm">
      <div className="mb-4 flex items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
        <span>archive.tar.zst</span>
        <motion.span
          animate={{ opacity: run ? [0, 0, 1, 1, 0, 0, 0] : 0 }}
          transition={loop(run, 5, [0, 0.3, 0.45, 0.52, 0.6, 0.9, 1])}
          className="text-destructive"
        >
          interrupted
        </motion.span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full origin-left rounded-full bg-gradient-primary"
          animate={{ scaleX: run ? [0.18, 0.63, 0.79, 0.63, 0.63, 1, 1] : 1 }}
          transition={loop(run, 5, [0, 0.3, 0.45, 0.52, 0.6, 0.9, 1])}
        />
        <span className="absolute inset-y-0 left-[63%] w-0.5 bg-success" />
      </div>
      <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-3">
        <p className="font-mono text-xs text-success">Checkpoint retained @ 63%</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Uncommitted bytes can be retried. Saved progress does not start over.
        </p>
      </div>
    </div>
  );
}

export function MismatchDemo({ active = true }: DemoProps) {
  const run = useDemoActive(active);
  return (
    <div className="w-full max-w-sm">
      <div className="relative flex items-center justify-center gap-3 py-8">
        {[
          { version: "v1", etag: 'etag "a1f3"', start: -32 },
          { version: "v2", etag: 'etag "9c0e"', start: 32 },
        ].map((file) => (
          <motion.div
            key={file.version}
            animate={{ x: run ? [file.start, 0, 0, file.start] : 0 }}
            transition={loop(run, 4.5, [0, 0.35, 0.8, 1])}
            className="rounded-2xl border border-border bg-surface-2 px-4 py-6 text-center"
          >
            <p className="font-display text-3xl font-semibold">{file.version}</p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">{file.etag}</p>
          </motion.div>
        ))}
        <motion.span
          animate={{
            opacity: run ? [0, 0, 1, 1, 0] : 1,
            scale: run ? [1.4, 1.4, 1, 1, 1] : 1,
            rotate: -10,
          }}
          transition={loop(run, 4.5, [0, 0.35, 0.43, 0.8, 1])}
          className="absolute z-10 whitespace-nowrap rounded-lg border-2 border-destructive bg-popover/95 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-destructive"
        >
          source changed
        </motion.span>
      </div>
      <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
        Different source. Merge rejected.
      </p>
    </div>
  );
}

const HEX = "0123456789abcdef";
const FINAL = "4ba67440aadac67a".repeat(4);

export function HashDemo({ active = true }: DemoProps) {
  const run = useDemoActive(active);
  const [state, setState] = useState({ text: "0".repeat(64), ok: false });
  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const timer = setInterval(() => {
      frame = (frame + 1) % 55;
      if (frame < 24) {
        const locked = Math.floor((frame / 24) * FINAL.length);
        setState({
          ok: false,
          text:
            FINAL.slice(0, locked) +
            Array.from(
              { length: FINAL.length - locked },
              (_, i) => HEX[(frame * 7 + i * 11) % 16],
            ).join(""),
        });
      } else if (frame === 24) setState({ text: FINAL, ok: true });
    }, 80);
    return () => clearInterval(timer);
  }, [run]);
  const ok = !run || state.ok;
  return (
    <div className="flex w-full min-w-0 max-w-sm flex-col items-center gap-5">
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        SHA-256
      </span>
      <code
        className={`w-full break-all rounded-xl border border-border bg-background/50 p-3 font-mono text-xs leading-loose tracking-wider sm:text-sm ${ok ? "text-success" : "text-muted-foreground"}`}
      >
        {run ? state.text : FINAL}
      </code>
      <motion.span
        animate={{ scale: ok ? 1 : 0.85, opacity: ok ? 1 : 0.25 }}
        transition={{ duration: run ? 0.2 : 0 }}
        className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2 font-mono text-sm font-semibold text-success"
      >
        <Check className="h-4 w-4" />
        verified
      </motion.span>
      <p className="text-center font-mono text-[10px] text-muted-foreground">
        expected === actual → publish
      </p>
    </div>
  );
}

const WORKERS = [2, 3, 4, 6, 4];
export function AdaptiveDemo({ active = true }: DemoProps) {
  const run = useDemoActive(active);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!run) return;
    const timer = setInterval(() => setPhase((value) => (value + 1) % WORKERS.length), 1200);
    return () => clearInterval(timer);
  }, [run]);
  const count = run ? WORKERS[phase]! : 4;
  return (
    <div className="w-full max-w-sm">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Relative throughput
      </p>
      <svg viewBox="0 0 300 130" className="h-32 w-full overflow-visible" fill="none">
        <path d="M10 15V115H290 M10 65H290 M10 25H290" stroke="var(--border)" strokeWidth="1" />
        <motion.path
          d="M10 112L50 96L90 68L130 39L170 24L210 21L250 21L290 21"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ pathLength: run ? [0, 0.35, 0.7, 1, 1, 1] : 1 }}
          transition={loop(run, 6, [0, 0.2, 0.4, 0.6, 0.8, 1])}
        />
      </svg>
      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">workers</span>
        <div className="flex flex-1 gap-1.5">
          <AnimatePresence initial={false}>
            {Array.from({ length: count }, (_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: i >= 4 ? 0.4 : 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: run ? 0.3 : 0 }}
                className="h-3 w-3 rounded-full bg-primary"
              />
            ))}
          </AnimatePresence>
        </div>
        <span className="font-mono text-xs text-primary">{count} live</span>
      </div>
      <p className="mt-4 min-h-8 font-mono text-[10px] leading-relaxed text-muted-foreground">
        {run && phase >= 3
          ? "Throughput plateaus → extra workers fade out"
          : "Probe → measure → retain useful workers"}
      </p>
    </div>
  );
}

export function LanDemo({ active = true }: DemoProps) {
  const run = useDemoActive(active);
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2">
        {["Your PC", "Paired device"].map((label, index) => (
          <div key={label} className="contents">
            {index === 1 && (
              <div className="relative min-w-0 flex-1">
                <svg viewBox="0 0 120 70" className="h-16 w-full">
                  <path
                    d="M3 35H117"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    strokeDasharray="3 6"
                  />
                  <motion.circle
                    cy="35"
                    r="4"
                    fill="var(--primary)"
                    animate={{ cx: run ? [8, 24, 96, 112] : 60, opacity: run ? [0, 1, 1, 0] : 1 }}
                    transition={loop(run, 2.2, [0, 0.15, 0.85, 1])}
                  />
                </svg>
                <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-surface">
                  <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                </span>
              </div>
            )}
            <div className="flex w-[72px] shrink-0 flex-col items-center gap-3">
              <span className="rounded-2xl border border-border bg-surface-2 p-3">
                <Monitor className="h-6 w-6 text-primary" />
              </span>
              <span className="text-center font-mono text-[10px] text-muted-foreground">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-7 text-center font-mono text-xs text-success">
        Encrypted · receiver approved
      </p>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Files move directly between your devices.
      </p>
    </div>
  );
}

export function TorrentDemo({ active = true }: DemoProps) {
  const run = useDemoActive(active);
  return (
    <div className="w-full max-w-sm">
      <p className="mb-4 flex items-center justify-between font-mono text-xs">
        <span>linux.torrent</span>
        <span className="text-primary">magnet ↗</span>
      </p>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: 24 }, (_, i) => (
          <motion.span
            key={i}
            className="h-5 rounded bg-primary"
            animate={{ opacity: run ? [0.18, 0.18, 1, 1] : 1 }}
            transition={{ ...loop(run, 4, [0, 0.2, 0.75, 1]), delay: run ? (i % 8) * 0.09 : 0 }}
          />
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background/50 p-3 text-xs">
        <Check className="h-4 w-4 text-success" />
        <span>Selected files · verified pieces</span>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
        Download → verify → seed on your terms
      </p>
    </div>
  );
}

export function TransferDemo({ kind, active = true }: DemoProps & { kind: FeatureKey }) {
  const run = useDemoActive(active);
  if (kind === "extensions")
    return (
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="rounded-2xl border border-border bg-surface-2 p-5">
            <Puzzle className="h-7 w-7 text-primary" />
          </span>
          <motion.span
            animate={{ x: run ? [-4, 4, -4] : 0 }}
            transition={loop(run, 2, [0, 0.5, 1])}
          >
            <ArrowRight className="h-5 w-5 text-primary" />
          </motion.span>
          <span className="rounded-2xl border border-border bg-surface-2 p-5">
            <Monitor className="h-7 w-7 text-primary" />
          </span>
        </div>
        <p className="mt-5 font-mono text-xs text-muted-foreground">
          Browser → desktop → transfer engine
        </p>
        <p className="mt-3 text-sm text-primary">Chromium + Firefox</p>
      </div>
    );
  if (kind === "hls")
    return (
      <div className="w-full max-w-sm">
        <p className="mb-4 font-mono text-xs text-primary">Video · audio · subtitles</p>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.span
              key={i}
              className="flex h-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/15 font-mono text-[10px] text-primary"
              animate={{ opacity: run ? [0.3, 1, 1, 0.3] : 1 }}
              transition={{ ...loop(run, 3.5, [0, 0.4, 0.8, 1]), delay: run ? i * 0.1 : 0 }}
            >
              {String(i + 1).padStart(2, "0")}
            </motion.span>
          ))}
        </div>
        <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground">
          HLS / DASH · unprotected on-demand streams
        </p>
      </div>
    );
  const queue = kind === "queue";
  const ftp = kind === "ftp";
  const labels = queue
    ? ["archive.zip · active", "dataset.parquet · queued", "video.mp4 · queued"]
    : ftp
      ? ["SFTP · host-key check", "FTPS · TLS connection", "FTP · file transfer"]
      : ["bytes 0–255", "bytes 256–511", "bytes 512–767", "bytes 768–1023"];
  return (
    <div className="w-full max-w-sm">
      {ftp && <ShieldCheck className="mb-4 h-6 w-6 text-primary" />}
      <div className="space-y-3">
        {labels.map((label, i) => (
          <div key={label} className="rounded-xl border border-border bg-background/40 px-3 py-2.5">
            <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full origin-left rounded-full bg-primary"
                animate={{ scaleX: queue && i > 0 ? 0.03 : run ? [0.15, 1, 1, 0.15] : 0.8 }}
                transition={{
                  ...loop(run, 3.8 + i * 0.2, [0, 0.7, 0.9, 1]),
                  delay: run ? i * 0.12 : 0,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-[10px] text-primary">
        {queue
          ? "Queue saved across restarts"
          : ftp
            ? "Resumable transfers · SFTP identity checks"
            : "Concurrent, non-overlapping byte ranges"}
      </p>
    </div>
  );
}

// Kept for existing imports outside the main carousel.
export function EngineDemo({ active = true }: DemoProps) {
  return <TransferDemo kind="extensions" active={active} />;
}
export function FreeDemo() {
  return (
    <div className="text-center">
      <p className="font-display text-6xl font-semibold text-success">$0</p>
      <p className="mt-4 text-sm text-muted-foreground">Free. Open source. No accounts.</p>
    </div>
  );
}
