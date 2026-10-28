/**
 * Feature status config — the ONLY place to flip "planned" ↔ "available".
 *
 * Available transfer adapters and recovery mechanisms are checked against the
 * v0.0.1 release workspace. Only available entries belong in the public showcase.
 */
export type FeatureStatus = "available" | "planned";

export const FEATURE_STATUS = {
  http: "available",
  bittorrent: "available",
  ftp: "available",
  hls: "available",
  lanShare: "available",
  queue: "available",
  controls: "planned",
  intake: "planned",
  history: "planned",
  diagnostics: "planned",
  extensions: "available",
  quickDownload: "planned",
  cli: "planned",
  daemon: "planned",
  sharedInfra: "planned",
  // Core-engine behaviours shown in the feature showcase / compare table.
  // Verified against v0.0.1 engine, HTTP transport, and scheduler source.
  crashSafe: "available",
  safeResume: "available",
  verified: "available",
  adaptive: "available",
} satisfies Record<string, FeatureStatus>;

export type FeatureKey = keyof typeof FEATURE_STATUS;

export const SHOWCASE_FEATURES: readonly { key: FeatureKey; title: string; body: string }[] = [
  {
    key: "safeResume",
    title: "Safe resume",
    body: "Checks the remote file before continuing. If the source has changed, Okytes won't silently combine two versions.",
  },
  {
    key: "crashSafe",
    title: "Crash-safe recovery",
    body: "Only committed bytes count as saved progress. Resume from the last durable checkpoint after an interruption.",
  },
  {
    key: "verified",
    title: "Verified downloads",
    body: "Calculates SHA-256, checks an expected hash when provided, and publishes the completed file after validation.",
  },
  {
    key: "adaptive",
    title: "Adaptive acceleration",
    body: "Adjusts connections based on measured throughput instead of blindly opening more workers.",
  },
  {
    key: "lanShare",
    title: "LAN Share",
    body: "Send files and folders directly between paired devices. Encrypted transfers, receiver approval, integrity checks, and durable resume keep local sharing under your control.",
  },
  {
    key: "bittorrent",
    title: "BitTorrent & magnets",
    body: "Add a torrent or magnet link, choose the files you want, and track verified pieces. Control seeding without leaving your download queue.",
  },
  {
    key: "http",
    title: "Parallel HTTP & HTTPS",
    body: "Transfer non-overlapping byte ranges in parallel, retry with backoff, and respect server connection limits.",
  },
  {
    key: "ftp",
    title: "FTP, FTPS & SFTP",
    body: "Download from file servers with resumable transfers. SFTP host-key checks help keep the connection tied to the server you intended.",
  },
  {
    key: "hls",
    title: "HLS & DASH media",
    body: "Choose quality, audio, and subtitles for supported unprotected on-demand streams. Keep media transfers alongside your other downloads.",
  },
  {
    key: "queue",
    title: "One persistent queue",
    body: "Organize transfers in one place and keep your queue across app restarts. Your next download stays ready when you return.",
  },
  {
    key: "extensions",
    title: "Browser handoff",
    body: "Send links from Chromium browsers or Firefox to the installed desktop app. The browser captures the link; the shared engine handles the transfer.",
  },
];

export interface BentoItem {
  key: FeatureKey;
  title: string;
  body: string;
}

export interface BentoGroup {
  id: string;
  label: string;
  items: BentoItem[];
}

export const BENTO: BentoGroup[] = [
  {
    id: "download",
    label: "Download",
    items: [
      {
        key: "http",
        title: "HTTP / HTTPS",
        body: "Parallel byte-range transfers, dynamic work allocation, retry with backoff, server-aware throttling.",
      },
      {
        key: "bittorrent",
        title: "BitTorrent",
        body: "Magnet links, DHT, trackers, selective downloads, piece verification, seeding.",
      },
      {
        key: "ftp",
        title: "FTP / FTPS / SFTP",
        body: "Browse, upload, download, resume where supported.",
      },
      {
        key: "hls",
        title: "HLS / DASH",
        body: "Unprotected streams with quality, audio and subtitle choice.",
      },
      {
        key: "lanShare",
        title: "LAN Share",
        body: "Authenticated, encrypted device-to-device transfer. Receiver approval, durable resume, integrity checks, discovery with manual-address fallback.",
      },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      {
        key: "queue",
        title: "Persistent queue",
        body: "Priorities, scheduling and bandwidth limits that survive restarts.",
      },
      {
        key: "controls",
        title: "Full control",
        body: "Pause, resume, retry, cancel — one at a time or in batches.",
      },
      {
        key: "intake",
        title: "Smart intake",
        body: "Drag-and-drop links, duplicate detection, conflict handling.",
      },
      {
        key: "history",
        title: "History & tray",
        body: "Searchable history, filters, notifications, tray controls.",
      },
      {
        key: "diagnostics",
        title: "Transfer diagnostics",
        body: "Workers, byte ranges, retries, speed and errors — all visible.",
      },
    ],
  },
  {
    id: "integrate",
    label: "Integrate",
    items: [
      {
        key: "extensions",
        title: "Browser extensions",
        body: "Chrome, Edge, Brave, Opera, Vivaldi and Firefox hand downloads to the engine.",
      },
      {
        key: "quickDownload",
        title: "Quick Download page",
        body: "A local page for links the browser interception missed.",
      },
      {
        key: "cli",
        title: "CLI with JSON",
        body: "Script it. Pipe it. `okytes list --json`.",
      },
      {
        key: "daemon",
        title: "Background daemon",
        body: "Optional, with an authenticated local API.",
      },
      {
        key: "sharedInfra",
        title: "Shared infrastructure",
        body: "Desktop, browser, CLI and future SDKs on the same plumbing.",
      },
    ],
  },
];
