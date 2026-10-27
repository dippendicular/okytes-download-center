# Website analytics

Umami Cloud is installed once in the shared document head for every route, including
Privacy, Terms, 404, and React error pages. Website ID:
`47661e55-3d8f-46e2-8832-80560899952f`.

Pageviews use Umami's automatic tracking, including history-based navigation.
There is no second manual pageview call. Query strings and hash fragments are
excluded from tracked page URLs. Section visits are custom events, not pageviews.

## Custom events

| Event                            | Meaning                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| `download_click`                 | Click on a published release asset, from the hero or download cards |
| `github_click`                   | GitHub repository, release, source, issue, or documentation link    |
| `navigation_click`               | Internal page or cross-page section link                            |
| `section_navigation`             | Same-page section link                                              |
| `outbound_click`                 | Other external HTTP/HTTPS link                                      |
| `section_view`                   | A named section enters the viewport, once per mounted section       |
| `theme_change`                   | Theme button click, with the requested theme                        |
| `menu_toggle`                    | Mobile menu open/close                                              |
| `platform_menu_toggle`           | Detected-platform chooser open/close                                |
| `platform_select`                | Operating-system/distro choice                                      |
| `browser_select`                 | Browser choice                                                      |
| `platform_reset`                 | Return to automatic platform detection                              |
| `package_select`                 | Change package format                                               |
| `download_details_toggle`        | Download details open/close                                         |
| `checksum_copy`                  | Click to copy a public release checksum                             |
| `command_copy`                   | Click to copy an installation or verification command               |
| `share_link_copy`                | Click to copy the website link on mobile                            |
| `preferences_reset`              | Clear site preferences                                              |
| `page_retry`                     | Error-page retry button                                             |
| `button_click` / `select_change` | Fallback coverage for controls without a named event                |

Events include `page_path`, `source` (hero, downloads, header, footer, legal page,
etc.), and a control label. Download events also include `build_id`, `os`,
`package`, `arch`, and `version`; controls inside package cards include the
corresponding build details. Selected platform/browser and toggle actions are
attached where applicable.

In Umami Cloud, open the website's Events view and filter by these names. Event
properties break down the counts by platform, package, source, and page. No
additional application database, private key, or analytics backend is required.

## Extending coverage

### Extension installation

The Chromium/Firefox Install dialogs use the same delegated tracking, including
portaled controls. Their source is `extension_install`, with the corresponding
`build_id` and browser. Events: `extension_install_open`, `extension_install_close`
(also Escape/outside dismissal), `extension_browser_select`,
`extension_dev_mode_open`, `extension_dev_mode_result`, `extension_video_toggle`,
`extension_video_restart`, and `extension_video_complete`. Close/Done buttons also
have generic button-click coverage. Download ZIP remains `download_click`.

`extension_dev_mode_open` counts the button click, **not** a confirmed browser
settings navigation. Web pages cannot open internal browser settings; the button
copies the approved address and explains the manual next step. The result event
records only `address_copied` or `manual_copy_required`, not clipboard contents.
Video playback is manual; completion is tracked separately from button clicks.
`data-analytics-source` preserves context for buttons rendered in portals.

The shared analytics listener handles links, buttons, role-based buttons/tabs/
switches, and select changes. It also handles nested icons, keyboard clicks,
and middle-clicked links. Add `data-analytics-event` and optionally
`data-analytics-label` to name a new control's event. Use
`data-analytics-ignore` on an element or ancestor to exclude an internal control.

Do not add `data-umami-event` or per-button `umami.track` calls to these same
controls: the delegated handler already records them, and native Umami annotated
click tracking can alter other click handlers.

## Limits and testing

These are interaction counts, not successful downloads, clipboard success,
installations, or confirmed GitHub stars. Coming-soon packages never emit a
download event. Ad blockers, unavailable scripts, or page unloads may prevent an
event reaching the service; analytics never blocks normal UI behavior.

If the SDK is still loading, up to 50 custom events are buffered in memory for
at most 30 seconds. There is no event persistence or session replay. Form input
and clipboard contents are not custom analytics properties.

Unit tests mock the SDK. Browser checks can load the real Umami script while
intercepting and locally fulfilling its collection requests, so test clicks do
not pollute the live website dashboard. The integration was verified this way,
including native page loads, 404, client navigation, hash navigation, and reloads.
Actual ingestion into the private dashboard requires a deployed visit and access
to the owner's Umami Cloud account.

Reference: https://docs.umami.is/docs/track-events
