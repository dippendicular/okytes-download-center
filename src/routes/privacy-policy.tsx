import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { REPO_URL } from "@/lib/downloads";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Okytes" },
      {
        name: "description",
        content:
          "How the Okytes website uses browser preferences, external services, and technical data.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function ClearPreferences() {
  return (
    <button
      type="button"
      data-analytics-event="preferences_reset"
      data-analytics-label="Clear site preferences"
      className="mt-4 rounded-full border border-border px-5 py-3 text-sm font-semibold text-primary hover:bg-accent"
      onClick={() => {
        try {
          localStorage.removeItem("okytes:theme");
          localStorage.removeItem("okytes:override");
        } catch {
          /* Storage may be disabled. */
        }
        try {
          sessionStorage.removeItem("okytes:intro");
          sessionStorage.removeItem("okytes:gh");
        } catch {
          /* Storage may be disabled. */
        }
        window.location.reload();
      }}
    >
      Clear site preferences
    </button>
  );
}

function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="A clear explanation of what happens when you browse this website."
    >
      <section>
        <h2>1. Scope</h2>
        <p>
          This policy covers the Okytes download website maintained by the Okytes contributors.
          Installed applications and browser extensions have their own permissions and behavior;
          review the source and documentation for the release you install. No account or payment
          information is required to browse this site.
        </p>
      </section>
      <section>
        <h2>2. Preferences stored on your device</h2>
        <p>
          The site uses browser storage for practical settings, rather than advertising profiles:
        </p>
        <ul>
          <li>
            <strong>Theme:</strong> your light or dark choice is saved in local storage. Without a
            saved choice, the site follows your device setting.
          </li>
          <li>
            <strong>Platform choice:</strong> operating-system and browser overrides are saved
            locally so download recommendations match your selection.
          </li>
          <li>
            <strong>Session preferences:</strong> session storage remembers whether the introduction
            has played and temporarily caches public GitHub star and fork counts. The GitHub cache
            is refreshed after ten minutes when the section is loaded again.
          </li>
        </ul>
        <p>
          Device and browser detection runs in your browser using browser-provided information. This
          implementation does not send the detected result to an Okytes account service. This site
          does not set advertising cookies or include an advertising analytics service.
        </p>
      </section>
      <section>
        <h2>3. External requests</h2>
        <p>
          Downloads are hosted on GitHub. The contribution section also requests public repository
          counts from the GitHub API. Those requests, and visits to GitHub links, are subject to{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noreferrer"
          >
            GitHub’s Privacy Statement
          </a>
          .
        </p>
        <p>
          Fonts are loaded from Google Fonts and Fontshare. Your browser contacts those providers to
          retrieve font styles and files. External services receive technical connection
          information, such as your IP address and browser headers, under their own policies. The
          website host also receives the information needed to serve a page, and may maintain
          operational or security logs.
        </p>
      </section>
      <section>
        <h2>4. Website analytics</h2>
        <p>
          We use Umami Cloud to understand visits to all website pages and interactions with links
          and controls. This includes download-link clicks, GitHub and navigation clicks, sections
          viewed, theme and platform selections, package choices, and clicks on copy or details
          buttons. Events can include the page path, interface location, control label, and selected
          public release details such as operating system, package format, and version.
        </p>
        <p>
          Umami also processes standard visit information such as referrers, browser and device
          information, and approximate location. Our tracker excludes query strings and fragments
          from tracked page URLs. We do not send account identifiers, typed form content, clipboard
          content, or downloaded file contents as custom event data. We have not enabled session
          recordings.
        </p>
        <p>
          Website analytics are separate from the desktop application's behavior. A download click
          does not confirm that a file finished downloading, and a GitHub click does not confirm
          that someone starred the repository. Processing and retention by the analytics provider
          are described in{" "}
          <a href="https://umami.is/privacy" target="_blank" rel="noreferrer">
            Umami's Privacy Policy
          </a>
          .
        </p>
      </section>
      <section>
        <h2>5. Downloads, diagnostics, and information you share</h2>
        <p>
          This website does not upload your downloaded files or maintain an account-based download
          history. Download feedback shown on the page is triggered locally; the click is also
          recorded as a website analytics event. Runtime errors may be recorded in server logs or
          forwarded to an error-reporting integration when one is provided by the hosting or preview
          environment.
        </p>
        <p>
          If you submit an issue or comment on GitHub, its contents and your GitHub profile may be
          public. Avoid posting passwords, private download links, access tokens, or other sensitive
          information.
        </p>
      </section>
      <section>
        <h2>6. Your choices and retention</h2>
        <p>
          You can clear the site’s preferences below, or remove them through your browser settings.
          Local settings remain until cleared; session data lasts for the browser session. Clearing
          these preferences does not delete analytics records, third-party records, or hosting logs.
          Analytics retention depends on the Umami Cloud plan and settings. Requests about
          information held by another provider should be directed to that provider.
        </p>
        <ClearPreferences />
      </section>
      <section>
        <h2>7. Questions and changes</h2>
        <p>
          For website privacy questions, contact the maintainers through the{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            Okytes repository
          </a>
          . Use the repository’s security contact instructions, if provided, for sensitive reports.
          Updates to this policy will appear here with a revised date.
        </p>
      </section>
    </LegalPage>
  );
}
