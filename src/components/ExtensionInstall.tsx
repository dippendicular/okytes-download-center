import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Info,
  Play,
  RotateCcw,
  Square,
  Wrench,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useEnv } from "@/hooks/use-env";
import { announceDownload } from "@/lib/download-events";
import { fileName, REPO_URL, RELEASE, type DownloadBuild } from "@/lib/downloads";
import { trackEvent } from "@/lib/analytics";
import {
  CHROMIUM_INSTALL_BROWSERS,
  extensionInstructions,
  initialInstallBrowser,
  type ExtensionFamily,
} from "@/lib/extension-install";

function Walkthrough({ family }: { family: ExtensionFamily }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface">
      <video
        ref={video}
        src={`/videos/install-${family}.webm`}
        preload="metadata"
        playsInline
        muted
        aria-label={`Illustrated ${family === "firefox" ? "Firefox" : "Chromium"} extension installation walkthrough`}
        className="aspect-video w-full min-w-0 bg-surface-2 object-contain"
        onPlay={() => {
          setError(false);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          trackEvent("extension_video_complete", { browser: family, source: "extension_install" });
        }}
        onError={() => setError(true)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-analytics-event="extension_video_toggle"
            data-analytics-action={playing ? "pause" : "play"}
            onClick={() => {
              const el = video.current;
              if (!el) return;
              if (playing) el.pause();
              else void el.play().catch(() => setError(true));
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            {playing ? (
              <Square className="h-3 w-3" aria-hidden />
            ) : (
              <Play className="h-3 w-3" aria-hidden />
            )}
            {playing ? "Pause" : "Play guide"}
          </button>
          <button
            type="button"
            data-analytics-event="extension_video_restart"
            onClick={() => {
              if (video.current) {
                video.current.currentTime = 0;
                void video.current.play().catch(() => setError(true));
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Replay
          </button>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          18 sec · illustrated walkthrough
        </span>
      </div>
      <p className="px-3 pb-3 text-xs text-muted-foreground" role={error ? "status" : undefined}>
        {error
          ? "Video unavailable in this browser. All installation steps are written below."
          : "An animated illustration, not a browser screen recording. Controls may look different in your browser."}
      </p>
    </div>
  );
}

export function ExtensionInstall({ build }: { build: DownloadBuild }) {
  const { env } = useEnv();
  const family: ExtensionFamily = build.os === "firefox" ? "firefox" : "chromium";
  const [open, setOpen] = useState(false);
  const [browser, setBrowser] = useState(() => initialInstallBrowser(env?.browser));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const addressInput = useRef<HTMLInputElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const address =
    family === "firefox"
      ? "about:debugging#/runtime/this-firefox"
      : CHROMIUM_INSTALL_BROWSERS.find((item) => item.id === browser)!.address;
  const name = family === "firefox" ? "Firefox" : "Chromium";
  const guide = `${REPO_URL.replace(/\/$/, "")}/blob/${RELEASE.tag}/INSTALLATION.md#browser-integration-and-background-service`;
  const copyAddress = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(address);
      copied = true;
    } catch {
      addressInput.current?.focus();
      addressInput.current?.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        /* Keep address selected for manual copy. */
      }
    }
    setCopyState(copied ? "copied" : "manual");
    trackEvent("extension_dev_mode_result", {
      source: "extension_install",
      build_id: build.id,
      browser: family === "firefox" ? "firefox" : browser,
      result: copied ? "address_copied" : "manual_copy_required",
    });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setBrowser(initialInstallBrowser(env?.browser));
          setCopyState("idle");
        } else
          trackEvent("extension_install_close", {
            source: "extension_install",
            build_id: build.id,
            browser: family,
          });
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          data-analytics-event="extension_install_open"
          data-analytics-browser={family}
          aria-label={`Install ${name} extension`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20"
        >
          <Wrench className="h-4 w-4" aria-hidden />
          Install
        </button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          title.current?.focus({ preventScroll: true });
        }}
        data-lenis-prevent
        data-analytics-source="extension_install"
        data-analytics-build={build.id}
        data-analytics-browser={family === "firefox" ? "firefox" : browser}
        className="extension-install-modal z-[95] max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-3xl grid-cols-1 gap-5 overflow-y-auto overscroll-contain rounded-3xl border-border bg-popover p-5 text-foreground sm:p-7"
      >
        <div className="pr-6">
          <p className="eyebrow mb-3">Manual development install</p>
          <DialogTitle
            ref={title}
            tabIndex={-1}
            className="font-display text-2xl leading-tight sm:text-3xl"
          >
            Install the {name} extension
          </DialogTitle>
          <DialogDescription className="mt-3 leading-relaxed">
            Current ZIP builds are installed manually, not from an extension store. Follow this
            guide on your desktop browser.
          </DialogDescription>
        </div>
        <div className="flex gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm leading-relaxed">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p>
            {family === "firefox"
              ? "Firefox removes temporary add-ons when it restarts. You must load this development build again after restarting Firefox."
              : "Keep the extracted extension folder. Developer mode must remain enabled, and the desktop app must be installed and running."}
          </p>
        </div>
        <Walkthrough family={family} />
        <section
          aria-label="Open browser development settings"
          className="rounded-2xl border border-border bg-surface/60 p-4"
        >
          {family === "chromium" && (
            <label className="mb-3 block text-sm font-medium">
              Your Chromium browser
              <select
                value={browser}
                onChange={(event) => {
                  setBrowser(event.target.value as typeof browser);
                  setCopyState("idle");
                }}
                data-analytics-event="extension_browser_select"
                data-analytics-label="Installation browser"
                className="mt-2 w-full rounded-xl border border-border bg-popover px-3 py-2.5 text-foreground"
              >
                {CHROMIUM_INSTALL_BROWSERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label htmlFor={`dev-address-${family}`} className="block text-xs text-muted-foreground">
            Paste this address into a new tab in{" "}
            {family === "firefox"
              ? "Firefox"
              : CHROMIUM_INSTALL_BROWSERS.find((item) => item.id === browser)!.label}
          </label>
          <input
            ref={addressInput}
            id={`dev-address-${family}`}
            readOnly
            value={address}
            onFocus={(event) => event.target.select()}
            className="mt-2 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 font-mono text-xs text-foreground sm:text-sm"
          />
          <button
            type="button"
            data-analytics-event="extension_dev_mode_open"
            data-analytics-label="Open dev mode (copy internal address)"
            onClick={() => void copyAddress()}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {copyState === "copied" ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            Open dev mode
          </button>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Browsers prevent websites from opening internal settings pages. This button copies the
            address instead; open a new tab, paste it into the address bar, and press Enter.
          </p>
          <p className="mt-2 text-xs font-medium text-primary" role="status" aria-live="polite">
            {copyState === "copied"
              ? "Address copied. Paste it into a new browser tab to continue."
              : copyState === "manual"
                ? "Automatic copying was blocked. The address is selected; copy it manually and paste it into a new tab."
                : ""}
          </p>
        </section>
        <ol className="space-y-5" aria-label={`${name} installation steps`}>
          {extensionInstructions(family).map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="break-all rounded-xl border border-border bg-surface p-3 font-mono text-[11px] text-muted-foreground">
          Package: {fileName(build)}
        </p>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <a
            href={build.url}
            download
            onClick={(event) => announceDownload(event, build.label)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download ZIP
          </a>
          <a
            href={guide}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm"
          >
            Desktop / native-host help
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <a
            href={
              family === "firefox"
                ? "https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/"
                : "https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked"
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-xs text-muted-foreground"
          >
            Browser docs
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          <DialogClose asChild>
            <button
              type="button"
              className="ml-auto inline-flex rounded-full border border-border px-4 py-2.5 text-sm"
            >
              Done
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
