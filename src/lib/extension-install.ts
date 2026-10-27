import type { Browser } from "./detect";

export type ExtensionFamily = "chromium" | "firefox";
export const CHROMIUM_INSTALL_BROWSERS = [
  { id: "chrome", label: "Chrome", address: "chrome://extensions/" },
  { id: "edge", label: "Edge", address: "edge://extensions/" },
  { id: "brave", label: "Brave", address: "brave://extensions/" },
  { id: "opera", label: "Opera", address: "opera://extensions/" },
  { id: "vivaldi", label: "Vivaldi", address: "vivaldi://extensions/" },
] as const;

export function initialInstallBrowser(browser?: Browser) {
  return CHROMIUM_INSTALL_BROWSERS.find((item) => item.id === browser)?.id ?? "chrome";
}

export function extensionInstructions(family: ExtensionFamily) {
  return family === "firefox"
    ? [
        {
          title: "Install and open the desktop app",
          body: "Keep ODM running. Launching the desktop app refreshes its local browser-host registration; the extension does not download files on its own.",
        },
        {
          title: "Download the Firefox extension ZIP",
          body: "Use the Firefox Download button on this page. Extract it to a folder so you can find manifest.json.",
        },
        {
          title: "Open Firefox's debugging page",
          body: "In Firefox, paste about:debugging#/runtime/this-firefox into a new tab. If you start at about:debugging, choose This Firefox.",
        },
        {
          title: "Load the temporary add-on",
          body: "Choose Load Temporary Add-on, then select manifest.json from the extracted Firefox extension folder. Firefox can also load the downloaded extension ZIP directly.",
        },
        {
          title: "Connect and test",
          body: "Open the extension from the toolbar, keep the desktop app running, and try a direct HTTP/HTTPS download. If the native host is unavailable, relaunch ODM and follow its browser setup guide.",
        },
        {
          title: "Reload after restarting Firefox",
          body: "This is a development install, not a signed permanent add-on. Firefox removes temporary add-ons when it restarts. Repeat the Load Temporary Add-on step after each restart.",
        },
      ]
    : [
        {
          title: "Install and open the desktop app",
          body: "Keep ODM running. Launching the desktop app refreshes its local browser-host registration; the extension sends downloads to that installed app.",
        },
        {
          title: "Download and extract the Chromium ZIP",
          body: "Extract the ZIP into a permanent folder. Keep all files together; the folder you select must contain manifest.json. Do not select the ZIP itself.",
        },
        {
          title: "Open your browser's extensions page",
          body: "Select your Chromium browser below, then paste its internal extensions address into a new tab in that same browser.",
        },
        {
          title: "Enable Developer mode",
          body: "Turn on Developer mode on the extensions page. The switch position varies by browser; Edge may place it in the sidebar.",
        },
        {
          title: "Choose Load unpacked",
          body: "Select the extracted folder containing manifest.json. Keep that folder in place: moving or deleting it breaks the unpacked installation.",
        },
        {
          title: "Pin, connect and test",
          body: "Pin the extension if you want quick access. Open it with ODM running, then try a direct HTTP/HTTPS download. If it cannot find the native host, relaunch ODM and check the browser setup guide.",
        },
      ];
}
