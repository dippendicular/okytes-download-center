import { describe, expect, it } from "vitest";
import {
  CHROMIUM_INSTALL_BROWSERS,
  extensionInstructions,
  initialInstallBrowser,
} from "./extension-install";

describe("development extension installation", () => {
  it("provides only known browser settings addresses", () => {
    expect(CHROMIUM_INSTALL_BROWSERS.map((item) => item.id)).toEqual([
      "chrome",
      "edge",
      "brave",
      "opera",
      "vivaldi",
    ]);
    for (const item of CHROMIUM_INSTALL_BROWSERS)
      expect(item.address).toMatch(/^(chrome|edge|brave|opera|vivaldi):\/\/extensions\/$/);
    expect(initialInstallBrowser("edge")).toBe("edge");
    expect(initialInstallBrowser("firefox")).toBe("chrome");
    expect(initialInstallBrowser()).toBe("chrome");
  });
  it("explains Chromium extraction, persistent folder, developer mode and native host", () => {
    const steps = extensionInstructions("chromium");
    expect(steps).toHaveLength(6);
    const text = JSON.stringify(steps);
    for (const term of [
      "manifest.json",
      "Developer mode",
      "Load unpacked",
      "native host",
      "desktop",
      "moving or deleting",
    ])
      expect(text).toContain(term);
    expect(text).toContain("Do not select the ZIP");
  });
  it("explains temporary Firefox loading without disabling signature checks", () => {
    const text = JSON.stringify(extensionInstructions("firefox"));
    for (const term of [
      "about:debugging#/runtime/this-firefox",
      "Load Temporary Add-on",
      "manifest.json",
      "after each restart",
      "native host",
    ])
      expect(text).toContain(term);
    expect(text).not.toMatch(/disable.*signature|xpinstall/i);
  });
});
