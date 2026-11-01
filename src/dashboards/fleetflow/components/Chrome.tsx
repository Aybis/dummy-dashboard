import {
  LayoutDashboard,
  Map as MapIcon,
  Truck,
  Route,
  FileText,
  BarChart3,
  Settings,
  Radar,
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  Command,
  Check,
  CircleAlert,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { agents, type Agent } from "../data/fleet";
import { type SectionId } from "../nav";

const nav: {
  id: SectionId;
  label: string;
  icon: typeof Truck;
  badge?: string;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "map", label: "Live map", icon: MapIcon, badge: "6" },
  { id: "shipments", label: "Shipments", icon: Truck },
  { id: "routes", label: "Routes", icon: Route, badge: "1" },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

export function Sidebar({
  active,
  go,
  onAgent,
}: {
  active: SectionId;
  go: (s: SectionId) => void;
  onAgent: (a: Agent) => void;
}) {
  return (
    <aside className="flex w-[212px] shrink-0 flex-col border-r border-white/[0.06] bg-ink-900">
      {/* brand — goes back to the Konseptor shelf */}
      <button
        type="button"
        onClick={() => {
          window.location.hash = "#/";
        }}
        title="Back to Konseptor shelf"
        className="flex h-[52px] items-center gap-2.5 border-b border-white/[0.06] px-4 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="relative grid h-6 w-6 place-items-center rounded-[7px] bg-signal">
          <Truck className="h-3.5 w-3.5 text-ink-950" strokeWidth={2.6} />
        </div>
        <div className="leading-none">
          <div className="text-[13px] font-semibold tracking-[-0.01em] text-mute-100">
            FleetFlow
            <span className="ml-1 text-signal">AI</span>
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-mute-400">
            Logistics CRM
          </div>
        </div>
      </button>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <div className="mb-1.5 px-2 text-[9.5px] font-semibold uppercase tracking-[0.11em] text-mute-400">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {nav.map(({ id, label, icon: Icon, badge }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[12.5px] transition-colors ${
                    isActive
                      ? "bg-white/[0.06] font-medium text-mute-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                      : "text-mute-300 hover:bg-white/[0.035] hover:text-mute-100"
                  }`}
                >
                  <Icon
                    className={`h-[15px] w-[15px] shrink-0 ${isActive ? "text-signal" : "text-mute-400 group-hover:text-mute-200"}`}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {badge && (
                    <span className="num rounded bg-ink-700 px-1 py-px text-[9.5px] font-semibold text-mute-200">
                      {badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* agents section */}
        <div className="mb-1.5 mt-5 flex items-center justify-between px-2">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-mute-400">
            Agents
          </span>
          <Sparkles className="h-3 w-3 text-signal/70" />
        </div>
        <ul className="space-y-0.5">
          {agents.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onAgent(a)}
                title={`Open ${a.name}`}
                className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[12px] text-mute-300 transition-colors hover:bg-white/[0.035] hover:text-mute-100"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: a.accent,
                    boxShadow:
                      a.status === "thinking"
                        ? `0 0 8px ${a.accent}`
                        : undefined,
                    animation:
                      a.status === "thinking"
                        ? "pulse-dot 1.6s ease-in-out infinite"
                        : undefined,
                  }}
                />
                <span className="flex-1 truncate">{a.name}</span>
                <span className="num text-[9.5px] text-mute-400">
                  {a.accuracy}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* footer */}
      <div className="border-t border-white/[0.06] p-2.5">
        <button
          type="button"
          onClick={() => go("settings")}
          aria-current={active === "settings" ? "page" : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors ${
            active === "settings"
              ? "bg-white/[0.06] font-medium text-mute-100"
              : "text-mute-300 hover:bg-white/[0.035] hover:text-mute-100"
          }`}
        >
          <Settings
            className={`h-[15px] w-[15px] ${active === "settings" ? "text-signal" : "text-mute-400"}`}
            strokeWidth={1.9}
          />
          Settings
        </button>
        <div className="mt-1 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-sky/80 to-violet/80 text-[9.5px] font-bold text-ink-950">
            DR
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[11.5px] font-medium text-mute-100">
              D. Reyes
            </div>
            <div className="truncate text-[9.5px] text-mute-400">Ops Lead</div>
          </div>
          <ChevronDown className="h-3 w-3 shrink-0 text-mute-400" />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Topbar                                                              */
/* ------------------------------------------------------------------ */

const notifs = [
  {
    Icon: CircleAlert,
    tone: "text-amber",
    title: "SF-48291 needs approval",
    detail: "Route Agent · 2 min ago",
  },
  {
    Icon: Check,
    tone: "text-signal",
    title: "SF-48284 POD cleared",
    detail: "Document Agent · 12 min ago",
  },
  {
    Icon: X,
    tone: "text-rose",
    title: "SF-48293 detour declined",
    detail: "M. Silva · 1 hr ago",
  },
];

export function Topbar({
  title,
  sub,
  query,
  onQuery,
  onSearchFocus,
}: {
  title: string;
  sub: string;
  query: string;
  onQuery: (v: string) => void;
  onSearchFocus?: () => void;
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // close the popover on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [bellOpen]);

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="relative z-[600] flex h-[52px] shrink-0 items-center gap-4 border-b border-white/[0.06] bg-ink-900/60 px-5 backdrop-blur-xl">
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-[13.5px] font-semibold tracking-[-0.01em] text-mute-100">
          {title}
        </h1>
        <span className="hidden text-[11px] text-mute-400 sm:inline">{sub}</span>
      </div>

      <div className="flex items-center gap-1.5 rounded-md bg-signal/[0.08] px-2 py-1 ring-1 ring-inset ring-signal/20">
        <Radar className="h-3 w-3 text-signal" strokeWidth={2.2} />
        <span className="text-[10.5px] font-semibold tracking-wide text-signal">
          4 agents live
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <label className="hidden items-center gap-2 rounded-lg bg-white/[0.035] px-2.5 py-[6px] ring-1 ring-inset ring-white/[0.07] focus-within:ring-white/20 lg:flex">
          <Search className="h-3.5 w-3.5 text-mute-400" strokeWidth={2} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onFocus={onSearchFocus}
            placeholder="Search shipments, drivers…"
            className="w-[190px] bg-transparent text-[11.5px] text-mute-100 placeholder:text-mute-400 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="text-mute-400 hover:text-mute-100"
            >
              <X className="h-3 w-3" strokeWidth={2.4} />
            </button>
          ) : (
            <kbd className="flex items-center gap-0.5 rounded bg-ink-700 px-1 py-px text-[9px] text-mute-300">
              <Command className="h-2 w-2" />K
            </kbd>
          )}
        </label>

        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={() => setBellOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={bellOpen}
            className={`relative grid h-7 w-7 place-items-center rounded-lg transition-colors ${
              bellOpen
                ? "bg-white/[0.06] text-mute-100 ring-1 ring-inset ring-white/15"
                : "text-mute-300 ring-1 ring-inset ring-white/[0.07] hover:bg-white/[0.05] hover:text-mute-100"
            }`}
          >
            <Bell className="h-3.5 w-3.5" strokeWidth={1.9} />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose ring-2 ring-ink-900" />
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-9 w-[286px] overflow-hidden rounded-xl border border-white/[0.09] bg-ink-850 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
                <span className="text-[11px] font-semibold text-mute-100">
                  Notifications
                </span>
                <span className="num rounded bg-rose/15 px-1.5 py-px text-[9.5px] font-semibold text-rose">
                  3 new
                </span>
              </div>
              <ul className="divide-y divide-white/[0.04]">
                {notifs.map((n) => (
                  <li key={n.title}>
                    <button
                      type="button"
                      onClick={() => setBellOpen(false)}
                      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <n.Icon
                        className={`mt-[2px] h-3.5 w-3.5 shrink-0 ${n.tone}`}
                        strokeWidth={2.2}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[11.5px] font-medium text-mute-100">
                          {n.title}
                        </span>
                        <span className="block truncate text-[10px] text-mute-400">
                          {n.detail}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Agent drawer — opens from the sidebar agent rows                    */
/* ------------------------------------------------------------------ */

export function AgentDrawer({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />
      <div className="anim-rise relative h-full w-[340px] overflow-y-auto border-l border-white/[0.08] bg-ink-850 p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: agent.accent,
                boxShadow: `0 0 10px ${agent.accent}`,
              }}
            />
            <div>
              <h2 className="text-[14px] font-semibold text-mute-100">
                {agent.name}
              </h2>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-mute-400">
                {agent.status}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close agent panel"
            className="grid h-6 w-6 place-items-center rounded-md text-mute-400 ring-1 ring-inset ring-white/10 hover:bg-white/5 hover:text-mute-100"
          >
            <X className="h-3 w-3" strokeWidth={2.4} />
          </button>
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-mute-300">
          {agent.role}
        </p>

        <div className="mt-4 space-y-2">
          <Metric label="Proposals" value={String(agent.proposals)} />
          <Metric label="Accuracy" value={`${agent.accuracy}%`} tone />
          <Metric
            label="Status"
            value={agent.status === "thinking" ? "Reasoning" : agent.status}
          />
        </div>

        <div className="mt-5 rounded-lg bg-white/[0.025] p-3 ring-1 ring-inset ring-white/[0.055]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400">
            Recent activity
          </p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-mute-300">
            <li>· Flagged SF-48291 — 47m behind on I-80</li>
            <li>· Priced reroute via I-680 N → CA-4 E</li>
            <li>· Approval requested from D. Reyes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.025] px-3 py-2 ring-1 ring-inset ring-white/[0.05]">
      <span className="text-[11px] text-mute-400">{label}</span>
      <span
        className={`num text-[12px] font-semibold ${tone ? "text-signal" : "text-mute-100"}`}
      >
        {value}
      </span>
    </div>
  );
}

