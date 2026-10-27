import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { EnvProvider } from "@/hooks/use-env";
import { useLenis } from "@/hooks/use-lenis";
import { REPO_URL, RELEASE } from "@/lib/downloads";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { SmartDownload } from "@/components/SmartDownload";
import { Bento } from "@/components/Bento";
import { Compare } from "@/components/Compare";
import { Architecture } from "@/components/Architecture";
import { Contribute } from "@/components/Contribute";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { Intro } from "@/components/Intro";
import { ScrollProgress } from "@/components/ScrollProgress";
import { DownloadFeedback } from "@/components/DownloadFeedback";

const TITLE = "Okytes — Downloads that actually finish";
const DESCRIPTION =
  "Free, open-source download manager for Windows and Linux. HTTP/HTTPS downloads, a persistent queue, and browser integration.";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Okytes",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Windows, Linux",
  softwareVersion: RELEASE.version,
  description: DESCRIPTION,
  license: "https://opensource.org/licenses/MIT",
  url: REPO_URL,
  codeRepository: REPO_URL,
  downloadUrl: "https://github.com/dippendicular/okytes/releases",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

// Skip the intro on repeat visits / reduced motion before first paint.
const INTRO_GATE =
  "try{if(sessionStorage.getItem('okytes:intro')||matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches)document.documentElement.dataset.intro='skip'}catch(e){}";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    scripts: [
      { children: INTRO_GATE },
      { type: "application/ld+json", children: JSON.stringify(JSON_LD) },
    ],
  }),
  component: Index,
});

function Index() {
  useLenis();
  return (
    <EnvProvider>
      <MotionConfig reducedMotion="user">
        <div className="noise-overlay">
          <a
            href="#main"
            className="sr-only z-[100] rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Intro />
          <ScrollProgress />
          <Cursor />
          <Nav />
          <main id="main">
            <Hero />
            <SmartDownload />
            <Bento />
            <Architecture />
            <Compare />
            <Contribute />
          </main>
          <Footer />
          <DownloadFeedback />
        </div>
      </MotionConfig>
    </EnvProvider>
  );
}
