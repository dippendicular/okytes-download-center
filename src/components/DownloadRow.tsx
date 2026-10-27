import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, ChevronDown, Copy, Download, Eye } from "lucide-react";
import { fileName, formatSize, REPO_URL, type DownloadBuild } from "@/lib/downloads";
import { announceDownload } from "@/lib/download-events";
import { useCopy } from "@/hooks/use-copy";
import { BuildIcon } from "./Icons";
import { UI_SPRING } from "./Magnetic";
import { cn } from "@/lib/utils";
import { ExtensionInstall } from "./ExtensionInstall";

function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      data-analytics-event="checksum_copy"
      data-analytics-label="Copy SHA-256"
      aria-label={copied ? "Copied" : label}
      className={cn(
        "chip transition-colors hover:border-primary/50 hover:text-foreground",
        copied && "border-success/60 text-success",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3 w-3" aria-hidden />
      ) : (
        <Copy className="h-3 w-3" aria-hidden />
      )}
      <span aria-live="polite">{copied ? "copied" : "sha-256"}</span>
    </button>
  );
}

function Snippet({ cmd }: { cmd: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3 py-2">
      <code className="min-w-0 overflow-x-auto whitespace-nowrap font-mono text-xs text-foreground">
        <span className="select-none text-primary">$ </span>
        {cmd}
      </code>
      <button
        type="button"
        onClick={() => copy(cmd)}
        data-analytics-event="command_copy"
        data-analytics-label="Copy install or verification command"
        aria-label={`Copy command: ${cmd}`}
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground",
          copied && "text-success",
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function DownloadRow({
  build,
  recommended,
  compact = false,
}: {
  build: DownloadBuild;
  recommended: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const file = fileName(build);
  const size = formatSize(build.sizeMB);
  const verify = file
    ? build.os === "windows"
      ? `Get-FileHash .\\${file} -Algorithm SHA256`
      : `sha256sum ${file}`
    : "";
  const detailsId = `details-${build.id}`;

  return (
    <motion.li
      data-floating={build.extensionOnly ? true : undefined}
      data-analytics-build={build.id}
      layout
      transition={{ type: "spring", ...UI_SPRING }}
      whileHover={build.comingSoon ? {} : { scale: 1.008 }}
      className={cn(
        "group relative rounded-3xl border border-border bg-card backdrop-blur-md",
        compact && "download-card h-full min-w-0",
        recommended && "glow-ring border-transparent",
        build.comingSoon && "shimmer opacity-80",
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          Recommended for you
        </span>
      )}
      <motion.div
        layout="position"
        className="flex flex-wrap items-center gap-x-5 gap-y-3 p-4 sm:p-5 lg:flex-nowrap"
      >
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2 text-foreground",
            recommended && "text-primary",
          )}
        >
          <BuildIcon os={build.os} className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1 basis-48">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            {build.label}
            {build.comingSoon && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" /> Coming
                soon
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">{build.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip text-foreground">{build.ext}</span>
          <span className="chip">{build.arch}</span>
          {size && <span className="chip">{size}</span>}
          {build.sha256 && (
            <CopyButton text={build.sha256} label={`Copy SHA-256 for ${build.label}`} />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {build.comingSoon ? (
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary/60 hover:text-primary"
            >
              <Eye className="h-4 w-4" aria-hidden /> Watch the repo
            </a>
          ) : (
            <a
              href={build.url}
              download
              onClick={(e) => announceDownload(e, build.label)}
              aria-label={`Download ${build.label} (${build.ext}${size ? `, ${size}` : ""})`}
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary transition-colors duration-300 hover:text-primary-foreground focus-visible:text-primary-foreground [&:hover>span:first-child]:scale-x-100 [&:focus-visible>span:first-child]:scale-x-100"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-primary transition-transform duration-500 ease-out" />
              <Download className="relative h-4 w-4" aria-hidden />
              <span className="relative">Download</span>
            </a>
          )}
          {build.extensionOnly && !build.comingSoon && <ExtensionInstall build={build} />}
          {!build.comingSoon && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              data-analytics-event="download_details_toggle"
              data-analytics-label="Download details"
              aria-expanded={open}
              aria-controls={detailsId}
              aria-label={`${open ? "Hide" : "Show"} details for ${build.label}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            >
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ type: "spring", ...UI_SPRING }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={detailsId}
            key="details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", ...UI_SPRING }}
            className="overflow-hidden"
          >
            <div className="grid min-w-0 gap-2 border-t border-border px-5 py-4 text-sm">
              <p className="font-mono text-xs text-muted-foreground">
                file: <span className="text-foreground">{file}</span>
              </p>
              {build.sha256 && (
                <p className="break-all font-mono text-xs text-muted-foreground">
                  sha-256: <span className="text-success">{build.sha256}</span>
                </p>
              )}
              {build.install?.map((c) => (
                <Snippet key={c} cmd={c} />
              ))}
              {verify && build.sha256 && <Snippet cmd={verify} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
