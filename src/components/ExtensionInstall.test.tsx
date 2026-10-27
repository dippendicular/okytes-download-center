import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExtensionInstall } from "./ExtensionInstall";
import { EnvProvider } from "@/hooks/use-env";
import { getBuild } from "@/lib/downloads";
import { installAnalytics } from "@/lib/analytics";

describe("extension installation dialogs", () => {
  let removeAnalytics: () => void;
  const track = vi.fn();
  beforeEach(() => {
    window.umami = { track };
    track.mockClear();
    removeAnalytics = installAnalytics();
  });
  afterEach(() => {
    cleanup();
    removeAnalytics();
    delete window.umami;
    vi.restoreAllMocks();
  });

  it("opens the Chromium guide and tracks modal controls with the correct build", async () => {
    render(
      <EnvProvider>
        <ExtensionInstall build={getBuild("ext-chromium")!} />
      </EnvProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Install Chromium extension" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Install the Chromium extension")).toBeInTheDocument();
    expect(dialog.querySelector("video")?.getAttribute("src")).toBe(
      "/videos/install-chromium.webm",
    );
    fireEvent.change(within(dialog).getByRole("combobox"), { target: { value: "edge" } });
    expect(within(dialog).getByLabelText(/Paste this address/)).toHaveValue("edge://extensions/");
    expect(track).toHaveBeenCalledWith(
      "extension_browser_select",
      expect.objectContaining({
        browser: "edge",
        source: "extension_install",
        build_id: "ext-chromium",
      }),
    );
    expect(within(dialog).getByText(/Browsers prevent websites/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(track).toHaveBeenCalledWith(
      "extension_install_close",
      expect.objectContaining({ build_id: "ext-chromium" }),
    );
  });
  it("provides Firefox's temporary installation flow and restart warning", async () => {
    await act(async () => {
      render(
        <EnvProvider>
          <ExtensionInstall build={getBuild("ext-firefox")!} />
        </EnvProvider>,
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "Install Firefox extension" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("combobox")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Paste this address/)).toHaveValue(
      "about:debugging#/runtime/this-firefox",
    );
    expect(within(dialog).getByText(/^Firefox removes temporary add-ons/)).toBeInTheDocument();
    expect(dialog.querySelector("video")?.getAttribute("src")).toBe("/videos/install-firefox.webm");
    expect(track).toHaveBeenCalledWith(
      "extension_install_open",
      expect.objectContaining({ browser: "firefox" }),
    );
  });
});
