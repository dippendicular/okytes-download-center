import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DOWNLOAD_EVENT, type DownloadEventDetail } from "@/lib/download-events";

interface Burst {
  id: number;
  x: number;
  y: number;
  pieces: number;
}
interface Notice {
  id: number;
  label: string;
}

/** Reuses Motion for both feedback and confetti; no second animation runtime. */
export function DownloadFeedback() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let dismiss: ReturnType<typeof setTimeout> | undefined;
    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    };
    const onDownload = (event: Event) => {
      const detail = (event as CustomEvent<DownloadEventDetail>).detail;
      const id = Date.now() + Math.random();
      setNotice({ id, label: detail.label });
      if (dismiss) {
        clearTimeout(dismiss);
        timers.delete(dismiss);
      }
      dismiss = later(() => setNotice(null), 3400);
      if (!reduced) {
        setBursts((items) => [
          ...items.slice(-2),
          { id, x: detail.x, y: detail.y, pieces: innerWidth < 768 ? 8 : 16 },
        ]);
        later(() => setBursts((items) => items.filter((item) => item.id !== id)), 1000);
      }
    };
    window.addEventListener(DOWNLOAD_EVENT, onDownload);
    return () => {
      window.removeEventListener(DOWNLOAD_EVENT, onDownload);
      timers.forEach(clearTimeout);
    };
  }, [reduced]);
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[75]">
        {bursts.map((burst) =>
          Array.from({ length: burst.pieces }, (_, i) => {
            const angle = (i / burst.pieces) * Math.PI * 2;
            const distance = 60 + ((i * 37) % 50);
            return (
              <motion.span
                key={`${burst.id}-${i}`}
                className={`absolute h-2 w-1 rounded-sm ${i % 3 === 0 ? "bg-success" : i % 3 === 1 ? "bg-primary" : "bg-foreground"}`}
                style={{ left: burst.x, top: burst.y }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance + 30,
                  opacity: 0,
                  rotate: (i % 2 ? 1 : -1) * 260,
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            );
          }),
        )}
      </div>
      <div
        className="pointer-events-none fixed inset-x-4 bottom-5 z-[76] flex justify-center"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          {notice && (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: reduced ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : 10 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
              className="glass flex max-w-full items-center gap-3 rounded-2xl py-2 pl-2 pr-5 shadow-[var(--shadow-card)]"
            >
              <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0 -rotate-90" aria-hidden>
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                <motion.circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 2.4 }}
                />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Download requested</p>
                <p className="break-words font-mono text-[11px] text-muted-foreground">
                  {notice.label} · check your downloads
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
