import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowDownRight } from "lucide-react";
import { useEnv } from "@/hooks/use-env";
import { useFinePointer } from "@/hooks/use-fine-pointer";
import { scrollToId } from "@/hooks/use-lenis";
import { getBuild } from "@/lib/downloads";
import { announceDownload } from "@/lib/download-events";
import { BuildIcon } from "./Icons";
import { Magnetic } from "./Magnetic";
import { MockApp } from "./MockApp";

function SmartButton() {
  const { env, desktopId } = useEnv();
  const build = desktopId ? getBuild(desktopId) : undefined;
  let href = "#downloads",
    label = "Download Okytes",
    isFile = false;
  if (env?.isMobile) label = "Send it to your PC";
  else if (build?.comingSoon) label = "macOS · Coming soon";
  else if (build?.url) {
    href = build.url;
    isFile = true;
    label = `Download for ${build.os === "windows" ? "Windows" : "Linux"} (${build.ext})`;
  }
  return (
    <Magnetic strength={0.18}>
      <motion.a
        href={href}
        {...(isFile ? { download: "" } : {})}
        onClick={(e) => {
          if (isFile) announceDownload(e, label);
          else {
            e.preventDefault();
            scrollToId("downloads");
          }
        }}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="hero-download group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground glow-ring sm:text-base"
      >
        <span className="button-sheen" aria-hidden />
        <span className="relative flex items-center gap-3">
          {env ? (
            <BuildIcon os={env.os} className="h-5 w-5 shrink-0" />
          ) : (
            <ArrowDown className="h-5 w-5" aria-hidden />
          )}
          {label}
        </span>
      </motion.a>
    </Magnetic>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const mx = useMotionValue(0),
    my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 24 });
  const sy = useSpring(my, { stiffness: 120, damping: 24 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-4, 4]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [3, -3]);
  return (
    <section
      id="top"
      className="hero-section relative isolate pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-40"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <a
            href="/#top"
            aria-label="Okytes home"
            className="hero-brand mb-7 inline-flex rounded-lg"
          >
            <img
              src="/images/okytes_logo_transperant.png"
              alt="Okytes"
              width={2148}
              height={732}
              fetchPriority="high"
              decoding="async"
              className="h-12 w-auto sm:h-14"
            />
          </a>
          <h1 className="hero-title" aria-label="A download manager which is free and efficient.">
            {["A download", "manager which is"].map((line) => (
              <span key={line} className="block">
                {line.split(" ").map((word, i) => (
                  <motion.span
                    key={`theme-safe-${word}`}
                    className="hero-word inline-block"
                    whileHover={reduced ? {} : { y: -5, rotate: i % 2 ? 1.5 : -1.5 }}
                    transition={{ type: "spring", stiffness: 350, damping: 18 }}
                  >
                    {word}
                    <span className="whitespace-pre"> </span>
                  </motion.span>
                ))}
              </span>
            ))}
            <motion.span
              className="hero-word block text-primary"
              whileHover={reduced ? {} : { x: 6 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
            >
              free and efficient.
            </motion.span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Capture links. Run parallel transfers. Keep your queue organized. Your files, your
            desktop, your control.
          </p>
          <div className="mt-8">
            <SmartButton />
          </div>
          <a
            href="#downloads"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("downloads");
            }}
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Choose your platform <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </motion.div>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12 }}
          className="relative min-w-0 [perspective:1200px]"
          onPointerMove={(e) => {
            if (!fine || reduced) return;
            const r = e.currentTarget.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
        >
          <div className="preview-halo" aria-hidden />
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
            <MockApp />
          </motion.div>
          <span className="sticker absolute -left-3 -top-5 hidden -rotate-6 bg-primary text-primary-foreground sm:block">
            Open source
          </span>
          <span className="sticker absolute -bottom-4 right-5 hidden rotate-3 bg-success text-success-foreground sm:block">
            Free forever
          </span>
        </motion.div>
      </div>
    </section>
  );
}
