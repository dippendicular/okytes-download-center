import { NAV_LINKS } from "@/lib/site";
import { RELEASE, RELEASES_URL, REPO_URL } from "@/lib/downloads";
import { GitHubIcon } from "./Icons";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="relative px-5 pb-10 pt-20">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <a
            href="/#top"
            className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight"
          >
            <Brand className="h-14" />
          </a>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Free, open-source download manager. Fully local. No accounts.
          </p>
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            Windows · Linux · macOS (soon)
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Site</p>
          <ul className="grid gap-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`/#${l.id}`} className="text-muted-foreground hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Project</p>
          <ul className="grid gap-2 text-sm">
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <GitHubIcon className="h-4 w-4" /> GitHub
              </a>
            </li>
            <li>
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Releases
              </a>
            </li>
            <li className="text-muted-foreground">License: {RELEASE.license}</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border pt-6 font-mono text-xs text-muted-foreground">
        <span>© Okytes contributors</span>
        <nav aria-label="Legal" className="flex flex-wrap gap-5">
          <a href="/privacy-policy" className="hover:text-foreground">
            Privacy Policy
          </a>
          <a href="/terms-and-conditions" className="hover:text-foreground">
            Terms & Conditions
          </a>
        </nav>
      </div>
    </footer>
  );
}
