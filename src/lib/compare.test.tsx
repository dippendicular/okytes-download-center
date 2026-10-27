import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Compare } from "@/components/Compare";
import { COMPARE_ROWS, ENGINE_ADVANTAGES, PRODUCTS } from "./compare";
import { FEATURE_STATUS } from "./features";

describe("named download-manager comparison", () => {
  it("compares four named products with complete, sourced cells and no placeholders", () => {
    expect(PRODUCTS.map((product) => product.id)).toEqual(["okytes", "idm", "fdm", "xdm"]);
    const officialHosts = {
      okytes: ["github.com"],
      idm: ["www.internetdownloadmanager.com", "ww2.internetdownloadmanager.com"],
      fdm: ["www.freedownloadmanager.org"],
      xdm: ["xtremedownloadmanager.com", "github.com"],
    };
    for (const row of COMPARE_ROWS) {
      expect(Object.keys(row.cells)).toEqual(PRODUCTS.map((product) => product.id));
      for (const product of PRODUCTS) {
        const cell = row.cells[product.id];
        expect(cell.text.trim()).not.toBe("");
        expect(cell.text + " " + (cell.detail ?? "")).not.toMatch(
          /varies|not verified|unverified|unknown|planned/i,
        );
        expect(officialHosts[product.id]).toContain(new URL(cell.source).hostname);
      }
    }
  });

  it("keeps macOS explicitly coming soon for Okytes and available for FDM/XDM", () => {
    const row = COMPARE_ROWS.find((item) => item.id === "macos")!;
    expect(row.cells.okytes).toMatchObject({ kind: "soon", text: "Coming soon" });
    expect(row.cells.idm.kind).toBe("no");
    expect(row.cells.fdm.kind).toBe("yes");
    expect(row.cells.xdm.kind).toBe("yes");
    expect(
      COMPARE_ROWS.flatMap((item) => PRODUCTS.map((product) => item.cells[product.id])).filter(
        (cell) => cell.kind === "soon",
      ),
    ).toHaveLength(1);
  });

  it("recognizes competitors' shared capabilities instead of inventing an exclusive advantage", () => {
    expect(FEATURE_STATUS.http).toBe("available");
    expect(FEATURE_STATUS.extensions).toBe("available");
    for (const id of ["parallel", "recovery", "resume", "automation"]) {
      const row = COMPARE_ROWS.find((item) => item.id === id)!;
      for (const product of PRODUCTS) expect(row.cells[product.id].kind).toBe("yes");
    }
  });

  it("compares architecture rather than licensing or pricing", () => {
    expect(COMPARE_ROWS.map((row) => row.id)).toEqual([
      "parallel",
      "recovery",
      "resume",
      "architecture",
      "automation",
      "linux-packages",
      "macos",
    ]);
    expect(JSON.stringify(COMPARE_ROWS)).not.toMatch(/license|licensing|EULA|trial|pricing|3\.9/i);
    expect(PRODUCTS[0]!.name).toBe("ODM");
    const architecture = COMPARE_ROWS.find((row) => row.id === "architecture")!;
    expect(architecture.cells.okytes.text).toContain("UI-independent");
    expect(architecture.cells.xdm.text).toContain("Separate Java core");
    expect(architecture.cells.xdm.kind).toBe("yes");
  });

  it("pins ODM mechanisms to the release source and verified implementation flags", () => {
    for (const key of ["adaptive", "crashSafe", "safeResume", "verified"] as const) {
      expect(FEATURE_STATUS[key]).toBe("available");
    }
    for (const row of COMPARE_ROWS.filter((row) => !["linux-packages", "macos"].includes(row.id))) {
      expect(row.cells.okytes.source).toContain("/blob/v0.0.1/");
    }
    for (const advantage of ENGINE_ADVANTAGES) {
      expect(advantage.source).toContain("/blob/v0.0.1/");
    }
  });

  it("renders all five columns, accessible official-source links, and a keyboard-scrollable region", () => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Compare />);
    expect(root.querySelectorAll('th[scope="col"]')).toHaveLength(5);
    expect(root.querySelectorAll("tbody tr")).toHaveLength(COMPARE_ROWS.length);
    expect(root.querySelector('[role="region"][tabindex="0"]')).not.toBeNull();
    expect(root.querySelectorAll('tbody a[aria-label^="Official source:"]')).toHaveLength(
      COMPARE_ROWS.length * PRODUCTS.length,
    );
    expect(root.textContent).not.toMatch(
      /typical managers|not verified|varies|old guard|Okytes|Rust|licens/i,
    );
    expect(root.querySelector("#compare-title")?.textContent).toContain("in the engine.");
    expect(root.querySelectorAll("article[data-floating]")).toHaveLength(3);
  });
});
