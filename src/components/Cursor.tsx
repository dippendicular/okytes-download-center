import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useFinePointer } from "@/hooks/use-fine-pointer";

type Mode = "default" | "button" | "download";

/** Dot + trailing ring. Expands over buttons, says "download" over cards. Desktop only. */
export function Cursor() {
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add("has-custom-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as HTMLElement | null;
      const card = t?.closest<HTMLElement>("[data-cursor]");
      if (card?.dataset.cursor === "download") setMode("download");
      else if (t?.closest("a, button, [role=button], [role=tab], label")) setMode("button");
      else setMode("default");
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const ringScale = mode === "download" ? 2.6 : mode === "button" ? 1.7 : 1;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      />
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry, opacity: visible ? 1 : 0 }}>
        <motion.div
          className="relative -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-primary/60"
          animate={{ scale: ringScale }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ opacity: mode === "download" ? 0.92 : 0 }}
          />
          <AnimatePresence>
            {mode === "download" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 / 2.6 }}
                exit={{ opacity: 0 }}
                className="relative whitespace-nowrap font-mono text-[11px] font-bold uppercase text-primary-foreground"
              >
                download
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
