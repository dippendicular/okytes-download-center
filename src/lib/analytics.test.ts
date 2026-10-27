import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installAnalytics, trackEvent } from "./analytics";
import { DOWNLOADS, REPO_URL } from "./downloads";

describe("website analytics", () => {
  let cleanup: () => void;
  const track = vi.fn();
  const preventNavigation = (event: Event) => event.preventDefault();
  const click = (element: Element, type = "click", button = 0) =>
    element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button }));
  const fixture = (html: string) => {
    document.body.innerHTML = html;
    return document.body.firstElementChild!;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    track.mockReset();
    window.umami = { track };
    window.history.replaceState(null, "", "/");
    document.documentElement.className = "dark";
    document.body.innerHTML = "";
    cleanup = installAnalytics();
    document.addEventListener("click", preventNavigation);
    document.addEventListener("auxclick", preventNavigation);
  });
  afterEach(() => {
    cleanup();
    document.removeEventListener("click", preventNavigation);
    document.removeEventListener("auxclick", preventNavigation);
    document.body.innerHTML = "";
    delete window.umami;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("counts a nested download icon once, with asset and source details", () => {
    const build = DOWNLOADS.find((item) => item.id === "win-exe")!;
    fixture(
      '<section id="downloads"><a href="' +
        build.url +
        '" download><svg><path /></svg></a></section>',
    );
    click(document.querySelector("path")!);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(
      "download_click",
      expect.objectContaining({
        page_path: "/",
        source: "downloads",
        os: "windows",
        package: ".exe",
        arch: "x64",
        build_id: "win-exe",
      }),
    );
  });

  it("identifies hero downloads without also classifying them as GitHub clicks", () => {
    const build = DOWNLOADS.find((item) => item.id === "linux-deb")!;
    const section = fixture('<section id="top"><a href="' + build.url + '">Download</a></section>');
    click(section.querySelector("a")!);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(
      "download_click",
      expect.objectContaining({ source: "hero", package: ".deb" }),
    );
  });

  it("tracks coming-soon repository links as GitHub clicks, never as downloads", () => {
    const card = fixture(
      '<section id="downloads"><li data-analytics-build="macos"><a href="' +
        REPO_URL +
        '">Watch repo</a></li></section>',
    );
    click(card.querySelector("a")!);
    expect(track).toHaveBeenCalledWith(
      "github_click",
      expect.objectContaining({ os: "macos", coming_soon: true }),
    );
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("distinguishes header and footer GitHub sources", () => {
    fixture(
      '<div><header><a href="' +
        REPO_URL +
        '">Star</a></header><footer><a href="' +
        REPO_URL +
        '">GitHub</a></footer></div>',
    );
    document.querySelectorAll("a").forEach((anchor) => click(anchor));
    expect(track).toHaveBeenNthCalledWith(
      1,
      "github_click",
      expect.objectContaining({ source: "header" }),
    );
    expect(track).toHaveBeenNthCalledWith(
      2,
      "github_click",
      expect.objectContaining({ source: "footer" }),
    );
  });

  it("records section navigation without a manual pageview or suppressing the action", () => {
    const anchor = fixture('<a href="/#downloads">Downloads</a>');
    const handler = vi.fn((event: Event) => expect(event.defaultPrevented).toBe(false));
    anchor.addEventListener("click", handler);
    click(anchor);
    expect(handler).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(
      "section_navigation",
      expect.objectContaining({ section: "downloads" }),
    );
  });

  it("covers navigation on legal pages and strips query strings from custom properties", () => {
    window.history.replaceState(null, "", "/privacy-policy?token=do-not-send#private");
    const anchor = fixture(
      '<main><a href="/terms-and-conditions?secret=do-not-send#terms">Terms</a></main>',
    );
    click(anchor.querySelector("a")!);
    expect(track).toHaveBeenCalledWith(
      "navigation_click",
      expect.objectContaining({
        page_path: "/privacy-policy",
        source: "privacy-policy",
        destination: "/terms-and-conditions",
      }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain("do-not-send");
  });

  it("tracks other outbound links without recording destination query parameters", () => {
    click(fixture('<a href="https://example.com/docs?token=private">Documentation</a>'));
    expect(track).toHaveBeenCalledWith(
      "outbound_click",
      expect.objectContaining({ destination: "example.com/docs" }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain("private");
  });

  it("ignores disabled and explicitly excluded controls", () => {
    fixture(
      '<div><button disabled>Disabled</button><button aria-disabled="true">Unavailable</button><div data-analytics-ignore><button>Internal</button></div></div>',
    );
    document.querySelectorAll("button").forEach((button) => click(button));
    expect(track).not.toHaveBeenCalled();
  });

  it("covers dynamically added generic buttons and keyboard-style clicks", () => {
    click(fixture("<button>New control</button>"));
    expect(track).toHaveBeenCalledWith(
      "button_click",
      expect.objectContaining({ label: "New control" }),
    );
    click(fixture('<span role="button" aria-label="Custom control" tabindex="0"></span>'));
    expect(track).toHaveBeenCalledWith(
      "button_click",
      expect.objectContaining({ label: "Custom control" }),
    );
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("captures the intended theme before the React handler changes it", () => {
    const button = fixture('<button data-analytics-event="theme_change">Theme</button>');
    button.addEventListener("click", () => (document.documentElement.className = "light"));
    click(button);
    expect(track).toHaveBeenCalledWith("theme_change", expect.objectContaining({ theme: "light" }));
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("captures platform selections and toggle actions with stable labels", () => {
    click(
      fixture(
        '<button data-analytics-event="platform_select" data-analytics-os="linux" data-analytics-distro="deb">Ubuntu</button>',
      ),
    );
    expect(track).toHaveBeenCalledWith(
      "platform_select",
      expect.objectContaining({ os: "linux", distro: "deb" }),
    );
    click(
      fixture(
        '<button data-analytics-event="download_details_toggle" aria-expanded="true">Details</button>',
      ),
    );
    expect(track).toHaveBeenCalledWith(
      "download_details_toggle",
      expect.objectContaining({ action: "close" }),
    );
  });

  it("tracks package selection, but never captures typed inputs or unknown values", () => {
    const select = fixture(
      '<select id="format-linux" data-analytics-event="package_select"><option value="linux-rpm">RPM</option></select>',
    );
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(track).toHaveBeenCalledWith(
      "package_select",
      expect.objectContaining({ os: "linux", package: ".rpm", build_id: "linux-rpm" }),
    );
    const input = fixture('<input type="text" value="private text">');
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(track).toHaveBeenCalledTimes(1);
    const other = fixture('<select><option value="private value">Option</option></select>');
    other.dispatchEvent(new Event("change", { bubbles: true }));
    expect(track).toHaveBeenLastCalledWith(
      "select_change",
      expect.not.objectContaining({ value: "private value" }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain("private");
  });

  it("records copy intent and build context without copying the command into analytics", () => {
    const node = fixture(
      '<li data-analytics-build="win-msi"><button data-analytics-event="command_copy" data-analytics-label="Copy verification command" aria-label="Copy command: secret-command">Copy</button></li>',
    );
    click(node.querySelector("button")!);
    expect(track).toHaveBeenCalledWith(
      "command_copy",
      expect.objectContaining({ build_id: "win-msi", label: "Copy verification command" }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain("secret-command");
  });

  it("preserves extension context for portaled modal buttons, icons and browser selection", () => {
    fixture(
      '<div data-analytics-source="extension_install" data-analytics-build="ext-chromium" data-analytics-browser="edge"><button data-analytics-event="extension_dev_mode_open"><svg><path /></svg>Open dev mode</button><button>Done</button><select data-analytics-event="extension_browser_select"><option value="brave">Brave</option></select></div>',
    );
    click(document.querySelector("path")!);
    expect(track).toHaveBeenCalledWith(
      "extension_dev_mode_open",
      expect.objectContaining({
        source: "extension_install",
        browser: "edge",
        build_id: "ext-chromium",
      }),
    );
    click(document.querySelectorAll("button")[1]!);
    expect(track).toHaveBeenCalledWith(
      "button_click",
      expect.objectContaining({
        source: "extension_install",
        build_id: "ext-chromium",
        label: "Done",
      }),
    );
    document.querySelector("select")!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(track).toHaveBeenCalledWith(
      "extension_browser_select",
      expect.objectContaining({
        source: "extension_install",
        browser: "brave",
        build_id: "ext-chromium",
      }),
    );
    expect(track).toHaveBeenCalledTimes(3);
  });

  it("tracks middle-clicked links, but not right clicks", () => {
    const link = fixture('<a href="' + REPO_URL + '">GitHub</a>');
    click(link, "auxclick", 1);
    click(link, "auxclick", 2);
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("buffers early interactions once while the SDK loads", () => {
    delete window.umami;
    click(fixture("<button>Early click</button>"));
    expect(track).not.toHaveBeenCalled();
    window.umami = { track };
    vi.advanceTimersByTime(500);
    expect(track).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("bounds the SDK-loading queue and discards stale events", () => {
    delete window.umami;
    for (let n = 0; n < 55; n++) trackEvent("early", { index: n });
    window.umami = { track };
    vi.advanceTimersByTime(500);
    expect(track).toHaveBeenCalledTimes(50);
    track.mockClear();
    delete window.umami;
    trackEvent("stale");
    vi.advanceTimersByTime(31_000);
    window.umami = { track };
    vi.advanceTimersByTime(1000);
    expect(track).not.toHaveBeenCalled();
  });

  it("never lets SDK failures break the underlying button handler", async () => {
    track.mockImplementationOnce(() => {
      throw Error("blocked");
    });
    const button = fixture("<button>Still works</button>");
    const handler = vi.fn();
    button.addEventListener("click", handler);
    expect(() => click(button)).not.toThrow();
    expect(handler).toHaveBeenCalledOnce();
    track.mockRejectedValueOnce(Error("offline"));
    click(button);
    await Promise.resolve();
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("disconnects listeners without leaving duplicate handlers after remount", () => {
    cleanup();
    cleanup = installAnalytics();
    click(fixture("<button>Once</button>"));
    expect(track).toHaveBeenCalledTimes(1);
    cleanup();
    click(document.querySelector("button")!);
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("records each visible section once and disconnects its observer", () => {
    cleanup();
    let callback: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(fn: IntersectionObserverCallback) {
          callback = fn;
        }
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = disconnect;
      },
    );
    const section = fixture('<main><section id="downloads"></section></main>').querySelector(
      "section",
    )!;
    cleanup = installAnalytics();
    const entries: IntersectionObserverEntry[] = [
      {
        isIntersecting: true,
        target: section,
        boundingClientRect: section.getBoundingClientRect(),
        intersectionRect: section.getBoundingClientRect(),
        intersectionRatio: 1,
        rootBounds: null,
        time: 0,
      },
    ];
    callback!(entries, {} as IntersectionObserver);
    callback!(entries, {} as IntersectionObserver);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(
      "section_view",
      expect.objectContaining({ section: "downloads" }),
    );
    cleanup();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
