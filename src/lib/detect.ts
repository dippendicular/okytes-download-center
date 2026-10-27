/**
 * Client-side environment detection. Pure + unit-testable: `detect()` takes plain
 * strings so tests never need a real browser. `detectFromNavigator()` gathers the
 * inputs from the live browser (User-Agent Client Hints when available).
 *
 * Detection only *enhances* which build is recommended. Every download link on the
 * page works without it.
 */

export type OS = "windows" | "linux" | "macos" | "android" | "ios" | "unknown";
export type Arch = "x64" | "arm64" | "x86" | "unknown";
export type Browser =
  | "chrome"
  | "edge"
  | "brave"
  | "opera"
  | "vivaldi"
  | "firefox"
  | "safari"
  | "unknown";
/** Linux package family. Best-effort: most Linux browsers don't expose the distro. */
export type DistroFamily = "deb" | "rpm" | "unknown" | null;

export interface DetectInput {
  userAgent: string;
  /** navigator.platform (legacy) */
  platform?: string;
  /** navigator.userAgentData.platform, e.g. "Windows", "macOS", "Linux" */
  uaDataPlatform?: string;
  /** Client-hint "architecture", e.g. "x86" or "arm" */
  architecture?: string;
  /** Client-hint "bitness", e.g. "64" */
  bitness?: string;
  /** Client-hint "platformVersion" (Windows 11 reports major >= 13) */
  platformVersion?: string;
  /** navigator.userAgentData.mobile */
  uaDataMobile?: boolean;
  /** navigator.userAgentData.brands[].brand */
  brands?: string[];
  /** result of navigator.brave?.isBrave() */
  isBrave?: boolean;
  maxTouchPoints?: number;
}

export interface DetectResult {
  os: OS;
  arch: Arch;
  browser: Browser;
  distroFamily: DistroFamily;
  isMobile: boolean;
  /** Human label, e.g. "Windows 11", "Ubuntu", "macOS" */
  osLabel: string;
}

export const BROWSER_LABEL: Record<Browser, string> = {
  chrome: "Chrome",
  edge: "Edge",
  brave: "Brave",
  opera: "Opera",
  vivaldi: "Vivaldi",
  firefox: "Firefox",
  safari: "Safari",
  unknown: "your browser",
};

export const CHROMIUM_BROWSERS: Browser[] = ["chrome", "edge", "brave", "opera", "vivaldi"];

function detectOS(i: DetectInput): OS {
  const ua = i.userAgent;
  const p = (i.uaDataPlatform ?? "").toLowerCase();
  if (p) {
    if (p.includes("android")) return "android";
    if (p === "ios" || p.includes("iphone") || p.includes("ipad")) return "ios";
    if (p.includes("win")) return "windows";
    if (p.includes("mac")) return "macos";
    if (p.includes("linux") || p.includes("chrome os") || p.includes("chromeos")) return "linux";
  }
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  // iPadOS 13+ pretends to be a Mac; touch points give it away.
  if (/macintosh/i.test(ua) && (i.maxTouchPoints ?? 0) > 1) return "ios";
  if (/windows|win32|win64/i.test(ua) || /^win/i.test(i.platform ?? "")) return "windows";
  if (/mac os x|macintosh/i.test(ua) || /^mac/i.test(i.platform ?? "")) return "macos";
  if (/cros|linux|x11/i.test(ua) || /linux/i.test(i.platform ?? "")) return "linux";
  return "unknown";
}

function detectArch(i: DetectInput, os: OS): Arch {
  const a = (i.architecture ?? "").toLowerCase();
  if (a) {
    if (a.startsWith("arm")) return i.bitness === "32" ? "unknown" : "arm64";
    if (a.startsWith("x86")) return i.bitness === "32" ? "x86" : "x64";
  }
  const ua = i.userAgent;
  if (/arm64|aarch64/i.test(ua)) return "arm64";
  if (/x86_64|x64|win64|wow64|amd64/i.test(ua)) return "x64";
  if (/i[3-6]86/i.test(ua)) return "x86";
  if (os === "windows" || os === "linux") return "x64";
  return "unknown";
}

function detectBrowser(i: DetectInput): Browser {
  if (i.isBrave) return "brave";
  const ua = i.userAgent;
  const brands = (i.brands ?? []).join(" ").toLowerCase();
  if (/edg(e|a|ios)?\//i.test(ua) || brands.includes("microsoft edge")) return "edge";
  if (/opr\/|opera/i.test(ua) || brands.includes("opera")) return "opera";
  if (/vivaldi/i.test(ua)) return "vivaldi";
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/chrome|crios|chromium/i.test(ua) || brands.includes("chromium")) return "chrome";
  if (/safari/i.test(ua)) return "safari";
  return "unknown";
}

const DEB_DISTROS = /ubuntu|debian|mint|pop!_os|elementary|kali|zorin/i;
const RPM_DISTROS = /fedora|red hat|rhel|centos|rocky|alma|opensuse|suse/i;

function detectDistro(ua: string): { family: DistroFamily; name?: string } {
  const deb = ua.match(DEB_DISTROS);
  if (deb) return { family: "deb", name: deb[0] };
  const rpm = ua.match(RPM_DISTROS);
  if (rpm) return { family: "rpm", name: rpm[0] };
  return { family: "unknown" };
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function detect(input: DetectInput): DetectResult {
  const os = detectOS(input);
  const arch = detectArch(input, os);
  const browser = detectBrowser(input);
  const isMobile = os === "android" || os === "ios" || input.uaDataMobile === true;

  let distroFamily: DistroFamily = null;
  let osLabel = "your device";
  if (os === "linux") {
    const d = detectDistro(input.userAgent);
    distroFamily = d.family;
    osLabel = d.name ? titleCase(d.name.toLowerCase()) : "Linux";
  } else if (os === "windows") {
    const major = Number.parseInt(input.platformVersion ?? "", 10);
    osLabel = Number.isFinite(major) ? (major >= 13 ? "Windows 11" : "Windows 10") : "Windows";
  } else if (os === "macos") osLabel = "macOS";
  else if (os === "android") osLabel = "Android";
  else if (os === "ios") osLabel = "iOS";

  return { os, arch, browser, distroFamily, isMobile, osLabel };
}

interface UADataLike {
  platform?: string;
  mobile?: boolean;
  brands?: { brand: string }[];
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, string | undefined>>;
}

/** Browser-only. Call from an effect or event handler. */
export async function detectFromNavigator(): Promise<DetectResult> {
  const nav = navigator as Navigator & {
    userAgentData?: UADataLike;
    brave?: { isBrave?: () => Promise<boolean> };
  };
  const input: DetectInput = {
    userAgent: nav.userAgent,
    platform: nav.platform,
    maxTouchPoints: nav.maxTouchPoints,
  };
  const uad = nav.userAgentData;
  if (uad) {
    input.uaDataPlatform = uad.platform;
    input.uaDataMobile = uad.mobile;
    input.brands = uad.brands?.map((b) => b.brand);
    try {
      const hev = await uad.getHighEntropyValues?.([
        "platform",
        "architecture",
        "bitness",
        "platformVersion",
      ]);
      if (hev) {
        input.uaDataPlatform = hev.platform ?? input.uaDataPlatform;
        input.architecture = hev.architecture;
        input.bitness = hev.bitness;
        input.platformVersion = hev.platformVersion;
      }
    } catch {
      /* hints denied — fall back to UA */
    }
  }
  try {
    input.isBrave = (await nav.brave?.isBrave?.()) ?? false;
  } catch {
    input.isBrave = false;
  }
  return detect(input);
}
