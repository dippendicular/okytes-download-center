import { describe, expect, it } from "vitest";
import { detect } from "./detect";
import { DOWNLOADS, orderBuilds, recommendDesktop, recommendExtension } from "./downloads";

const UA = {
  winChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  winEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
  ubuntuFirefox: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
  fedoraFirefox: "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
  linuxChrome:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  opera:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0",
};

describe("detect", () => {
  it("Windows + Chrome → windows/x64/chrome, recommends the .exe and Chromium extension", () => {
    const r = detect({ userAgent: UA.winChrome });
    expect(r).toMatchObject({ os: "windows", arch: "x64", browser: "chrome", distroFamily: null, isMobile: false });
    expect(recommendDesktop(r)).toBe("win-exe");
    expect(recommendExtension(r.browser)).toBe("ext-chromium");
  });

  it("labels Windows 11 from client-hint platformVersion >= 13", () => {
    expect(detect({ userAgent: UA.winChrome, uaDataPlatform: "Windows", platformVersion: "15.0.0" }).osLabel).toBe(
      "Windows 11",
    );
    expect(detect({ userAgent: UA.winChrome, uaDataPlatform: "Windows", platformVersion: "10.0.0" }).osLabel).toBe(
      "Windows 10",
    );
  });

  it("detects Edge, Opera and Brave as Chromium-family", () => {
    expect(detect({ userAgent: UA.winEdge }).browser).toBe("edge");
    expect(detect({ userAgent: UA.opera }).browser).toBe("opera");
    const brave = detect({ userAgent: UA.winChrome, isBrave: true });
    expect(brave.browser).toBe("brave");
    expect(recommendExtension(brave.browser)).toBe("ext-chromium");
  });

  it("Ubuntu → deb, Fedora → rpm, unknown distro → AppImage", () => {
    const ubuntu = detect({ userAgent: UA.ubuntuFirefox });
    expect(ubuntu).toMatchObject({ os: "linux", distroFamily: "deb", browser: "firefox" });
    expect(recommendDesktop(ubuntu)).toBe("linux-deb");
    expect(recommendExtension(ubuntu.browser)).toBe("ext-firefox");

    const fedora = detect({ userAgent: UA.fedoraFirefox });
    expect(fedora.distroFamily).toBe("rpm");
    expect(recommendDesktop(fedora)).toBe("linux-rpm");

    const generic = detect({ userAgent: UA.linuxChrome });
    expect(generic.distroFamily).toBe("unknown");
    expect(recommendDesktop(generic)).toBe("linux-appimage");
  });

  it("macOS recommends the coming-soon Mac row, which has no download link", () => {
    const r = detect({ userAgent: UA.macSafari });
    expect(r.os).toBe("macos");
    expect(r.browser).toBe("safari");
    const id = recommendDesktop(r);
    expect(id).toBe("macos");
    const mac = DOWNLOADS.find((d) => d.id === id)!;
    expect(mac.comingSoon).toBe(true);
    expect(mac.url).toBeUndefined();
  });

  it("phones are mobile with no desktop build", () => {
    const ios = detect({ userAgent: UA.iphone });
    expect(ios).toMatchObject({ os: "ios", isMobile: true });
    expect(recommendDesktop(ios)).toBeNull();
    const android = detect({ userAgent: UA.android });
    expect(android).toMatchObject({ os: "android", isMobile: true });
  });

  it("iPadOS desktop-mode UA with touch points is treated as iOS", () => {
    expect(detect({ userAgent: UA.macSafari, maxTouchPoints: 5 }).os).toBe("ios");
  });

  it("client-hint arm architecture wins over the UA", () => {
    expect(detect({ userAgent: UA.winChrome, architecture: "arm", bitness: "64" }).arch).toBe("arm64");
  });
});

describe("orderBuilds", () => {
  it("puts recommended builds first", () => {
    const ordered = orderBuilds(DOWNLOADS, ["linux-rpm", "ext-firefox"]);
    expect(ordered[0].id).toBe("linux-rpm");
    expect(ordered[1].id).toBe("ext-firefox");
    expect(ordered).toHaveLength(DOWNLOADS.length);
  });
});
