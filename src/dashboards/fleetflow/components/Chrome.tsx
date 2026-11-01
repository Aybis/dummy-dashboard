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
} from "lucide-react";
import { agents } from "../data/fleet";

const nav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Live map", icon: MapIcon, badge: "6" },
  { label: "Shipments", icon: Truck },
  { label: "Routes", icon: Route, badge: "1" },
  { label: "Documents", icon: FileText },
  { label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="flex w-[212px] shrink-0 flex-col border-r border-white/[0.06] bg-ink-900">
      {/* brand */}
      <div className="flex h-[52px] items-center gap-2.5 border-b border-white/[0.06] px-4">
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
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <div className="mb-1.5 px-2 text-[9.5px] font-semibold uppercase tracking-[0.11em] text-mute-400">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {nav.map(({ label, icon: Icon, active, badge }) => (
            <li key={label}>
              <button
                type="button"
                className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[12.5px] transition-colors ${
                  active
                    ? "bg-white/[0.06] font-medium text-mute-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                    : "text-mute-300 hover:bg-white/[0.035] hover:text-mute-100"
                }`}
              >
                <Icon
                  className={`h-[15px] w-[15px] shrink-0 ${active ? "text-signal" : "text-mute-400 group-hover:text-mute-200"}`}
                  strokeWidth={active ? 2.3 : 1.9}
                />
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                  <span className="num rounded bg-ink-700 px-1 py-px text-[9.5px] font-semibold text-mute-200">
                    {badge}
                  </span>
                )}
              </button>
            </li>
          ))}
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
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] text-mute-300 transition-colors hover:bg-white/[0.035] hover:text-mute-100"
        >
          <Settings className="h-[15px] w-[15px] text-mute-400" strokeWidth={1.9} />
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

export function Topbar() {
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-4 border-b border-white/[0.06] bg-ink-900/60 px-5 backdrop-blur-xl">
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-[13.5px] font-semibold tracking-[-0.01em] text-mute-100">
          Overview
        </h1>
        <span className="text-[11px] text-mute-400">
          West Coast corridor · Nov 1
        </span>
      </div>

      {/* live agent indicator */}
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
            placeholder="Search shipments, drivers…"
            className="w-[190px] bg-transparent text-[11.5px] text-mute-100 placeholder:text-mute-400 focus:outline-none"
          />
          <kbd className="flex items-center gap-0.5 rounded bg-ink-700 px-1 py-px text-[9px] text-mute-300">
            <Command className="h-2 w-2" />K
          </kbd>
        </label>

        <button
          type="button"
          className="relative grid h-7 w-7 place-items-center rounded-lg text-mute-300 ring-1 ring-inset ring-white/[0.07] transition-colors hover:bg-white/[0.05] hover:text-mute-100"
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5" strokeWidth={1.9} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose ring-2 ring-ink-900" />
        </button>
      </div>
    </header>
  );
}
