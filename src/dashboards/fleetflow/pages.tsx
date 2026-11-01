import {
  Truck,
  Route as RouteIcon,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  MapPin,
  SearchX,
  CheckCircle2,
  CircleAlert,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { hero, type Status } from "./data/fleet";
import {
  analytics,
  documents,
  routes,
  settingsGroups,
  shipments,
} from "./data/pages";
import { Badge, Panel, PanelHead, Sparkline, type Tone } from "./components/ui";
import { RouteMap } from "./components/RouteMap";

/* ------------------------------------------------------------------ */
/* shared bits                                                         */
/* ------------------------------------------------------------------ */

const statusMap: Record<Status, { label: string; tone: Tone }> = {
  on_time: { label: "On time", tone: "signal" },
  at_risk: { label: "At risk", tone: "amber" },
  late: { label: "Late", tone: "rose" },
  delivered: { label: "Delivered", tone: "ghost" },
};

function PageShell({
  children,
  title,
  sub,
  icon,
}: {
  children: React.ReactNode;
  title: string;
  sub: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHead title={title} sub={sub} icon={icon} />
        {children}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shipments                                                           */
/* ------------------------------------------------------------------ */

export function ShipmentsPage({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const rows = q
    ? shipments.filter((s) =>
        [s.id, s.lane, s.carrier, s.driver, s.load, s.status]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : shipments;

  const counts = {
    late: shipments.filter((s) => s.status === "late").length,
    risk: shipments.filter((s) => s.status === "at_risk").length,
    onTime: shipments.filter((s) => s.status === "on_time").length,
    done: shipments.filter((s) => s.status === "delivered").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Late", counts.late, "rose"],
            ["At risk", counts.risk, "amber"],
            ["On time", counts.onTime, "signal"],
            ["Delivered", counts.done, "ghost"],
          ] as const
        ).map(([label, n, tone]) => (
          <Panel key={label} className="!p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-mute-400">
                {label}
              </span>
              <Badge tone={tone} dot={tone !== "ghost"}>
                {n}
              </Badge>
            </div>
            <div className="num mt-2 text-[22px] font-semibold leading-none text-mute-100">
              {n}
            </div>
          </Panel>
        ))}
      </div>

      <Panel padded={false} className="overflow-hidden">
        <div className="p-4 pb-3 sm:px-5">
          <PanelHead
            title="All shipments"
            sub={
              q
                ? `${rows.length} match “${query}”`
                : `${shipments.length} loads · West Coast corridor`
            }
            icon={<Truck />}
            right={
              q ? (
                <Badge tone="sky">filtered</Badge>
              ) : (
                <Badge tone="ghost">Nov 1</Badge>
              )
            }
          />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <SearchX className="h-6 w-6 text-mute-400" strokeWidth={1.8} />
            <p className="mt-3 text-[12.5px] font-medium text-mute-200">
              No shipments match “{query}”
            </p>
            <p className="mt-1 text-[11px] text-mute-400">
              Try a shipment id, lane, driver or carrier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-y border-white/[0.06] text-[9.5px] uppercase tracking-[0.09em] text-mute-400">
                  <th className="px-4 py-2 font-semibold sm:px-5">Shipment</th>
                  <th className="px-2 py-2 font-semibold">Lane</th>
                  <th className="px-2 py-2 font-semibold">Carrier / Driver</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 text-right font-semibold">ETA</th>
                  <th className="px-2 py-2 text-right font-semibold">Window</th>
                  <th className="px-4 py-2 text-right font-semibold sm:px-5">
                    Variance
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const st = statusMap[s.status];
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-white/[0.035] text-[11.5px] transition-colors last:border-0 hover:bg-white/[0.025] ${
                        s.hero ? "bg-amber/[0.035]" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5 sm:px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="num font-mono text-[11px] font-medium text-mute-100">
                            {s.id}
                          </span>
                          {s.hero && (
                            <span className="rounded bg-amber/15 px-1 py-px text-[8.5px] font-bold uppercase tracking-wide text-amber">
                              focus
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-[10px] text-mute-400">
                          {s.load}
                        </div>
                      </td>
                      <td className="num px-2 py-2.5 font-mono text-[10.5px] text-mute-300">
                        {s.lane}
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="text-[11px] text-mute-200">
                          {s.carrier}
                        </div>
                        <div className="text-[10px] text-mute-400">
                          {s.driver}
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge tone={st.tone} dot={s.status !== "delivered"}>
                          {st.label}
                        </Badge>
                      </td>
                      <td className="num px-2 py-2.5 text-right text-mute-200">
                        {s.eta}
                      </td>
                      <td className="num px-2 py-2.5 text-right text-[10.5px] text-mute-400">
                        {s.window}
                      </td>
                      <td
                        className={`num px-4 py-2.5 text-right font-medium sm:px-5 ${
                          s.status === "late"
                            ? "text-rose"
                            : s.status === "at_risk"
                              ? "text-amber"
                              : "text-mute-300"
                        }`}
                      >
                        {s.delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live map                                                            */
/* ------------------------------------------------------------------ */

export function MapPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Panel padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-signal" strokeWidth={2.2} />
            <span className="text-[12px] font-semibold text-mute-100">
              Live corridor
            </span>
            <span className="num text-[10px] text-mute-400">
              {hero.origin} → {hero.destination}
            </span>
          </div>
          <Badge tone="ghost">OSM · live</Badge>
        </div>
        <div className="h-[calc(100vh-190px)] min-h-[420px] w-full">
          <RouteMap />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelHead
            title="Focus shipment"
            sub={`${hero.id} · ${hero.carrier}`}
            icon={<RouteIcon />}
            right={<Badge tone="amber" dot>In transit</Badge>}
          />
          <div className="space-y-2">
            <Row k="Progress" v={`${hero.savedMinutes}m recovered`} />
            <Row k="Added distance" v={`${hero.extraMiles} mi`} />
            <Row k="Projected ETA" v={hero.currentEta} tone />
            <Row k="Customer window" v={hero.window} />
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Legend" sub="Two lanes under evaluation" />
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center gap-2 text-mute-300">
              <span className="h-1.5 w-5 rounded-full bg-signal" />
              I-680 N → CA-4 E · proposed
            </li>
            <li className="flex items-center gap-2 text-mute-300">
              <span className="h-px w-5 border-t border-dashed border-rose" />
              I-80 EB · original, congested
            </li>
            <li className="flex items-center gap-2 text-mute-300">
              <span className="h-2.5 w-2.5 rounded-full bg-amber" />
              SF-48291 current position
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Routes                                                             */
/* ------------------------------------------------------------------ */

export function RoutesPage() {
  return (
    <PageShell
      title="Routes"
      sub="Lanes under evaluation · 1 proposal awaiting approval"
      icon={<RouteIcon />}
    >
      <ul className="space-y-2">
        {routes.map((r) => (
          <li
            key={r.name}
            className={`rounded-xl px-3 py-3 ring-1 ring-inset transition-colors ${
              r.status === "proposed"
                ? "bg-signal/[0.05] ring-signal/25"
                : "bg-white/[0.02] ring-white/[0.055]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] font-semibold text-mute-100">
                {r.name}
              </span>
              <Badge
                tone={
                  r.status === "proposed"
                    ? "signal"
                    : r.status === "active"
                      ? "sky"
                      : "ghost"
                }
                dot={r.status !== "idle"}
              >
                {r.status}
              </Badge>
              <span className="num ml-auto text-[10.5px] text-mute-400">
                {r.loads} load{r.loads === 1 ? "" : "s"} · {r.miles} mi
              </span>
              <span
                className={`num text-[11px] font-semibold ${
                  r.avgDelay.startsWith("−")
                    ? "text-signal"
                    : r.avgDelay.startsWith("+")
                      ? "text-amber"
                      : "text-mute-400"
                }`}
              >
                {r.avgDelay}
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-mute-400">
              <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.4} />
              {r.note}
            </p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Documents                                                          */
/* ------------------------------------------------------------------ */

const docStatus: Record<
  (typeof documents)[number]["status"],
  { label: string; tone: Tone; Icon: typeof CheckCircle2 }
> = {
  verified: { label: "Verified", tone: "signal", Icon: CheckCircle2 },
  variance: { label: "Variance", tone: "amber", Icon: CircleAlert },
  pending: { label: "Pending", tone: "ghost", Icon: Clock },
};

export function DocumentsPage({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const rows = q
    ? documents.filter((d) =>
        [d.id, d.type, d.shipment, d.status, d.owner]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : documents;

  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="p-4 pb-3 sm:px-5">
        <PanelHead
          title="Documents"
          sub={q ? `${rows.length} match “${query}”` : "BOL, POD, invoice reconciliation"}
          icon={<FileText />}
          right={<Badge tone="ghost">{documents.length} records</Badge>}
        />
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <SearchX className="h-6 w-6 text-mute-400" strokeWidth={1.8} />
          <p className="mt-3 text-[12.5px] font-medium text-mute-200">
            No documents match “{query}”
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.045]">
          {rows.map((d) => {
            const st = docStatus[d.status];
            return (
              <li
                key={d.id}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.022] sm:px-5"
              >
                <st.Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    d.status === "verified"
                      ? "text-signal"
                      : d.status === "variance"
                        ? "text-amber"
                        : "text-mute-400"
                  }`}
                  strokeWidth={2.2}
                />
                <span className="num font-mono text-[11px] text-mute-100">
                  {d.id}
                </span>
                <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-mute-300">
                  {d.type}
                </span>
                <span className="num font-mono text-[10.5px] text-mute-300">
                  {d.shipment}
                </span>
                <span className="ml-auto hidden text-[10.5px] text-mute-400 sm:inline">
                  {d.owner}
                </span>
                <span className="num text-[10px] text-mute-400">
                  {d.updated}
                </span>
                <Badge tone={st.tone}>{st.label}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics                                                          */
/* ------------------------------------------------------------------ */

export function AnalyticsPage() {
  const maxDecisions = Math.max(...analytics.byAgent.map((a) => a.decisions));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHead
            title="On-time delivery"
            sub="Trailing 7 days · 412 loads"
            icon={<BarChart3 />}
            right={
              <span className="num text-[11px] font-semibold text-signal">
                96.4%
              </span>
            }
          />
          <div className="flex items-end justify-between gap-1.5">
            {analytics.weekly.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="num text-[9px] text-mute-400">{d.onTime}</span>
                <div className="flex h-[110px] w-full items-end">
                  <div
                    className="w-full rounded-t-[3px] bg-gradient-to-t from-signal/15 to-signal/70"
                    style={{ height: `${((d.onTime - 88) / 12) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-mute-400">{d.day}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title="Decisions by agent"
            sub="Today · 128 total"
            icon={<SettingsIcon />}
          />
          <ul className="space-y-3">
            {analytics.byAgent.map((a) => (
              <li key={a.name}>
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-mute-200">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: a.color }}
                    />
                    {a.name}
                  </span>
                  <span className="num text-mute-400">
                    {a.decisions} · {a.accuracy}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(a.decisions / maxDecisions) * 100}%`,
                      background: a.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead title="Delay causes" sub="Trailing 30 days" />
          <ul className="space-y-2.5">
            {analytics.delayCauses.map((d) => (
              <li key={d.cause} className="flex items-center gap-3">
                <span className="w-[92px] shrink-0 text-[11px] text-mute-300">
                  {d.cause}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-amber/70"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="num w-8 text-right text-[10.5px] text-mute-400">
                  {d.pct}%
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead title="Approval latency" sub="Flag → decision, seconds" />
          <div className="flex items-end gap-4">
            <div>
              <div className="num text-[30px] font-semibold leading-none text-mute-100">
                38
                <span className="ml-1 text-[13px] font-medium text-mute-400">
                  s
                </span>
              </div>
              <p className="mt-1 text-[10px] text-mute-400">
                median, trailing 7 days
              </p>
            </div>
            <div className="ml-auto">
              <Sparkline
                data={[92, 88, 84, 79, 71, 66, 60, 55, 49, 44, 41, 38]}
                width={150}
                height={44}
                color="var(--color-signal)"
              />
            </div>
          </div>
          <p className="mt-3 border-t border-white/[0.05] pt-2.5 text-[10.5px] leading-relaxed text-mute-400">
            41 decisions auto-approved by policy, 87 required a human. Zero
            window breaches across both paths.
          </p>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                           */
/* ------------------------------------------------------------------ */

export function SettingsPage() {
  return (
    <div className="space-y-4">
      {settingsGroups.map((g) => (
        <Panel key={g.title}>
          <PanelHead title={g.title} sub="Applied to the West Coast corridor" />
          <ul className="divide-y divide-white/[0.04]">
            {g.items.map((i) => (
              <li
                key={i.label}
                className="flex items-start justify-between gap-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[11.5px] font-medium text-mute-100">
                    {i.label}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-mute-400">{i.note}</p>
                </div>
                <span className="num shrink-0 rounded-md bg-white/[0.04] px-2 py-1 text-[10.5px] font-medium text-mute-200 ring-1 ring-inset ring-white/[0.06]">
                  {i.value}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ))}
      <p className="num flex items-center gap-1.5 px-1 text-[10px] text-mute-400">
        <SlidersHorizontal className="h-2.5 w-2.5" strokeWidth={2.4} />
        Demo config — read-only in this reference build.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* small row                                                          */
/* ------------------------------------------------------------------ */

function Row({ k, v, tone }: { k: string; v: string; tone?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-lg bg-white/[0.02] px-2.5 py-1.5">
      <span className="text-[10.5px] text-mute-400">{k}</span>
      <span
        className={`num text-[11px] font-medium ${tone ? "text-signal" : "text-mute-100"}`}
      >
        {v}
      </span>
    </div>
  );
}
