import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { SHOWCASE_FEATURES, type FeatureKey } from "@/lib/features";
import { trackEvent } from "@/lib/analytics";
import {
  AdaptiveDemo,
  CrashDemo,
  HashDemo,
  LanDemo,
  MismatchDemo,
  TorrentDemo,
  TransferDemo,
} from "./FeatureDemos";

function FeatureVisual({ feature, active }: { feature: FeatureKey; active: boolean }): ReactNode {
  switch (feature) {
    case "safeResume":
      return <MismatchDemo active={active} />;
    case "crashSafe":
      return <CrashDemo active={active} />;
    case "verified":
      return <HashDemo active={active} />;
    case "adaptive":
      return <AdaptiveDemo active={active} />;
    case "lanShare":
      return <LanDemo active={active} />;
    case "bittorrent":
      return <TorrentDemo active={active} />;
    default:
      return <TransferDemo kind={feature} active={active} />;
  }
}

export function Bento() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const method = useRef("initial");
  const feature = SHOWCASE_FEATURES[index]!;
  const running = inView && visible && !paused && !hovered && !reduced;
  const demoActive = inView && visible && !reduced;

  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      method.current = "auto";
      setIndex((current) => (current + 1) % SHOWCASE_FEATURES.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [index, running]);

  useEffect(() => {
    if (inView && visible)
      trackEvent("feature_view", {
        source: "features",
        feature: feature.key,
        position: index + 1,
        method: method.current,
      });
  }, [feature.key, index, inView, visible]);

  const navigate = (next: number) => {
    method.current = "manual";
    setPaused(true);
    setIndex((next + SHOWCASE_FEATURES.length) % SHOWCASE_FEATURES.length);
  };

  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="relative scroll-mt-24 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5">
        <p className="eyebrow mb-4">Inside Okytes</p>
        <h2 id="features-title" className="text-huge max-w-4xl">
          More than a download.
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
          Recover safely. Verify the result. Share locally. Explore what happens between the first
          byte and the finished file.
        </p>
        <div
          ref={ref}
          role="region"
          aria-roledescription="carousel"
          aria-label="Download manager features"
          data-analytics-feature={feature.key}
          className="mt-10 min-w-0"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          onFocusCapture={(event) => {
            if (!(event.target as HTMLElement).closest("[data-autoplay-toggle]")) setPaused(true);
          }}
          onKeyDown={(event) => {
            if (
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              (event.target as HTMLElement).tagName === "SELECT"
            )
              return;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              navigate(index + 1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              navigate(index - 1);
            }
          }}
        >
          <div
            data-floating
            className="glass overflow-hidden rounded-[2rem] shadow-[var(--shadow-card)]"
          >
            <div aria-live={running ? "off" : "polite"} aria-atomic="true">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={feature.key}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${SHOWCASE_FEATURES.length}: ${feature.title}`}
                  data-feature={feature.key}
                  initial={{ opacity: 0, x: reduced ? 0 : 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduced ? 0 : -24 }}
                  transition={{ duration: reduced ? 0 : 0.25 }}
                  drag={reduced ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.08}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 55)
                      navigate(index + (info.offset.x < 0 ? 1 : -1));
                  }}
                  style={{ touchAction: "pan-y" }}
                  className="grid min-w-0 gap-6 p-5 sm:p-9 lg:min-h-[420px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:p-12"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs tracking-widest text-primary">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(SHOWCASE_FEATURES.length).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                      {feature.title}
                    </h3>
                    <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </div>
                  <div
                    className="feature-demo flex h-64 min-w-0 items-center justify-center overflow-hidden rounded-3xl border border-border bg-surface/75 p-5 sm:h-72 sm:p-7"
                    aria-hidden="true"
                  >
                    <FeatureVisual feature={feature.key} active={demoActive} />
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
            <div className="h-0.5 overflow-hidden bg-border" aria-hidden="true">
              <motion.div
                key={`${index}-${running}`}
                className="h-full origin-left bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: running ? 1 : 0 }}
                transition={{ duration: running ? 7 : 0, ease: "linear" }}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div
              className="flex flex-wrap items-center gap-1"
              role="group"
              aria-label="Choose a feature"
            >
              {SHOWCASE_FEATURES.map((item, position) => (
                <button
                  key={item.key}
                  type="button"
                  aria-label={`Show ${item.title}`}
                  aria-current={position === index ? "true" : undefined}
                  title={item.title}
                  data-analytics-event="feature_select"
                  data-analytics-feature={item.key}
                  onClick={() => navigate(position)}
                  className="flex h-7 w-6 items-center justify-center rounded-full"
                >
                  <span
                    className={`h-1.5 rounded-full transition-[width,background-color] ${position === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
                  />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {!reduced && (
                <button
                  type="button"
                  data-autoplay-toggle
                  data-analytics-event="feature_autoplay_toggle"
                  data-analytics-action={paused ? "play" : "pause"}
                  onClick={() => setPaused((value) => !value)}
                  aria-label={paused ? "Play autoplay" : "Pause autoplay"}
                  aria-pressed={!paused}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs"
                >
                  {paused ? (
                    <Play className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Pause className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {paused ? "Play" : "Pause"}
                </button>
              )}
              <button
                type="button"
                aria-label="Previous feature"
                data-analytics-event="feature_previous"
                onClick={() => navigate(index - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next feature"
                data-analytics-event="feature_next"
                onClick={() => navigate(index + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:text-primary"
              >
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
