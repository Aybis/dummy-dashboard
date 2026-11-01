import {
  Truck,
  ScrollText,
  Activity,
  CheckCircle2,
  Bot,
  CircleAlert,
  XCircle,
} from "lucide-react";
import {
  decisions,
  fleet,
  timeline,
  type Decision,
  type Status,
} from "../data/fleet";
import { Badge, Panel, PanelHead, type Tone } from "./ui";

/* ------------------------------------------------------------------ */
/* Fleet board                                                         */
/* ------------------------------------------------------------------ */

const statusMap: Record<Status, { label: string; tone: Tone }> = {
  on_time: { label: "On time", tone: "signal" },
  at_risk: { label: "At risk", tone: "amber" },
  late: { label: "Late", tone: "rose" },
  delivered: { label: "Delivered", tone: "ghost" },
};

export function FleetBoard() {
  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="p-4 pb-3 sm:px-5">
        <PanelHead
          title="Active corridor"
          sub="6 loads in motion · inclines account for current ETA"
          icon={<Truck />}
          right={<Badge tone="ghost">SF ⇄ SAC</Badge>}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-white/[0.06] text-[9.5px] uppercase tracking-[0.09em] text-mute-400">
              <th className="px-4 py-2 font-semibold sm:px-5">Shipment</th>
              <th className="px-2 py-2 font-semibold">Lane</th>
              <th className="px-2 py-2 font-semibold">Status</th>
              <th className="px-2 py-2 text-right font-semibold">ETA</th>
              <th className="px-4 py-2 text-right font-semibold sm:px-5">
                Variance
              </th>
            </tr>
          </thead>
          <tbody>
            {fleet.map((s) => {
              const st = statusMap[s.status];
              return (
                <tr
                  key={s.id}
                  className={`group border-b border-white/[0.035] text-[11.5px] transition-colors last:border-0 hover:bg-white/[0.025] ${
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
                  </td>
                  <td className="num px-2 py-2.5 font-mono text-[10.5px] text-mute-300">
                    {s.lane}
                  </td>
                  <td className="px-2 py-2.5">
                    <Badge tone={st.tone} dot={s.status !== "delivered"}>
                      {st.label}
                    </Badge>
                  </td>
                  <td className="num px-2 py-2.5 text-right text-mute-200">
                    {s.eta}
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
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Decision log — "the decision is logged with who approved it and why" */
/* ------------------------------------------------------------------ */

const decisionTone: Record<Decision["status"], Tone> = {
  approved: "signal",
  declined: "rose",
  auto: "sky",
};

const agentName: Record<Decision["agent"], string> = {
  route: "Route Agent",
  dispatch: "Dispatch Agent",
  document: "Document Agent",
  watch: "Watch Agent",
};

export function DecisionLog() {
  return (
    <Panel padded={false} className="flex h-full flex-col overflow-hidden">
      <div className="p-4 pb-2 sm:px-5">
        <PanelHead
          title="Decision log"
          sub="Every agent action, with approver and rationale"
          icon={<ScrollText />}
          right={<Badge tone="ghost">128 today</Badge>}
        />
      </div>
      <ul className="flex-1 divide-y divide-white/[0.045] overflow-y-auto">
        {decisions.map((d) => (
          <li
            key={d.id}
            className="group px-4 py-2.5 transition-colors hover:bg-white/[0.022] sm:px-5"
          >
            <div className="flex items-center gap-2">
              <span className="num font-mono text-[10px] text-mute-400">
                {d.id}
              </span>
              <span className="num text-[10px] text-mute-400">{d.at}</span>
              <Badge tone={decisionTone[d.status]} className="ml-auto">
                {d.status === "auto" ? "auto-policy" : d.status}
              </Badge>
            </div>
            <div className="mt-1 flex items-start gap-1.5">
              <Bot
                className={`mt-[2px] h-3 w-3 shrink-0 ${
                  d.agent === "route"
                    ? "text-signal"
                    : d.agent === "dispatch"
                      ? "text-sky"
                      : d.agent === "document"
                        ? "text-violet"
                        : "text-amber"
                }`}
                strokeWidth={2.2}
              />
              <div className="min-w-0">
                <p className="text-[12px] leading-snug text-mute-100">
                  <span className="font-medium">{agentName[d.agent]}</span>
                  <span className="text-mute-400"> · {d.shipment}</span>
                </p>
                <p className="text-[11.5px] leading-snug text-mute-200">
                  {d.action}
                </p>
              </div>
            </div>
            <p className="mt-1 pl-[18px] text-[10.5px] leading-relaxed text-mute-400">
              {d.rationale}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-[18px]">
              <span className="flex items-center gap-1 text-[10px] text-mute-300">
                <CheckCircle2 className="h-2.5 w-2.5 text-signal/70" strokeWidth={2.4} />
                {d.approvedBy}
              </span>
              <span className="num text-[10px] text-mute-400">{d.impact}</span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Activity feed                                                       */
/* ------------------------------------------------------------------ */

const toneIcon = {
  warn: { Icon: CircleAlert, cls: "text-amber" },
  good: { Icon: CheckCircle2, cls: "text-signal" },
  agent: { Icon: Bot, cls: "text-sky" },
  neutral: { Icon: XCircle, cls: "text-mute-400" },
} as const;

export function ActivityFeed() {
  return (
    <Panel>
      <PanelHead
        title="Live activity"
        sub="SF-48291 · today"
        icon={<Activity />}
        right={
          <span className="flex items-center gap-1.5 text-[10px] text-mute-400">
            <span
              className="h-1.5 w-1.5 rounded-full bg-rose"
              style={{ animation: "pulse-dot 1.8s ease-in-out infinite" }}
            />
            live
          </span>
        }
      />
      <ol className="relative space-y-3.5 pl-1">
        <span className="absolute bottom-1 left-[6.5px] top-1 w-px bg-white/[0.07]" />
        {timeline.map((e, i) => {
          const { Icon, cls } = toneIcon[e.tone];
          return (
            <li key={i} className="relative flex gap-2.5">
              <span className="relative z-10 mt-[3px] grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-ink-900 ring-1 ring-white/[0.08]">
                <Icon className={`h-2 w-2 ${cls}`} strokeWidth={2.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-[11.5px] font-medium leading-snug text-mute-100">
                    {e.title}
                  </p>
                  <span className="num ml-auto shrink-0 text-[9.5px] text-mute-400">
                    {e.t}
                  </span>
                </div>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-mute-400">
                  {e.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 rounded-lg bg-white/[0.025] px-2.5 py-2 ring-1 ring-inset ring-white/[0.055]">
        <p className="num text-[10px] leading-relaxed text-mute-300">
          <span className="text-signal">38s</span> flag → approval ·{" "}
          <span className="text-signal">1</span> human in the loop ·{" "}
          <span className="text-mute-200">0</span> window breaches
        </p>
      </div>
    </Panel>
  );
}
