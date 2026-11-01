import { LayoutGrid, ArrowUpRight, Sparkles } from "lucide-react";
import { dashboards } from "./dashboards/registry";

/**
 * Konseptor gallery — the landing page of the collection.
 * Deliberately neutral chrome (no dashboard-specific tokens) so any
 * dashboard can sit behind it without visual ownership conflicts.
 */
export function Gallery() {
  return (
    <div className="min-h-screen bg-ink-950">
      {/* dot grid backdrop */}
      <div className="pointer-events-none fixed inset-0 grid-fade" />

      <div className="relative mx-auto max-w-[1200px] px-6 py-14 sm:px-10">
        {/* header */}
        <header className="mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-inset ring-white/[0.08]">
            <Sparkles className="h-3 w-3 text-signal" strokeWidth={2.4} />
            <span className="text-[11px] font-medium tracking-wide text-mute-200">
              Konseptor · design references
            </span>
          </div>

          <h1 className="max-w-[620px] text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-mute-100 sm:text-[42px]">
            A shelf of dashboards,
            <br />
            each one a working idea.
          </h1>
          <p className="mt-4 max-w-[520px] text-[13.5px] leading-relaxed text-mute-400">
            Not mockups. Every entry runs — real maps, real state, real
            interactions. Built to be read, picked apart, and reused.
          </p>

          <div className="mt-6 flex items-center gap-5 text-[11px] text-mute-400">
            <span className="num flex items-center gap-1.5">
              <LayoutGrid className="h-3 w-3" strokeWidth={2.2} />
              {dashboards.length}{" "}
              {dashboards.length === 1 ? "dashboard" : "dashboards"}
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="num">React · Vite · Tailwind · TypeScript</span>
          </div>
        </header>

        {/* cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {dashboards.map((d) => (
            <a
              key={d.id}
              href={`#/d/${d.id}`}
              className="group panel relative overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12]"
            >
              {/* accent wash */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${d.accent}, transparent)`,
                }}
              />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.14]"
                style={{ background: d.accent }}
              />

              <div className="relative p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: d.accent,
                          boxShadow: `0 0 8px ${d.accent}`,
                        }}
                      />
                      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-mute-100">
                        {d.name}
                      </h2>
                    </div>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.1em] text-mute-400">
                      {d.category}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-mute-400 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-mute-100"
                    strokeWidth={2.2}
                  />
                </div>

                <p className="mt-3 text-[12.5px] leading-relaxed text-mute-300">
                  {d.tagline}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {d.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-mute-300 ring-1 ring-inset ring-white/[0.06]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
                  <span className="num text-[10px] text-mute-400">
                    /d/{d.id}
                  </span>
                  <span className="truncate pl-3 text-[10px] text-mute-400">
                    {d.source}
                  </span>
                </div>
              </div>
            </a>
          ))}

          {/* empty slot — the shelf is meant to grow */}
          <div className="flex min-h-[196px] flex-col items-center justify-center rounded-[14px] border border-dashed border-white/[0.09] p-6 text-center">
            <p className="text-[12.5px] font-medium text-mute-300">
              Next slot
            </p>
            <p className="num mt-1 text-[10.5px] leading-relaxed text-mute-400">
              src/dashboards/&lt;id&gt;/ + register in registry.ts
            </p>
          </div>
        </div>

        <footer className="mt-14 flex items-center justify-between border-t border-white/[0.06] pt-5">
          <span className="text-[10.5px] text-mute-400">
            Konseptor · dummy dashboard collection
          </span>
          <span className="num text-[10.5px] text-mute-400">
            Aybis/dummy-dashboard
          </span>
        </footer>
      </div>
    </div>
  );
}
