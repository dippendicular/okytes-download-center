import { motion } from "motion/react";
import { Check, Clock3, ExternalLink, Minus, MoveHorizontal } from "lucide-react";
import { COMPARE_ROWS, ENGINE_ADVANTAGES, LAST_VERIFIED, PRODUCTS, type Cell } from "@/lib/compare";
import { cn } from "@/lib/utils";

function CellView({
  cell,
  product,
  feature,
  highlight,
}: {
  cell: Cell;
  product: string;
  feature: string;
  highlight: boolean;
}) {
  const Icon = cell.kind === "yes" ? Check : cell.kind === "soon" ? Clock3 : Minus;
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          cell.kind === "yes"
            ? "text-success"
            : cell.kind === "soon"
              ? "text-primary"
              : "text-muted-foreground",
        )}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-relaxed",
            highlight ? "text-foreground" : "text-foreground/85",
          )}
        >
          {cell.text}
        </p>
        {cell.detail && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{cell.detail}</p>
        )}
      </div>
      <a
        href={cell.source}
        target="_blank"
        rel="noreferrer"
        aria-label={`Official source: ${product}, ${feature}`}
        title="View official source"
        className="mt-0.5 shrink-0 rounded text-muted-foreground transition-colors hover:text-primary"
      >
        <ExternalLink aria-hidden className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export function Compare() {
  return (
    <section
      id="compare"
      aria-labelledby="compare-title"
      className="relative scroll-mt-24 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5">
        <p className="eyebrow mb-4">ODM / IDM / FDM / XDM</p>
        <h2 id="compare-title" className="text-huge max-w-5xl">
          The difference is
          <br />
          <span className="text-primary">in the engine.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          ODM earns its place with measured concurrency, durable checkpoints, and one shared control
          plane. Not just more connections: a deliberate design for how transfers scale, recover,
          and fit into your workflow.
        </p>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {ENGINE_ADVANTAGES.map((item, index) => (
            <motion.article
              key={item.id}
              data-floating
              whileHover={{ y: -6 }}
              className="glass flex min-w-0 flex-col rounded-3xl p-6"
            >
              <span className="font-mono text-xs text-primary">0{index + 1} / ENGINE DESIGN</span>
              <h3 className="mt-5 font-display text-2xl font-semibold">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
              <a
                href={item.source}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-start gap-2 font-mono text-[11px] leading-relaxed text-primary"
              >
                <span>{item.proof}</span>
                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              </a>
            </motion.article>
          ))}
        </div>
        <p className="mt-8 flex items-center gap-2 font-mono text-xs text-muted-foreground lg:hidden">
          <MoveHorizontal className="h-4 w-4 text-primary" aria-hidden />
          Swipe the table to compare all four.
        </p>
        <div
          data-floating
          role="region"
          aria-label="Compare ODM architecture with IDM, FDM and XDM"
          tabIndex={0}
          className="mt-4 overflow-x-auto rounded-3xl border border-border lg:mt-10"
        >
          <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 text-left">
            <caption className="sr-only">
              Transfer architecture, recovery, automation and deployment of ODM, Internet Download
              Manager, Free Download Manager, and Xtreme Download Manager. Each cell links to an
              official source.
            </caption>
            <colgroup>
              <col className="w-[200px]" />
              {PRODUCTS.map((product) => (
                <col key={product.id} className="w-[230px]" />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-b border-border bg-background p-5 align-bottom font-mono text-xs uppercase tracking-widest text-muted-foreground"
                >
                  What matters
                </th>
                {PRODUCTS.map((product) => (
                  <th
                    key={product.id}
                    scope="col"
                    className={cn(
                      "border-b border-border p-5 align-top",
                      product.id === "okytes" && "border-x border-x-primary/40 bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display text-2xl font-semibold",
                        product.id === "okytes" && "text-primary",
                      )}
                    >
                      {product.name}
                    </span>
                    <span className="mt-2 block text-xs font-normal leading-relaxed text-muted-foreground">
                      {product.description}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: index * 0.025 }}
                  className="group"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-border bg-background p-5 align-top"
                  >
                    <span className="text-sm font-semibold">{row.label}</span>
                    <span className="mt-1.5 block text-xs font-normal leading-relaxed text-muted-foreground">
                      {row.description}
                    </span>
                  </th>
                  {PRODUCTS.map((product) => (
                    <td
                      key={product.id}
                      className={cn(
                        "border-b border-border p-5 align-top",
                        product.id === "okytes"
                          ? "border-x border-x-primary/40 bg-primary/10"
                          : "bg-card/40",
                      )}
                    >
                      <CellView
                        cell={row.cells[product.id]}
                        product={product.name}
                        feature={row.label}
                        highlight={product.id === "okytes"}
                      />
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
    </section>
  );
}
