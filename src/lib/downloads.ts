/**
 * THE single source of truth for every downloadable build.
 * To ship a new release: bump RELEASE, then update `url`, `sha256`, `sizeMB`
 * (and `install` snippets) on each row below. Nothing else needs to change.
 *
 * sha256 / sizeMB are optional — chips hide when empty. The values below were
 * copied from the GitHub release asset metadata for v0.0.1 (api.github.com
 * /repos/dippendicular/okytes/releases → assets[].digest / size).
 */
import type { Browser, DetectResult } from "./detect";
import { CHROMIUM_BROWSERS } from "./detect";

export const REPO_URL = "https://github.com/dippendicular/okytes/";
export const REPO_API = "https://api.github.com/repos/dippendicular/okytes";
export const RELEASES_URL = "https://github.com/dippendicular/okytes/releases";
export const DEVELOPER_DOCS_URL = "https://github.com/dippendicular/okytes/wiki/Developer-Documentations";
export const ISSUES_GOOD_FIRST =
  "https://github.com/dippendicular/okytes/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22";
// TODO: point at a dedicated ROADMAP.md once the repo has one.
export const ROADMAP_URL = "https://github.com/dippendicular/okytes#readme";

export const RELEASE = {
  version: "0.0.1",
  tag: "v0.0.1",
  name: "Initial Testing Release",
  license: "MIT or Apache-2.0",
};

export type BuildOS = "windows" | "linux" | "macos" | "chromium" | "firefox" | "safari";

export interface DownloadBuild {
  id: string;
  os: BuildOS;
  label: string;
  description: string;
  /** File type chip, e.g. ".exe" */
  ext: string;
  arch: string;
  /** Omit for comingSoon rows. Must be a real file. */
  url?: string;
  /** true = browser extension row */
  extensionOnly: boolean;
  comingSoon?: boolean;
  sha256?: string;
  sizeMB?: number;
  /** Shell snippets shown in the expandable row */
  install?: string[];
}

export const DOWNLOADS: DownloadBuild[] = [
  {
    id: "win-exe",
    os: "windows",
    label: "Windows installer",
    description: "Setup wizard. Easiest way in.",
    ext: ".exe",
    arch: "x64",
    url: "https://github.com/dippendicular/okytes/releases/download/v0.0.1/Okytes_0.1.0_x64-setup.exe",
    extensionOnly: false,
    sha256: "bccd33394ac32f59e8d4db0eabdd018210c01471f4e159d44aaad71c347302aa",
    sizeMB: 26.33,
  },
  {
    id: "win-msi",
    os: "windows",
    label: "Windows MSI",
    description: "For managed or scripted installs.",
    ext: ".msi",
    arch: "x64",
    url: "https://github.com/dippendicular/okytes/releases/download/v0.0.1/Okytes_0.1.0_x64_en-US.msi",
    extensionOnly: false,
    sha256: "9022af74630d56c0c2d54e9daaee35493793bb6b9c0ad527e87c6f4512ebc9ef",
    sizeMB: 38.61,
  },
  {
    id: "linux-deb",
    os: "linux",
    label: "Linux .deb",
    description: "Debian, Ubuntu, Mint, Pop!_OS.",
    ext: ".deb",
    arch: "amd64",
    url: "https://github.com/dippendicular/okytes/releases/download/v0.0.1/Okytes_0.0.1_amd64.deb",
    extensionOnly: false,
    sha256: "4ba67440aadac67a475a5557e26674421f2642094299c32c8aed22e16988b14c",
    sizeMB: 45.63,
    install: ["sudo dpkg -i Okytes_0.0.1_amd64.deb"],
  },
  {
    id: "linux-appimage",
    os: "linux",
    label: "Linux AppImage",
    description: "Universal. Runs on most distros.",
    ext: ".AppImage",
    arch: "amd64",
    url: "https://github.com/dippendicular/okytes/releases/download/v0.0.1/Okytes_0.0.1_amd64.AppImage",
    extensionOnly: false,
    sha256: "abfe1d37b2fcd706c83731b39e0ecf524d52325170587d036c413928eb5b23b5",
    sizeMB: 115.43,
    install: ["chmod +x Okytes_0.0.1_amd64.AppImage", "./Okytes_0.0.1_amd64.AppImage"],
  },
  {
    id: "linux-rpm",
    os: "linux",
    label: "Linux .rpm",
    description: "Fedora, RHEL, openSUSE.",
    ext: ".rpm",
    arch: "x86_64",
    url: "https://github.com/dippendicular/okytes/releases/download/v0.0.1/Okytes-0.0.1-1.x86_64.rpm",
    extensionOnly: false,
    sha256: "a25f82c9f94c356ae1a9613f56b8fa626f20e8f9fd5118f75a5367a13de4da7d",
    sizeMB: 45.74,
    install: ["sudo rpm -i Okytes-0.0.1-1.x86_64.rpm"],
  },
  {
    id: "macos",
    os: "macos",
    label: "macOS",
    description: "Apple Silicon + Intel. Coming soon.",
    ext: ".dmg",
    arch: "universal",
    extensionOnly: false,
    comingSoon: true,
  },
  {
    id: "ext-chromium",
    os: "chromium",
    label: "Chromium extension",
    description: "Chrome, Edge, Brave, Opera, Vivaldi.",
    ext: ".zip",
    arch: "any",
    url: "https://github.com/dippendicular/okytes/releases/download/v0.0.1/okytes_chrome_extension_v0.0.1.zip",
    extensionOnly: true,
    sha256: "2e0059a46ada53024544ef7135fe9e99361f4978175ec35c3b14266dbace1419",
    sizeMB: 0.529,
  },
  {
    id: "ext-firefox",
    os: "firefox",
    label: "Firefox extension",
    description: "Hands Firefox downloads to the engine.",
    ext: ".zip",
    arch: "any",
    url: "https://github.com/dippendicular/okytes/releases/download/v0.0.1/okytes_firefox_extension_v0.0.1.zip",
    extensionOnly: true,
    sha256: "72ae7861d56e60a8f2485fabb9b41c5588a5be30210fb58bcd02c91f30319f9a",
    sizeMB: 0.529,
  },
  {
    id: "ext-safari",
    os: "safari",
    label: "Safari extension",
    description: "Safari extension coming soon.",
    ext: ".zip",
    arch: "any",
    extensionOnly: true,
    comingSoon: true,
  },
];

export function getBuild(id: string) {
  return DOWNLOADS.find((d) => d.id === id);
}

export function fileName(build: DownloadBuild) {
  return build.url ? decodeURIComponent(build.url.split("/").pop() ?? "") : "";
}

export function formatSize(sizeMB?: number) {
  if (sizeMB == null) return "";
  if (sizeMB < 1) return `${Math.round(sizeMB * 1024)} KB`;
  return `${sizeMB.toFixed(1)} MB`;
}

export type EnvLike = Pick<DetectResult, "os" | "distroFamily" | "browser" | "isMobile">;

/** Recommended desktop build id for an environment (or null when nothing fits). */
export function recommendDesktop(env: EnvLike): string | null {
  switch (env.os) {
    case "windows":
      return "win-exe";
    case "linux":
      if (env.distroFamily === "deb") return "linux-deb";
      if (env.distroFamily === "rpm") return "linux-rpm";
      return "linux-appimage";
    case "macos":
      return "macos";
    default:
      return null;
  }
}

/** Recommended browser-extension build id. */
export function recommendExtension(browser: Browser): string | null {
  if (CHROMIUM_BROWSERS.includes(browser)) return "ext-chromium";
  if (browser === "firefox") return "ext-firefox";
  if (browser === "safari") return "ext-safari";
  return null;
}

/** Recommended builds first, keeping the rest in file order. */
export function orderBuilds(builds: DownloadBuild[], recommended: (string | null)[]) {
  const rec = recommended.filter(Boolean) as string[];
  return [...builds].sort((a, b) => {
    const ra = rec.indexOf(a.id);
    const rb = rec.indexOf(b.id);
    if (ra === -1 && rb === -1) return 0;
    if (ra === -1) return 1;
    if (rb === -1) return -1;
    return ra - rb;
  });
}
