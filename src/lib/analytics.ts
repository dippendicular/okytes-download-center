import { DOWNLOADS, RELEASE } from "./downloads";

export const UMAMI_WEBSITE_ID = "47661e55-3d8f-46e2-8832-80560899952f";
export type EventData = Record<string, string | number | boolean>;
type PendingEvent = { name: string; data: EventData; at: number };

declare global {
  interface Window {
    umami?: { track: (name: string, data: EventData) => unknown };
  }
}

const pending: PendingEvent[] = [];
const MAX_PENDING = 50;
const MAX_AGE = 30_000;
let retry: ReturnType<typeof setTimeout> | undefined;

function send(name: string, data: EventData): boolean {
  if (!window.umami?.track) return false;
  try {
    // A failed analytics request must never break or delay the user's action.
    void Promise.resolve(window.umami.track(name, data)).catch(() => {});
  } catch {
    /* Blocked or unavailable analytics is non-fatal. */
  }
  return true;
}

function flush() {
  if (retry) clearTimeout(retry);
  retry = undefined;
  while (pending.length) {
    const next = pending[0]!;
    if (Date.now() - next.at > MAX_AGE) {
      pending.shift();
      continue;
    }
    if (!send(next.name, next.data)) break;
    pending.shift();
  }
  if (pending.length) retry = setTimeout(flush, 500);
}

export function trackEvent(name: string, data: EventData = {}) {
  if (typeof window === "undefined") return;
  const properties = { ...data, page_path: window.location.pathname };
  if (send(name, properties)) return;
  pending.push({ name, data: properties, at: Date.now() });
  if (pending.length > MAX_PENDING) pending.shift();
  if (!retry) retry = setTimeout(flush, 500);
}

function sourceOf(element: Element): string {
  const explicit = element
    .closest("[data-analytics-source]")
    ?.getAttribute("data-analytics-source");
  if (explicit) return explicit.slice(0, 100);
  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  const section = element.closest("section[id]")?.id;
  return section === "top" ? "hero" : section || window.location.pathname.slice(1) || "page";
}

function labelOf(element: Element): string {
  return (
    element.getAttribute("data-analytics-label") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.textContent ||
    element.tagName.toLowerCase()
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

/** One delegated listener covers dynamic controls, nested SVG icons, and legal/error pages. */
export function installAnalytics(): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.type === "auxclick" ? event.button !== 1 : event.button !== 0) return;
    const target =
      event.target instanceof Element ? event.target : (event.target as Node | null)?.parentElement;
    const control = target?.closest("a[href],button,[role=button],[role=tab],[role=switch]");
    if (
      !control ||
      control.matches(":disabled,[aria-disabled=true]") ||
      control.closest("[data-analytics-ignore]")
    )
      return;
    if (event.type === "auxclick" && control.tagName !== "A") return;

    const data: EventData = { source: sourceOf(control), label: labelOf(control) };
    const build = DOWNLOADS.find(
      (item) =>
        item.id === control.closest("[data-analytics-build]")?.getAttribute("data-analytics-build"),
    );
    if (build)
      Object.assign(data, {
        build_id: build.id,
        os: build.os,
        package: build.ext,
        version: RELEASE.version,
        coming_soon: Boolean(build.comingSoon),
      });
    for (const key of ["os", "browser", "distro", "action", "feature"]) {
      const attribute = "data-analytics-" + key;
      const value = control.closest("[" + attribute + "]")?.getAttribute(attribute);
      if (value) data[key] = value.slice(0, 100);
    }

    const explicit = control.getAttribute("data-analytics-event");
    if (explicit) {
      if (explicit === "theme_change")
        data["theme"] = document.documentElement.classList.contains("light") ? "dark" : "light";
      if (control.hasAttribute("aria-expanded"))
        data["action"] = control.getAttribute("aria-expanded") === "true" ? "close" : "open";
      trackEvent(explicit, data);
      return;
    }
    if (control instanceof HTMLAnchorElement) {
      let url: URL;
      try {
        url = new URL(control.href, window.location.href);
      } catch {
        return;
      }
      if (!["http:", "https:"].includes(url.protocol)) return;
      const asset = DOWNLOADS.find((item) => item.url && new URL(item.url).href === url.href);
      if (asset && !asset.comingSoon) {
        trackEvent("download_click", {
          ...data,
          build_id: asset.id,
          os: asset.os,
          package: asset.ext,
          arch: asset.arch,
          version: RELEASE.version,
        });
      } else if (url.hostname === "github.com" || url.hostname === "docs.github.com") {
        trackEvent("github_click", { ...data, destination: url.hostname + url.pathname });
      } else if (url.origin !== window.location.origin) {
        trackEvent("outbound_click", { ...data, destination: url.hostname + url.pathname });
      } else if (url.pathname === window.location.pathname && url.hash) {
        trackEvent("section_navigation", { ...data, section: url.hash.slice(1) });
      } else {
        trackEvent("navigation_click", {
          ...data,
          destination: url.pathname,
          section: url.hash.slice(1),
        });
      }
      return;
    }
    trackEvent("button_click", data);
  };

  const onChange = (event: Event) => {
    const control = event.target;
    if (!(control instanceof HTMLSelectElement) || control.closest("[data-analytics-ignore]"))
      return;
    const data: EventData = {
      source: sourceOf(control),
      label: control.getAttribute("data-analytics-label") || control.id || "Select",
    };
    const build =
      DOWNLOADS.find((item) => item.id === control.value) ??
      DOWNLOADS.find(
        (item) =>
          item.id ===
          control.closest("[data-analytics-build]")?.getAttribute("data-analytics-build"),
      );
    if (build)
      Object.assign(data, {
        build_id: build.id,
        os: build.os,
        package: build.ext,
        arch: build.arch,
      });
    if (
      control.getAttribute("data-analytics-event") === "extension_browser_select" &&
      ["chrome", "edge", "brave", "opera", "vivaldi"].includes(control.value)
    )
      data["browser"] = control.value;
    // Deliberately do not collect arbitrary form inputs, clipboard text, or free-form values.
    trackEvent(control.getAttribute("data-analytics-event") || "select_change", data);
  };

  const observed = new WeakSet<Element>();
  const seen = new WeakSet<Element>();
  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting || seen.has(entry.target)) continue;
              seen.add(entry.target);
              trackEvent("section_view", { section: entry.target.id, source: "page" });
              observer?.unobserve(entry.target);
            }
          },
          { rootMargin: "0px 0px -20% 0px", threshold: 0.01 },
        );
  const scan = () =>
    document.querySelectorAll("main section[id]").forEach((section) => {
      if (!observed.has(section)) {
        observed.add(section);
        observer?.observe(section);
      }
    });
  const mutations = new MutationObserver(scan);
  mutations.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", onClick, true);
  document.addEventListener("auxclick", onClick, true);
  document.addEventListener("change", onChange, true);
  scan();
  flush();
  return () => {
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("auxclick", onClick, true);
    document.removeEventListener("change", onChange, true);
    observer?.disconnect();
    mutations.disconnect();
    if (retry) clearTimeout(retry);
    retry = undefined;
    pending.length = 0;
  };
}
