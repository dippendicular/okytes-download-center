export const NAV_LINKS = [
  { id: "downloads", label: "Downloads" },
  { id: "features", label: "Features" },
  { id: "architecture", label: "Architecture" },
  { id: "compare", label: "Compare" },
  { id: "contribute", label: "Contribute" },
] as const;

export type MilestoneState = "shipped" | "next" | "planned";

/**
 * Milestones reflect product scope only — no dates, no promises.
 * TODO(maintainer): replace with the real roadmap order once it is published.
 */
export const MILESTONES: { title: string; body: string; state: MilestoneState }[] = [
  {
    title: "v0.0.1 · Initial Testing Release",
    body: "Windows + Linux desktop builds and browser extensions.",
    state: "shipped",
  },
  {
    title: "Recovery & verification",
    body: "Durable checkpoints, safe resume, SHA-256 publish gate.",
    state: "next",
  },
  {
    title: "More protocols",
    body: "BitTorrent, FTP/FTPS/SFTP, HLS/DASH.",
    state: "planned",
  },
  {
    title: "LAN Share + automation",
    body: "Device-to-device transfer, CLI, daemon and local API.",
    state: "planned",
  },
  {
    title: "macOS",
    body: "Apple Silicon and Intel builds.",
    state: "planned",
  },
];
