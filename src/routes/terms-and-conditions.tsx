import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { RELEASES_URL, REPO_URL } from "@/lib/downloads";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Okytes" },
      {
        name: "description",
        content:
          "Terms for using the Okytes website, accessing downloads, and following external links.",
      },
    ],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The terms for using this website and accessing Okytes releases."
    >
      <section>
        <h2>1. Using this website</h2>
        <p>
          This site provides information about Okytes and links to its releases and source code. By
          using it, you agree to these website terms. If you do not agree, discontinue use of the
          site. These terms do not replace or restrict rights granted by the software’s applicable
          open-source licenses.
        </p>
      </section>
      <section>
        <h2>2. Software licenses</h2>
        <p>
          Okytes software is distributed under the licenses included with the relevant source code
          or release. Review those license files, copyright notices, and any third-party dependency
          terms before using, modifying, or redistributing the software. The repository identifies
          MIT / Apache-2.0 licensing; the files accompanying your version control the permissions
          and conditions that apply.
        </p>
        <p>
          See the{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            source repository
          </a>{" "}
          and{" "}
          <a href={RELEASES_URL} target="_blank" rel="noreferrer">
            release notes
          </a>{" "}
          for version-specific details.
        </p>
      </section>
      <section>
        <h2>3. Responsible downloads</h2>
        <p>
          Only access and download material you are authorized to obtain. Respect applicable law,
          copyright, access restrictions, and the terms of the servers and services you use. You are
          responsible for the links you open, the files you download, and how you use them. Do not
          use this site to distribute malicious code, disrupt services, or attempt unauthorized
          access.
        </p>
      </section>
      <section>
        <h2>4. Availability and external services</h2>
        <p>
          Release files and repository services are hosted by GitHub. External websites and font
          providers operate under their own terms and privacy policies. Links do not imply
          endorsement or control over those services. Website content, download availability, and
          supported platforms may change. A “Coming soon” label is not a commitment to a release
          date.
        </p>
      </section>
      <section>
        <h2>5. No performance or availability guarantee</h2>
        <p>
          The website and its information are provided as available. We do not guarantee
          uninterrupted access, error-free content, a particular transfer speed, or compatibility
          with every server and device. Keep backups of important files and verify downloaded files
          where appropriate. Software warranty provisions are set out in its applicable license.
        </p>
      </section>
      <section>
        <h2>6. Liability and your rights</h2>
        <p>
          To the extent permitted by applicable law, the website’s contributors are not responsible
          for losses resulting from unavailable downloads, inaccurate website information,
          third-party services, or your use of the site. Nothing in these terms excludes liability
          or consumer rights that cannot lawfully be excluded. The applicable software license
          governs liability for the software itself.
        </p>
      </section>
      <section>
        <h2>7. Privacy, questions, and updates</h2>
        <p>
          Read our <a href="/privacy-policy">Privacy Policy</a> for details about browser storage
          and external requests. Website questions can be raised through the{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            Okytes repository
          </a>
          . Changes to these website terms will be posted on this page with an updated date.
        </p>
      </section>
    </LegalPage>
  );
}
