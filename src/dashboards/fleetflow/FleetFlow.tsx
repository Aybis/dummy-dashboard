import { useState } from "react";
import { Layers, Compass } from "lucide-react";
import { AgentDrawer, Sidebar, Topbar } from "./components/Chrome";
import { RouteMap } from "./components/RouteMap";
import { AgentProposal, ShipmentFacts } from "./components/AgentProposal";
import { ActivityFeed, DecisionLog, FleetBoard } from "./components/Boards";
import { Badge, Stat } from "./components/ui";
import { hero, kpis, type Agent } from "./data/fleet";
import { useSection, type SectionId } from "./nav";
import {
  AnalyticsPage,
  DocumentsPage,
  MapPage,
  RoutesPage,
  SettingsPage,
  ShipmentsPage,
} from "./pages";

const DASHBOARD_ID = "fleetflow";

const META: Record<SectionId, { title: string; sub: string }> = {
  overview: { title: "Overview", sub: "West Coast corridor · Nov 1" },
  map: { title: "Live map", sub: "6 loads in motion · OSM tiles" },
  shipments: { title: "Shipments", sub: "All loads for this shift" },
  routes: { title: "Routes", sub: "Lanes under evaluation" },
  documents: { title: "Documents", sub: "BOL, POD, invoice reconciliation" },
  analytics: { title: "Analytics", sub: "Delivery, agents, delays" },
  settings: { title: "Settings", sub: "Autonomy, notifications, data" },
};

export default function FleetFlow() {
  const { section, go } = useSection(DASHBOARD_ID);
  const [query, setQuery] = useState("");
  const [agent, setAgent] = useState<Agent | null>(null);

  const meta = META[section];

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      <Sidebar
        active={section}
        go={go}
        onAgent={(a) => setAgent(a)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={meta.title}
          sub={meta.sub}
          query={query}
          onQuery={(v) => {
            setQuery(v);
            // searching anywhere means the user is looking for a load —
            // land them where the results actually are
            if (v && section !== "shipments" && section !== "documents") {
              go("shipments");
            }
          }}
        />

        <main className="grid-fade flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="mx-auto max-w-[1360px] space-y-4">
            {section === "overview" && <Overview />}
            {section === "map" && <MapPage />}
            {section === "shipments" && <ShipmentsPage query={query} />}
            {section === "routes" && <RoutesPage />}
            {section === "documents" && <DocumentsPage query={query} />}
            {section === "analytics" && <AnalyticsPage />}
            {section === "settings" && <SettingsPage />}

            <footer className="flex flex-wrap items-center justify-between gap-2 pb-1 pt-1">
              <span className="text-[10px] text-mute-400">
                FleetFlow AI · demo data · scenario SF-48291
              </span>
              <span className="num text-[10px] text-mute-400">
                last sync 2:41 PM · 38s decision latency
              </span>
            </footer>
          </div>
        </main>
      </div>

      {agent && <AgentDrawer agent={agent} onClose={() => setAgent(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview — the original showcase layout                             */
/* ------------------------------------------------------------------ */

function Overview() {
  return (
    <>
      {/* Row 1 — KPI strip */}
      <div className="panel grid grid-cols-2 divide-white/[0.06] overflow-hidden sm:grid-cols-4 sm:divide-x">
        {kpis.map((k) => (
          <Stat
            key={k.label}
            label={k.label}
            value={k.value}
            unit={k.unit}
            delta={k.delta}
            deltaTone={k.deltaTone}
            sub={k.sub}
            spark={k.spark}
          />
        ))}
      </div>

      {/* Row 2 — map + proposal + facts */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.95fr)_minmax(0,0.95fr)]">
        <div className="panel relative overflow-hidden">
          <div className="absolute left-3 top-3 z-[500] flex items-center gap-1.5">
            <span className="glass flex items-center gap-1.5 rounded-lg px-2 py-1">
              <Compass className="h-3 w-3 text-signal" strokeWidth={2.4} />
              <span className="text-[10.5px] font-semibold text-mute-100">
                {hero.id}
              </span>
              <span className="num text-[10px] text-amber">
                +{hero.lateBy}m
              </span>
            </span>
          </div>

          <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-1.5">
            <span className="glass flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9.5px] text-mute-300">
              <span className="h-1.5 w-4 rounded-full bg-signal" /> I-680 N
            </span>
            <span className="glass flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9.5px] text-mute-300">
              <span className="h-px w-4 border-t border-dashed border-rose" />{" "}
              I-80 EB
            </span>
          </div>

          <div className="h-[318px] w-full">
            <RouteMap />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.06] bg-ink-900/80 px-3 py-2 backdrop-blur">
            <span className="text-[10px] text-mute-400">
              <span className="num text-mute-200">{hero.savedMinutes}m</span>{" "}
              recovered
            </span>
            <span className="text-[10px] text-mute-400">
              <span className="num text-mute-200">{hero.extraMiles} mi</span>{" "}
              added
            </span>
            <span className="text-[10px] text-mute-400">
              conf.{" "}
              <span className="num text-signal">
                {(hero.confidence * 100).toFixed(0)}%
              </span>
            </span>
            <Badge tone="ghost" className="ml-auto">
              <Layers className="h-2.5 w-2.5" /> OSM · live
            </Badge>
          </div>
        </div>

        <AgentProposal />
        <ShipmentFacts />
      </div>

      {/* Row 3 — fleet + decision log */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <FleetBoard />
        <DecisionLog />
      </div>

      {/* Row 4 — feed + agent coverage */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ActivityFeed />
        <div className="panel flex flex-col justify-between p-4 sm:p-5">
          <div>
            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-mute-100">
              Agent coverage
            </h2>
            <p className="mt-0.5 text-[11px] text-mute-400">
              Four agents watching this corridor right now
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                ["Route", "34 proposals", "97.1%", "var(--color-signal)"],
                ["Dispatch", "28 proposals", "94.6%", "var(--color-sky)"],
                ["Document", "51 proposals", "99.2%", "var(--color-violet)"],
                ["Watch", "15 proposals", "91.8%", "var(--color-amber)"],
              ] as const
            ).map(([name, n, acc, color]) => (
              <div
                key={name}
                className="rounded-lg bg-white/[0.025] px-2.5 py-2 ring-1 ring-inset ring-white/[0.055]"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: color,
                      boxShadow: `0 0 7px ${color}`,
                    }}
                  />
                  <span className="text-[11px] font-medium text-mute-100">
                    {name}
                  </span>
                </div>
                <div className="num mt-1 flex items-baseline justify-between text-[10px] text-mute-400">
                  <span>{n}</span>
                  <span className="font-semibold text-signal">{acc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="num mt-3 border-t border-white/[0.05] pt-2.5 text-[10px] leading-relaxed text-mute-400">
            Human approval required for spend &gt; $25 · all decisions immutable
          </p>
        </div>
      </div>
    </>
  );
}
