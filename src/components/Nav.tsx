import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Menu, Star, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { REPO_URL } from "@/lib/downloads";
import { scrollToId } from "@/hooks/use-lenis";
import { GitHubIcon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
import { Magnetic, UI_SPRING } from "./Magnetic";
import { cn } from "@/lib/utils";

function onAnchor(e: React.MouseEvent<HTMLAnchorElement>, id: string, after?: () => void) {
  if (
    window.location.pathname === "/" &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.shiftKey &&
    !e.altKey &&
    e.button === 0
  ) {
    e.preventDefault();
    scrollToId(id);
  }
  after?.();
}

export function Nav() {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 80));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex w-full max-w-full justify-center px-3">
      <motion.nav
        layout
        transition={{ type: "spring", ...UI_SPRING }}
        aria-label="Primary"
        className={cn(
          "glass pointer-events-auto flex items-center rounded-full shadow-[var(--shadow-card)]",
          compact ? "gap-2 px-2 py-1.5" : "gap-2 px-2 py-2.5 sm:gap-4 sm:px-3",
        )}
      >
        <motion.a
          layout="position"
          href="/#top"
          onClick={(e) => onAnchor(e, "top")}
          className="flex items-center gap-2 rounded-full px-2 font-display text-lg font-semibold tracking-tight"
          aria-label="Okytes home"
        >
          <span className="px-1 font-mono text-xs font-medium text-primary">Home</span>
        </motion.a>

        <motion.ul layout="position" className="hidden items-center lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <Magnetic strength={0.3}>
                <a
                  href={`/#${l.id}`}
                  onClick={(e) => onAnchor(e, l.id)}
                  className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              </Magnetic>
            </li>
          ))}
        </motion.ul>

        <motion.div layout="position" className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href={REPO_URL}
            aria-label="Okytes on GitHub"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-2.5 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03] sm:px-3.5"
          >
            <GitHubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Star</span>
            <Star
              className="hidden h-3.5 w-3.5 transition-transform group-hover:rotate-[72deg] sm:block"
              aria-hidden
            />
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            data-analytics-event="menu_toggle"
            data-analytics-label="Mobile menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", ...UI_SPRING }}
            className="glass pointer-events-auto absolute inset-x-3 top-16 rounded-3xl p-3 lg:hidden"
          >
            <ul className="grid gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`/#${l.id}`}
                    onClick={(e) => onAnchor(e, l.id, () => setOpen(false))}
                    className="block rounded-2xl px-4 py-3 font-display text-2xl font-semibold tracking-tight hover:bg-accent"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
