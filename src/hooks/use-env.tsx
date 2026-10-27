import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BROWSER_LABEL,
  detectFromNavigator,
  type Browser,
  type DetectResult,
  type DistroFamily,
  type OS,
} from "@/lib/detect";
import { recommendDesktop, recommendExtension } from "@/lib/downloads";

export interface EnvOverride {
  os?: OS;
  distroFamily?: DistroFamily;
  browser?: Browser;
}

interface EnvState {
  /** null until detection finishes on the client */
  env: DetectResult | null;
  detected: DetectResult | null;
  override: EnvOverride;
  setOverride: (o: EnvOverride) => void;
  clearOverride: () => void;
  desktopId: string | null;
  extensionId: string | null;
  label: string;
}

const STORAGE_KEY = "okytes:override";
const EnvContext = createContext<EnvState | null>(null);

const OS_LABEL: Record<OS, string> = {
  windows: "Windows",
  linux: "Linux",
  macos: "macOS",
  android: "Android",
  ios: "iOS",
  unknown: "your device",
};

export function EnvProvider({ children }: { children: ReactNode }) {
  const [detected, setDetected] = useState<DetectResult | null>(null);
  const [override, setOverrideState] = useState<EnvOverride>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOverrideState(JSON.parse(raw) as EnvOverride);
    } catch {
      /* ignore */
    }
    let alive = true;
    detectFromNavigator().then((r) => alive && setDetected(r));
    return () => {
      alive = false;
    };
  }, []);

  const setOverride = useCallback((o: EnvOverride) => {
    setOverrideState((prev) => {
      const next = { ...prev, ...o };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearOverride = useCallback(() => {
    setOverrideState({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<EnvState>(() => {
    let env: DetectResult | null = detected;
    if (detected && (override.os || override.browser || override.distroFamily !== undefined)) {
      const os = override.os ?? detected.os;
      const osChanged = override.os && override.os !== detected.os;
      env = {
        ...detected,
        os,
        browser: override.browser ?? detected.browser,
        distroFamily:
          os === "linux"
            ? (override.distroFamily ?? (osChanged ? "unknown" : detected.distroFamily))
            : null,
        isMobile: override.os ? os === "android" || os === "ios" : detected.isMobile,
        osLabel: osChanged ? OS_LABEL[os] : detected.osLabel,
      };
    }
    const desktopId = env ? recommendDesktop(env) : null;
    const extensionId = env ? recommendExtension(env.browser) : null;
    const label = env ? `${env.osLabel} · ${BROWSER_LABEL[env.browser]}` : "Detecting…";
    return { env, detected, override, setOverride, clearOverride, desktopId, extensionId, label };
  }, [detected, override, setOverride, clearOverride]);

  return <EnvContext.Provider value={value}>{children}</EnvContext.Provider>;
}

export function useEnv() {
  const ctx = useContext(EnvContext);
  if (!ctx) throw new Error("useEnv must be used inside <EnvProvider>");
  return ctx;
}
