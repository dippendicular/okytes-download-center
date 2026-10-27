import { useEffect, useRef, useState } from "react";
import { Brand } from "./Brand";

const KEY = "okytes:intro";

/** Barba owns only the initial entrance lifecycle; TanStack owns navigation. */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (
      document.documentElement.dataset["intro"] === "skip" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDone(true);
      return;
    }
    let disposed = false;
    let cleanup: (() => void) | undefined;
    Promise.all([import("@barba/core"), import("animejs")])
      .then(([{ default: barba }, { animate, createScope, createTimeline }]) => {
        if (disposed || !root.current) return;
        const scope = createScope({ root: root.current });
        let ownsBarba = false;
        cleanup = () => {
          scope.revert();
          if (ownsBarba) barba.destroy();
        };
        const finish = () => {
          if (ownsBarba) {
            barba.destroy();
            ownsBarba = false;
          }
          if (disposed) return;
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            /* storage can be disabled */
          }
          setDone(true);
        };
        scope.add(() => {
          ownsBarba = true;
          barba.init({
            // This is a React single-page app. Never intercept links or replace React DOM.
            prevent: () => true,
            prefetchIgnore: true,
            cacheIgnore: true,
            transitions: [
              {
                name: "brand-entrance",
                once() {
                  scope.add(() => {
                    const counter = root.current?.querySelector("[data-counter]");
                    const progress = { value: 0 };
                    animate(progress, {
                      value: 100,
                      duration: 650,
                      ease: "out(3)",
                      onUpdate: () => {
                        if (counter)
                          counter.textContent = String(Math.round(progress.value)).padStart(3, "0");
                      },
                    });
                    createTimeline({ onComplete: finish })
                      .add("[data-intro-logo]", {
                        opacity: [0, 1],
                        scale: [0.85, 1],
                        duration: 550,
                        ease: "out(4)",
                      })
                      .add(
                        "[data-intro-inner]",
                        { opacity: [1, 0], y: [0, -16], duration: 200 },
                        650,
                      )
                      .add(
                        root.current!,
                        { y: ["0%", "-100%"], duration: 400, ease: "inOut(4)" },
                        800,
                      );
                  });
                },
              },
            ],
          });
        });
      })
      .catch(() => {
        if (!disposed) setDone(true);
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  if (done) return null;
  return (
    <div
      ref={root}
      data-barba="wrapper"
      aria-hidden
      className="intro-overlay pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-background"
    >
      <div data-barba="container" data-barba-namespace="home-entrance">
        <div data-intro-inner className="flex flex-col items-center gap-6">
          <div data-intro-logo>
            <Brand />
          </div>
          <span data-counter className="font-mono text-sm tracking-[0.3em] text-muted-foreground">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
