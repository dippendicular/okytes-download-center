import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import { PhoneIcon } from "./Icons";

/** "Desktop-only for now" card with copy-link + inline QR (lib lazy-loaded). */
export function MobileHandoff() {
  const [url, setUrl] = useState("");
  const [cells, setCells] = useState<boolean[][] | null>(null);
  const { copied, copy } = useCopy();

  useEffect(() => {
    const u = window.location.href.split("#")[0] ?? window.location.href;
    setUrl(u);
    import("qrcode-generator").then(({ default: qrcode }) => {
      const qr = qrcode(0, "M");
      qr.addData(u);
      qr.make();
      const n = qr.getModuleCount();
      setCells(
        Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c))),
      );
    });
  }, []);

  const n = cells?.length ?? 0;

  return (
    <div
      data-floating
      className="glass mb-8 flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <p className="mb-2 flex items-center gap-2 eyebrow">
          <PhoneIcon className="h-4 w-4" /> On your phone?
        </p>
        <p className="font-display text-2xl font-semibold tracking-tight">
          Okytes is desktop-only for now. Send this page to your PC.
        </p>
        <button
          type="button"
          onClick={() => copy(url)}
          data-analytics-event="share_link_copy"
          data-analytics-label="Copy website link"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
          <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
        </button>
      </div>
      <div className="h-36 w-36 shrink-0 rounded-2xl bg-foreground p-2.5">
        {cells && (
          <svg
            viewBox={`0 0 ${n} ${n}`}
            className="h-full w-full"
            role="img"
            aria-label="QR code linking to this page"
          >
            {cells.flatMap((row, r) =>
              row.map((on, c) =>
                on ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width="1.02"
                    height="1.02"
                    fill="var(--background)"
                  />
                ) : null,
              ),
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
