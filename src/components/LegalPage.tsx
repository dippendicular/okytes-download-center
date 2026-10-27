import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="main" className="mx-auto max-w-4xl px-5 pb-12 pt-32 sm:pt-40">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Okytes
        </a>
        <p className="eyebrow mb-4 mt-10">The details</p>
        <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
        <p className="mt-5 font-mono text-xs text-muted-foreground">
          Last updated: October 28, 2026
        </p>
        <article
          data-floating
          className="legal-content mt-10 space-y-9 rounded-3xl border border-border bg-card p-6 sm:p-10"
        >
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
