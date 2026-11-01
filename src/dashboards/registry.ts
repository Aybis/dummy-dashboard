/**
 * Registry of dummy dashboards — "Konseptor".
 *
 * Add a dashboard: drop a folder in `src/dashboards/<id>/` exporting a
 * default component, then register it here. The gallery and the router
 * both read from this one list.
 */

import type { ComponentType } from "react";
import FleetFlow from "./fleetflow/FleetFlow";

export interface DashboardMeta {
  /** url segment: /d/<id> */
  id: string;
  name: string;
  tagline: string;
  category: string;
  stack: string[];
  accent: string;
  /** short note on where the design came from */
  source: string;
  component: ComponentType;
}

export const dashboards: DashboardMeta[] = [
  {
    id: "fleetflow",
    name: "FleetFlow AI",
    tagline:
      "AI agent logistics CRM — a route agent catches a late truck before it's late.",
    category: "Logistics · Agentic",
    stack: ["React", "Vite", "Tailwind", "Leaflet"],
    accent: "#c6f24e",
    source: "IG reel @ui.iliasmiah000 · DfKk_35BP85",
    component: FleetFlow,
  },
];

export const byId = (id: string) => dashboards.find((d) => d.id === id);
