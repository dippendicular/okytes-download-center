/**
 * Architecture comparison, pinned to ODM's published release source.
 * Competitor entries describe documented behavior, not inferred missing features.
 * No licensing, benchmark guesses, or roadmap capabilities belong in this table.
 */
import { RELEASE, RELEASES_URL, REPO_URL } from "./downloads";

export const LAST_VERIFIED = "2026-10-28";
const RELEASE_SOURCE = `${REPO_URL.replace(/\/$/, "")}/blob/${RELEASE.tag}`;

export const SOURCES = {
  okytes: {
    source: `${RELEASE_SOURCE}/Cargo.toml`,
    downloads: RELEASES_URL,
    engine: `${RELEASE_SOURCE}/crates/core/src/engine.rs`,
    scheduler: `${RELEASE_SOURCE}/crates/core/src/scheduler.rs`,
    http: `${RELEASE_SOURCE}/crates/transport-http/src/lib.rs`,
    api: `${RELEASE_SOURCE}/apps/daemon/src/auth.rs`,
    clients: `${RELEASE_SOURCE}/README.md#how-it-works`,
  },
  idm: {
    home: "https://www.internetdownloadmanager.com/",
    features: "https://www.internetdownloadmanager.com/features2.html",
    cli: "https://ww2.internetdownloadmanager.com/support/command_line.html",
  },
  fdm: {
    features: "https://www.freedownloadmanager.org/features.htm",
    downloads: "https://www.freedownloadmanager.org/download.htm",
  },
  xdm: {
    source: "https://github.com/subhra74/xdm#building-from-source",
    features: "https://github.com/subhra74/xdm#whats-new-in-xdm-9",
    home: "https://xtremedownloadmanager.com/",
    downloads: "https://xtremedownloadmanager.com/download/",
    linux: "https://xtremedownloadmanager.com/download/linux/",
  },
} as const;

export const PRODUCTS = [
  { id: "okytes", name: "ODM", description: "Native transfer engine · v" + RELEASE.version },
  { id: "idm", name: "IDM", description: "Internet Download Manager" },
  { id: "fdm", name: "FDM", description: "Free Download Manager 6.x" },
  { id: "xdm", name: "XDM", description: "Xtreme Download Manager 9" },
] as const;

export type ProductId = (typeof PRODUCTS)[number]["id"];
export type CellKind = "yes" | "no" | "info" | "soon";
export interface Cell {
  kind: CellKind;
  text: string;
  detail?: string;
  source: string;
}
export interface CompareRow {
  id: string;
  label: string;
  description: string;
  cells: Record<ProductId, Cell>;
}

export const ENGINE_ADVANTAGES = [
  {
    id: "adaptive",
    title: "Scale when it pays.",
    body: "Measure throughput, probe more workers, keep them only when the gain is real. Respect per-origin connection budgets.",
    proof: "EWMA sampling + bounded concurrency probes",
    source: SOURCES.okytes.scheduler,
  },
  {
    id: "durable",
    title: "Commit before counting.",
    body: "Write the bytes, sync them to disk, then commit the checkpoint. Recovery starts from durable progress, not a UI counter.",
    proof: "write → sync_data → SQLite checkpoint",
    source: SOURCES.okytes.engine,
  },
  {
    id: "control",
    title: "One queue. Every interface.",
    body: "Desktop, browser and automation use the same transfer core. Revocable, scoped API credentials keep programmatic control explicit.",
    proof: "Shared engine + authenticated local control",
    source: SOURCES.okytes.api,
  },
] as const;

export const COMPARE_ROWS: CompareRow[] = [
  {
    id: "parallel",
    label: "Concurrency strategy",
    description: "How extra connections are put to work.",
    cells: {
      okytes: {
        kind: "yes",
        text: "Throughput-driven worker scaling",
        detail: "EWMA measurements; extra workers must earn their place.",
        source: SOURCES.okytes.scheduler,
      },
      idm: {
        kind: "yes",
        text: "Dynamic segment splitting",
        detail: "Splits the largest unfinished segment; reuses connections.",
        source: SOURCES.idm.features,
      },
      fdm: {
        kind: "yes",
        text: "Multi-section downloading",
        detail: "Transfers several file sections in parallel.",
        source: SOURCES.fdm.features,
      },
      xdm: {
        kind: "yes",
        text: "Segmented multi-connection transfers",
        detail: "Splits downloads across connections.",
        source: SOURCES.xdm.home,
      },
    },
  },
  {
    id: "recovery",
    label: "Recovery contract",
    description: "What progress means after an interruption.",
    cells: {
      okytes: {
        kind: "yes",
        text: "Disk sync before checkpoint commit",
        detail: "Only committed bytes count as durable progress.",
        source: SOURCES.okytes.engine,
      },
      idm: {
        kind: "yes",
        text: "Interrupted-download recovery",
        detail: "Resumes after network loss, shutdowns and power outages.",
        source: SOURCES.idm.features,
      },
      fdm: {
        kind: "yes",
        text: "Resume interrupted transfers",
        detail: "Continues from where the download stopped.",
        source: SOURCES.fdm.features,
      },
      xdm: {
        kind: "yes",
        text: "Preserves progress on disk errors",
        detail: "Disk-full or missing-folder failures keep existing progress.",
        source: SOURCES.xdm.features,
      },
    },
  },
  {
    id: "resume",
    label: "HTTP resume behavior",
    description: "Continue a partial file against its source.",
    cells: {
      okytes: {
        kind: "yes",
        text: "Strong ETag + range validation",
        detail: "Checks source identity before continuing a partial transfer.",
        source: SOURCES.okytes.http,
      },
      idm: {
        kind: "yes",
        text: "Resume unfinished downloads",
        detail: "Error recovery restarts interrupted transfers.",
        source: SOURCES.idm.features,
      },
      fdm: {
        kind: "yes",
        text: "Continue without starting over",
        detail: "Resume support for interrupted downloads.",
        source: SOURCES.fdm.features,
      },
      xdm: {
        kind: "yes",
        text: "Resume + expired-link refresh",
        detail: "Refresh a download URL without losing existing progress.",
        source: SOURCES.xdm.source,
      },
    },
  },
  {
    id: "architecture",
    label: "Engine & client design",
    description: "Where the transfer work actually lives.",
    cells: {
      okytes: {
        kind: "yes",
        text: "Shared, UI-independent native core",
        detail: "Desktop, daemon and CLI reuse the same engine; no JVM.",
        source: SOURCES.okytes.source,
      },
      idm: {
        kind: "info",
        text: "Windows app + browser integration",
        detail: "Desktop application handles captured downloads.",
        source: SOURCES.idm.features,
      },
      fdm: {
        kind: "info",
        text: "Desktop app + add-on pipeline",
        detail: "Extensions and add-ons expand download intake.",
        source: SOURCES.fdm.features,
      },
      xdm: {
        kind: "yes",
        text: "Separate Java core + Swing UI",
        detail: "UI-independent download engine; JVM-based application.",
        source: SOURCES.xdm.source,
      },
    },
  },
  {
    id: "automation",
    label: "Programmatic control",
    description: "How downloads fit into your own workflows.",
    cells: {
      okytes: {
        kind: "yes",
        text: "CLI + scoped local API",
        detail: "Revocable credentials; clients share engine-owned state.",
        source: SOURCES.okytes.api,
      },
      idm: {
        kind: "yes",
        text: "Command-line job launching",
        detail: "Start downloads or queue URLs from scripts.",
        source: SOURCES.idm.cli,
      },
      fdm: {
        kind: "yes",
        text: "Android remote control",
        detail: "Create downloads remotely with FDM on both devices.",
        source: SOURCES.fdm.features,
      },
      xdm: {
        kind: "yes",
        text: "Headless command-line mode",
        detail: "Download from a terminal alongside the desktop app.",
        source: SOURCES.xdm.features,
      },
    },
  },
  {
    id: "linux-packages",
    label: "Linux deployment",
    description: "Native formats and a portable option.",
    cells: {
      okytes: {
        kind: "yes",
        text: "DEB · RPM · AppImage",
        detail: "A portable image alongside native distro packages.",
        source: SOURCES.okytes.downloads,
      },
      idm: { kind: "no", text: "No native Linux release", source: SOURCES.idm.home },
      fdm: { kind: "yes", text: "DEB · Flatpak", source: SOURCES.fdm.downloads },
      xdm: { kind: "yes", text: "DEB · RPM · Arch · tar.gz", source: SOURCES.xdm.linux },
    },
  },
  {
    id: "macos",
    label: "macOS availability",
    description: "Current desktop release support.",
    cells: {
      okytes: { kind: "soon", text: "Coming soon", source: SOURCES.okytes.downloads },
      idm: { kind: "no", text: "No macOS release", source: SOURCES.idm.home },
      fdm: { kind: "yes", text: "Apple Silicon · Intel", source: SOURCES.fdm.downloads },
      xdm: { kind: "yes", text: "Apple Silicon · Intel", source: SOURCES.xdm.downloads },
    },
  },
];
