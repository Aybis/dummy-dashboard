import { useState } from "react";
import {
  Route,
  ArrowRight,
  Check,
  X,
  Clock,
  Fuel,
  ShieldCheck,
  Sparkles,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import { hero } from "../data/fleet";
import { Badge, Button, KV, Panel, PanelHead } from "./ui";

/* ------------------------------------------------------------------ */
/* AgentProposal — the decision surface. The whole product lives here. */
/* ------------------------------------------------------------------ */

export function AgentProposal() {
  const [state, setState] = useState<"pending" | "approved" | "declined">(
    "pending",
  );

  const pending = state === "pending";

  return (
    <Panel className="overflow-hidden">
      {/* accent hairline that changes with decision state */}
      <div
        className="absolute inset-x-0 top-0 h-px transition-colors duration-300"
        style={{
          background: pending
            ? "linear-gradient(90deg,transparent,#c6f24e,transparent)"
            : state === "approved"
              ? "linear-gradient(90deg,transparent,#c6f24e,transparent)"
              : "linear-gradient(90deg,transparent,#f2566b,transparent)",
        }}
      />

      <PanelHead
        title="Route Agent"
        sub={
          pending
            ? "Proposal awaiting your approval"
            : state === "approved"
              ? "Approved · decision logged"
              : "Declined · rationale logged"
        }
        icon={<Sparkles />}
        right={
          <Badge tone={pending ? "amber" : state === "approved" ? "signal" : "rose"} dot>
            {pending ? "Needs approval" : state === "approved" ? "Executed" : "Overridden"}
          </Badge>
        }
      />

      {/* what it flagged */}
      <div className="rounded-xl bg-ink-950/60 p-3 ring-1 ring-inset ring-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="num rounded bg-amber/12 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-amber ring-1 ring-inset ring-amber/25">
            {hero.id}
          </span>
          <span className="text-[11.5px] text-mute-300">
            {hero.origin} → {hero.destination}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <TriangleAlert className="h-4 w-4 shrink-0 text-amber" strokeWidth={2.2} />
          <p className="text-[12.5px] leading-snug text-mute-100">
            Running{" "}
            <span className="num font-semibold text-amber">{hero.lateBy} min</span>{" "}
            behind on {hero.originalRoute}
          </p>
        </div>
        <p className="mt-1.5 pl-[26px] text-[11px] leading-snug text-mute-400">
          {hero.delayCause}
        </p>
      </div>

      {/* before → after */}
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <LaneBox
          label="Original"
          route={hero.originalRoute}
          eta={hero.originalEta}
          tone="rose"
          dim={!pending}
        />
        <div className="flex items-center justify-center">
          <ArrowRight
            className={`h-4 w-4 transition-colors ${pending ? "text-mute-400" : "text-signal"}`}
            strokeWidth={2.4}
          />
        </div>
        <LaneBox
          label="Proposed"
          route={hero.proposedRoute}
          eta={hero.currentEta}
          tone="signal"
          highlight={pending || state === "approved"}
        />
      </div>

      {/* the number that matters */}
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-signal/[0.06] px-3 py-2.5 ring-1 ring-inset ring-signal/20">
        <ShieldCheck className="h-4 w-4 shrink-0 text-signal" strokeWidth={2.2} />
        <p className="text-[11.5px] leading-snug text-mute-200">
          Arrives{" "}
          <span className="num font-semibold text-signal">{hero.currentEta}</span>{" "}
          — inside the {hero.window} window, for{" "}
          <span className="num font-semibold text-mute-100">
            {hero.extraMiles} extra miles
          </span>
          .
        </p>
      </div>

      {/* rationale — the "why", which is the point of the whole thing */}
      <details className="group mt-2.5 rounded-xl ring-1 ring-inset ring-white/[0.05] open:bg-white/[0.02]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-[11px] font-medium text-mute-300 hover:text-mute-100">
          <Route className="h-3.5 w-3.5 text-mute-400" strokeWidth={2} />
          Agent rationale
          <span className="ml-auto text-[10px] text-mute-400 group-open:hidden">
            show
          </span>
          <span className="ml-auto hidden text-[10px] text-mute-400 group-open:inline">
            hide
          </span>
        </summary>
        <div className="border-t border-white/[0.05] px-3 pb-2 pt-1">
          <KV k="Delay projection" v={`+${hero.lateBy} min`} tone="warn" />
          <KV k="Reroute recovery" v={`−${hero.savedMinutes} min`} tone="good" />
          <KV k="Net added distance" v={`${hero.extraMiles} mi`} />
          <KV k="Fuel exposure" v="+$18.40" />
          <KV k="Detention avoided" v="$220.00" tone="good" />
          <KV k="Agent confidence" v={`${(hero.confidence * 100).toFixed(0)}%`} tone="good" />
          <KV k="Model" v="route-opt v4.2" mono />
        </div>
      </details>

      {/* actions — the actual product interaction */}
      <div className="mt-3.5 flex items-center gap-2">
        {pending ? (
          <>
            <Button
              onClick={() => setState("approved")}
              icon={<Check />}
              className="flex-1"
            >
              Approve reroute
            </Button>
            <Button
              variant="ghost"
              onClick={() => setState("declined")}
              icon={<X />}
            >
              Decline
            </Button>
          </>
        ) : (
          <div className="anim-rise w-full rounded-lg bg-white/[0.03] px-3 py-2 ring-1 ring-inset ring-white/[0.06]">
            <div className="flex items-center gap-2">
              <span
                className={`grid h-4 w-4 place-items-center rounded-full ${state === "approved" ? "bg-signal" : "bg-rose"}`}
              >
                {state === "approved" ? (
                  <Check className="h-2.5 w-2.5 text-ink-950" strokeWidth={3.4} />
                ) : (
                  <X className="h-2.5 w-2.5 text-ink-950" strokeWidth={3.4} />
                )}
              </span>
              <span className="text-[11.5px] font-medium text-mute-100">
                {state === "approved"
                  ? "Reroute executed — driver notified"
                  : "Declined — original route retained"}
              </span>
            </div>
            <p className="num mt-1 pl-6 text-[10px] text-mute-400">
              {state === "approved"
                ? `DEC-1044 · D. Reyes · 2:41 PM · ${hero.currentEta} ETA confirmed`
                : "DEC-1044 · D. Reyes · 2:41 PM · window breach risk accepted"}
            </p>
            <button
              type="button"
              onClick={() => setState("pending")}
              className="mt-1.5 pl-6 text-[10px] text-mute-400 underline decoration-dotted hover:text-signal"
            >
              reset demo
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}

function LaneBox({
  label,
  route,
  eta,
  tone,
  highlight,
  dim,
}: {
  label: string;
  route: string;
  eta: string;
  tone: "rose" | "signal";
  highlight?: boolean;
  dim?: boolean;
}) {
  const isSignal = tone === "signal";
  return (
    <div
      className={`rounded-lg px-2.5 py-2 ring-1 ring-inset transition-all ${
        isSignal
          ? highlight
            ? "bg-signal/[0.07] ring-signal/30"
            : "bg-white/[0.02] ring-white/[0.06]"
          : "bg-rose/[0.05] ring-rose/20"
      } ${dim && !isSignal ? "opacity-60" : ""}`}
    >
      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-mute-400">
        {label}
      </div>
      <div
        className={`mt-1 text-[11px] font-semibold leading-tight ${isSignal ? "text-signal" : "text-rose"}`}
      >
        {route}
      </div>
      <div className="num mt-1.5 flex items-center gap-1 text-[10px] text-mute-300">
        <Clock className="h-2.5 w-2.5" strokeWidth={2.4} />
        {eta}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shipment snapshot — context beside the proposal                     */
/* ------------------------------------------------------------------ */

export function ShipmentFacts() {
  return (
    <Panel>
      <PanelHead
        title="Shipment snapshot"
        sub={`${hero.carrier} · ${hero.trailer}`}
        icon={<MapPin />}
        right={<Badge tone="amber" dot>In transit</Badge>}
      />
      <div className="divide-y divide-white/[0.04]">
        <KV k="Load" v={hero.load} />
        <KV k="Driver" v={hero.driver} />
        <KV k="Lane" v={`${hero.origin} → ${hero.destination}`} />
        <KV k="Customer" v={hero.customer} />
        <KV k="Window" v={hero.window} />
        <KV k="Original ETA" v={hero.originalEta} tone="bad" />
        <KV k="Projected ETA" v={hero.currentEta} tone="good" />
        <KV k="Added distance" v={`${hero.extraMiles} mi`} />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber/[0.07] px-2.5 py-2 ring-1 ring-inset ring-amber/20">
        <Fuel className="h-3.5 w-3.5 shrink-0 text-amber" strokeWidth={2.2} />
        <span className="text-[10.5px] leading-snug text-mute-200">
          Fuel +$18.40 vs $220 detention avoided
        </span>
      </div>
    </Panel>
  );
}
