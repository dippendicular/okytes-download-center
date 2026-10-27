import type { SVGProps } from "react";
import type { BuildOS } from "@/lib/downloads";
import type { OS } from "@/lib/detect";

type P = SVGProps<SVGSVGElement>;

export function WindowsIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M3 5.1 10.2 4v7.3H3V5.1Zm0 13.8L10.2 20v-7.2H3v6.1ZM11.4 3.8 21 2.4v8.9h-9.6V3.8Zm0 16.4 9.6 1.4v-8.8h-9.6v7.4Z" />
    </svg>
  );
}

export function LinuxIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden {...p}>
      <ellipse cx="12" cy="7.2" rx="3.6" ry="4.2" />
      <path d="M8.4 9.5c-2 2.4-3.4 5.3-3 7.7.3 1.7 1.8 2.8 3.4 2.8h6.4c1.6 0 3.1-1.1 3.4-2.8.4-2.4-1-5.3-3-7.7" />
      <path d="M9.6 13.4c.6 1.9 1.4 2.8 2.4 2.8s1.8-.9 2.4-2.8" />
      <circle cx="10.6" cy="6.6" r=".7" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="6.6" r=".7" fill="currentColor" stroke="none" />
      <path d="M11 8.8h2l-1 1-1-1Z" fill="currentColor" />
    </svg>
  );
}

export function AppleIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.3c.9-1.3 1.2-2.5 1.2-2.6 0 0-2.4-.9-2.4-3.8ZM14.1 5.8c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3Z" />
    </svg>
  );
}

export function ChromiumIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 8.6h8.4M9.1 13.7 4.9 6.4M14.9 13.7l-4.2 7.2" />
    </svg>
  );
}

export function FirefoxIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M7 6.5c.2 2 1.6 3 3.3 3.2-1.7 1.4-1.5 4 .5 4.9 2 .9 4.4-.4 4.7-2.7.3-2.1-1-4.2-3.2-5.1 3.7-.4 6.5 2.6 6.4 6" />
    </svg>
  );
}

export function SafariIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.6 8.4-2.2 5-5 2.2 2.2-5 5-2.2Z" />
    </svg>
  );
}

export function PhoneIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden {...p}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

export function GitHubIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function LogoMark(p: P & { drawClass?: string }) {
  const { drawClass, ...rest } = p;
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden {...rest}>
      <path
        className={drawClass}
        d="M20 3a17 17 0 1 0 17 17"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        className={drawClass}
        d="M20 11v15m0 0-6-6m6 6 6-6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BuildIcon({ os, ...p }: P & { os: BuildOS | OS }) {
  switch (os) {
    case "windows":
      return <WindowsIcon {...p} />;
    case "linux":
      return <LinuxIcon {...p} />;
    case "macos":
    case "ios":
      return <AppleIcon {...p} />;
    case "chromium":
      return <ChromiumIcon {...p} />;
    case "firefox":
      return <FirefoxIcon {...p} />;
    case "safari":
      return <SafariIcon {...p} />;
    case "android":
      return <PhoneIcon {...p} />;
    default:
      return <ChromiumIcon {...p} />;
  }
}
