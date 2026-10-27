import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RotateCcw, Scan } from "lucide-react";
import { useEnv } from "@/hooks/use-env";
import { DOWNLOADS, RELEASE, RELEASES_URL } from "@/lib/downloads";
import { BROWSER_LABEL, type Browser, type DistroFamily, type OS } from "@/lib/detect";
import { DownloadRow } from "./DownloadRow";
import { BuildIcon } from "./Icons";
import { MobileHandoff } from "./MobileHandoff";
import { UI_SPRING } from "./Magnetic";
import { cn } from "@/lib/utils";

const OS_CHOICES: { label: string; os: OS; distro?: DistroFamily }[] = [
  { label: "Windows", os: "windows" },
  { label: "Linux · Debian / Ubuntu", os: "linux", distro: "deb" },
  { label: "Linux · Fedora / RHEL", os: "linux", distro: "rpm" },
  { label: "Linux · other (AppImage)", os: "linux", distro: "unknown" },
  { label: "macOS", os: "macos" },
];
const BROWSER_CHOICES: Browser[] = [
  "chrome",
  "edge",
  "brave",
  "opera",
  "vivaldi",
  "firefox",
  "safari",
];

function ChangeMenu() {
  const { env, setOverride, clearOverride, override } = useEnv();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hasOverride = Object.keys(override).length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-analytics-event="platform_menu_toggle"
        data-analytics-label="Change detected platform"
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs text-primary hover:bg-accent"
      >
        Not right? Change
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose your platform"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", ...UI_SPRING }}
            className="absolute left-0 top-full z-30 mt-2 w-[min(20rem,85vw)] origin-top-left rounded-3xl border border-border bg-popover p-3 shadow-[var(--shadow-card)]"
          >
            <p className="px-2 pb-1 eyebrow">System</p>
            <ul className="mb-3 grid gap-0.5">
              {OS_CHOICES.map((c) => {
                const active =
                  env?.os === c.os && (c.os !== "linux" || env.distroFamily === c.distro);
                return (
                  <li key={c.label}>
                    <button
                      type="button"
                      onClick={() => setOverride({ os: c.os, distroFamily: c.distro ?? null })}
                      data-analytics-event="platform_select"
                      data-analytics-os={c.os}
                      data-analytics-distro={c.distro ?? "none"}
                      className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm hover:bg-accent"
                    >
                      {c.label}
                      {active && <Check className="h-4 w-4 text-success" aria-label="selected" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="px-2 pb-1 eyebrow">Browser</p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {BROWSER_CHOICES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setOverride({ browser: b })}
                  aria-pressed={env?.browser === b}
                  data-analytics-event="browser_select"
                  data-analytics-browser={b}
                  className={cn(
                    "chip hover:text-foreground",
                    env?.browser === b && "border-primary/60 text-primary",
                  )}
                >
                  {BROWSER_LABEL[b]}
                </button>
              ))}
            </div>
            {hasOverride && (
              <button
                type="button"
                onClick={() => {
                  clearOverride();
                  setOpen(false);
                }}
                data-analytics-event="platform_reset"
                data-analytics-label="Use auto-detect"
                className="mt-3 inline-flex items-center gap-1.5 px-2 font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" aria-hidden /> Use auto-detect
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PLATFORMS = [
  { os: "windows", name: "Windows", subtitle: "A familiar setup. Your choice of installer." },
  { os: "linux", name: "Linux", subtitle: "Native packages or a portable AppImage." },
  { os: "macos", name: "macOS", subtitle: "Apple Silicon and Intel. Coming soon." },
] as const;

function PlatformCard({ os, name, subtitle }: (typeof PLATFORMS)[number]) {
  const { desktopId, env } = useEnv();
  const builds = DOWNLOADS.filter((b) => b.os === os);
  const [selected, setSelected] = useState<string | null>(null);
  const recommended = builds.find((b) => b.id === desktopId);
  const build = builds.find((b) => b.id === selected) ?? recommended ?? builds[0]!;
  return (
    <motion.article
      data-floating
      layout
      whileHover={{ y: -7 }}
      className={cn(
        "glass flex min-w-0 flex-col rounded-[2rem] p-6",
        env?.os === os && "ring-1 ring-primary/50",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <BuildIcon os={os} className="h-9 w-9 text-primary" />
        <span className={cn("chip", env?.os === os && "text-primary")}>
          {os === "macos" ? "Coming soon" : env?.os === os ? "Your platform" : "Available"}
        </span>
      </div>
      <h3 className="mt-6 font-display text-3xl font-semibold">{name}</h3>
      <p className="mt-2 min-h-12 text-sm text-muted-foreground">{subtitle}</p>
      {builds.length > 1 && (
        <div className="mt-5">
          <label
            htmlFor={`format-${os}`}
            className="mb-2 block font-mono text-xs text-muted-foreground"
          >
            Package format
          </label>
          <select
            id={`format-${os}`}
            data-analytics-event="package_select"
            data-analytics-label="Package format"
            value={build.id}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 text-sm text-foreground"
          >
            {builds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.ext} · {b.arch}
                {b.id === desktopId ? " · Recommended" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      <ul className="mt-auto pt-6">
        <DownloadRow key={build.id} build={build} recommended={false} compact />
      </ul>
    </motion.article>
  );
}

export function SmartDownload() {
  const { env, label, extensionId } = useEnv();
  return (
    <section
      id="downloads"
      aria-labelledby="downloads-title"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5">
        <p className="eyebrow mb-4">Downloads · v{RELEASE.version}</p>
        <h2 id="downloads-title" className="text-huge">
          Your OS. Your download.
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Choose your platform, pick a package, and go. Direct GitHub release files with checksums
          and installation details.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
            <Scan className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-muted-foreground">Detected:</span>
            <span className="font-semibold" aria-live="polite">
              {label}
            </span>
          </span>
          {env && <ChangeMenu />}
        </div>
        {env?.isMobile && (
          <div className="mt-6">
            <MobileHandoff />
          </div>
        )}
        <LayoutGroup>
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <PlatformCard key={platform.os} {...platform} />
            ))}
          </div>
          <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Connect your browser</p>
              <h3 className="font-display text-2xl font-semibold">
                Catch the link. Let Okytes take over.
              </h3>
            </div>
          </div>
          <ul aria-label="Browser extensions" className="mt-6 grid gap-5 md:grid-cols-3">
            {DOWNLOADS.filter((b) => b.extensionOnly).map((b) => (
              <DownloadRow
                key={b.id}
                build={b}
                recommended={!b.comingSoon && b.id === extensionId}
                compact
              />
            ))}
          </ul>
        </LayoutGroup>
      </div>
    </section>
  );
}
