import { useCallback, useEffect, useState } from "react";

/**
 * Section-level navigation inside a single dashboard.
 *
 * Route shape:  #/d/<dashboardId>/<section>
 *               #/d/fleetflow           -> overview
 *               #/d/fleetflow/shipments -> shipments
 *
 * Kept in the hash so back/forward and deep links work — a dashboard that
 * looks clickable should behave like a real app, not a picture of one.
 */

export type SectionId =
  | "overview"
  | "map"
  | "shipments"
  | "routes"
  | "documents"
  | "analytics"
  | "settings";

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Live map" },
  { id: "shipments", label: "Shipments" },
  { id: "routes", label: "Routes" },
  { id: "documents", label: "Documents" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

const isSection = (v: string): v is SectionId =>
  SECTIONS.some((s) => s.id === v);

/** read the section out of a hash like "#/d/fleetflow/shipments" */
export function sectionFromHash(dashboardId: string): SectionId {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/");
  // ["d", "<id>", "<section?>"]
  if (parts[0] !== "d" || parts[1] !== dashboardId) return "overview";
  const sec = parts[2] ?? "";
  return isSection(sec) ? sec : "overview";
}

export function useSection(dashboardId: string) {
  const [section, setSection] = useState<SectionId>(() =>
    sectionFromHash(dashboardId),
  );

  useEffect(() => {
    const onHash = () => setSection(sectionFromHash(dashboardId));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [dashboardId]);

  const go = useCallback(
    (next: SectionId) => {
      const target = next === "overview" ? `#/d/${dashboardId}` : `#/d/${dashboardId}/${next}`;
      if (window.location.hash === target) return;
      window.location.hash = target;
    },
    [dashboardId],
  );

  return { section, go };
}
