import { type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Panel — the one card surface every region reuses                    */
/* ------------------------------------------------------------------ */

export function Panel({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`panel relative ${padded ? "p-4 sm:p-5" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHead({
  title,
  sub,
  right,
  icon,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        {icon && (
          <span className="mt-0.5 text-mute-400 [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-mute-100">
            {title}
          </h2>
          {sub && (
            <p className="mt-0.5 text-[11px] leading-snug text-mute-400">
              {sub}
            </p>
          )}
        </div>
      </div>
      {right}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

const badgeTone = {
  signal: "bg-signal/12 text-signal ring-signal/25",
  amber: "bg-amber/12 text-amber ring-amber/25",
  rose: "bg-rose/12 text-rose ring-rose/25",
  sky: "bg-sky/12 text-sky ring-sky/25",
  violet: "bg-violet/12 text-violet ring-violet/25",
  ghost: "bg-white/[0.04] text-mute-300 ring-white/10",
} as const;

export type Tone = keyof typeof badgeTone;

export function Badge({
  tone = "ghost",
  children,
  dot = false,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide ring-1 ring-inset ${badgeTone[tone]} ${className}`}
    >
      {dot && (
        <span className="h-1 w-1 rounded-full bg-current opacity-90" />
      )}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline — hand-rolled SVG, no chart dependency                    */
/* ------------------------------------------------------------------ */

export function Sparkline({
  data,
  color = "var(--color-signal)",
  width = 92,
  height = 28,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = height - 2 - ((v - min) / span) * (height - 6);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const id = `sp-${data.join("").slice(0, 8)}`;
  const last = pts[pts.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="1.9" fill={color} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Stat — label / big number / delta, used in the KPI strip            */
/* ------------------------------------------------------------------ */

export function Stat({
  label,
  value,
  unit,
  delta,
  deltaTone = "good",
  sub,
  spark,
  sparkColor,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "good" | "bad";
  sub?: string;
  spark?: number[];
  sparkColor?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 p-4 sm:p-[18px]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-mute-400">
          {label}
        </span>
        {delta && (
          <span
            className={`num rounded px-1 py-px text-[10px] font-semibold ${
              deltaTone === "good"
                ? "bg-signal/10 text-signal"
                : "bg-rose/10 text-rose"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="num flex items-baseline gap-0.5">
            <span className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-mute-100">
              {value}
            </span>
            {unit && (
              <span className="text-[13px] font-medium text-mute-400">
                {unit}
              </span>
            )}
          </div>
          {sub && (
            <p className="mt-1.5 text-[10.5px] leading-tight text-mute-400">
              {sub}
            </p>
          )}
        </div>
        {spark && <Sparkline data={spark} color={sparkColor} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KeyValue row                                                        */
/* ------------------------------------------------------------------ */

export function KV({
  k,
  v,
  tone,
  mono = false,
}: {
  k: string;
  v: ReactNode;
  tone?: "good" | "warn" | "bad";
  mono?: boolean;
}) {
  const toneCls =
    tone === "good"
      ? "text-signal"
      : tone === "warn"
        ? "text-amber"
        : tone === "bad"
          ? "text-rose"
          : "text-mute-100";
  return (
    <div className="flex items-baseline justify-between gap-4 py-[7px]">
      <span className="text-[11.5px] text-mute-400">{k}</span>
      <span
        className={`text-right text-[11.5px] font-medium ${toneCls} ${mono ? "num font-mono" : ""}`}
      >
        {v}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

export function Button({
  children,
  variant = "primary",
  onClick,
  icon,
  className = "",
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none";
  const styles = {
    primary:
      "bg-signal text-ink-950 hover:brightness-110 active:scale-[0.985] sig-glow",
    ghost:
      "text-mute-200 ring-1 ring-inset ring-white/10 hover:bg-white/[0.05] hover:text-mute-100 active:scale-[0.985]",
    danger:
      "text-rose ring-1 ring-inset ring-rose/25 hover:bg-rose/10 active:scale-[0.985]",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
      {children}
    </button>
  );
}
