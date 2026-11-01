/**
 * FleetFlow AI — demo dataset.
 * Hardcoded to the product scenario: SF-48291 running 47 min late on I-80,
 * rerouted to I-680, arriving 3:18 PM inside the customer window, +4.2 mi.
 */

export type AgentId = "route" | "dispatch" | "document" | "watch";
export type Status = "on_time" | "at_risk" | "late" | "delivered";

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  status: "thinking" | "idle" | "waiting";
  proposals: number;
  accuracy: number;
  accent: string;
}

export interface Decision {
  id: string;
  at: string;
  agent: AgentId;
  shipment: string;
  action: string;
  rationale: string;
  approvedBy: string;
  impact: string;
  status: "approved" | "declined" | "auto";
}

export interface TimelineEvent {
  t: string;
  title: string;
  detail: string;
  tone: "neutral" | "warn" | "good" | "agent";
}

/* ------------------------------------------------------------------ */
/* The hero shipment — exact numbers from the reel                      */
/* ------------------------------------------------------------------ */

export const hero = {
  id: "SF-48291",
  carrier: "Bayline Freight",
  driver: "M. Okonkwo",
  trailer: "53' Dry Van · TRL-7781",
  load: "Retail replenishment — 22 pallets",
  origin: "Oakland, CA",
  destination: "Sacramento, CA",
  customer: "Northgate Retail DC",
  window: "3:00 – 3:30 PM",
  originalEta: "2:31 PM",
  currentEta: "3:18 PM",
  lateBy: 47,
  delayCause: "I-80 EB congestion near Emeryville curve",
  extraMiles: 4.2,
  extraMinutes: 12,
  confidence: 0.94,
  originalRoute: "I-80 EB",
  proposedRoute: "I-680 N → CA-4 E",
  savedMinutes: 35,
} as const;

/* ------------------------------------------------------------------ */
/* Fleet strip — context so the hero isn't floating in a vacuum        */
/* ------------------------------------------------------------------ */

export interface Shipment {
  id: string;
  lane: string;
  status: Status;
  eta: string;
  delta: string;
  hero?: boolean;
}

export const fleet: Shipment[] = [
  {
    id: "SF-48291",
    lane: "OAK → SAC",
    status: "late",
    eta: "3:18 PM",
    delta: "+47m",
    hero: true,
  },
  { id: "SF-48288", lane: "SFO → SJC", status: "on_time", eta: "2:44 PM", delta: "0m" },
  { id: "SF-48290", lane: "FRE → RNO", status: "at_risk", eta: "4:02 PM", delta: "+9m" },
  { id: "SF-48293", lane: "SAC → LAX", status: "on_time", eta: "8:10 PM", delta: "−3m" },
  { id: "SF-48295", lane: "MOD → SAC", status: "on_time", eta: "3:37 PM", delta: "0m" },
  { id: "SF-48284", lane: "SCK → OAK", status: "delivered", eta: "1:12 PM", delta: "on time" },
];

/* ------------------------------------------------------------------ */
/* KPI strip                                                           */
/* ------------------------------------------------------------------ */

export const kpis = [
  {
    label: "On-time delivery",
    value: "96.4",
    unit: "%",
    delta: "+1.8",
    deltaTone: "good" as const,
    sub: "trailing 7 days · 412 loads",
    spark: [88, 90, 89, 92, 91, 94, 93, 95, 94, 96, 95, 96],
  },
  {
    label: "Agent decisions",
    value: "128",
    unit: "",
    delta: "+23",
    deltaTone: "good" as const,
    sub: "41 auto · 87 human-approved",
    spark: [40, 52, 48, 61, 74, 70, 88, 96, 104, 112, 121, 128],
  },
  {
    label: "Avg approval latency",
    value: "38",
    unit: "s",
    delta: "−12s",
    deltaTone: "good" as const,
    sub: "from flag to decision",
    spark: [92, 88, 84, 79, 71, 66, 60, 55, 49, 44, 41, 38],
  },
  {
    label: "Detention cost saved",
    value: "18.4",
    unit: "k",
    delta: "+2.1k",
    deltaTone: "good" as const,
    sub: "month to date, USD",
    spark: [4, 6, 5, 8, 9, 11, 10, 13, 15, 16, 17, 18.4],
  },
];

/* ------------------------------------------------------------------ */
/* Agents                                                              */
/* ------------------------------------------------------------------ */

export const agents: Agent[] = [
  {
    id: "route",
    name: "Route Agent",
    role: "Detects deviation, prices the alternative",
    status: "waiting",
    proposals: 34,
    accuracy: 97.1,
    accent: "var(--color-signal)",
  },
  {
    id: "dispatch",
    name: "Dispatch Agent",
    role: "Matches loads to capacity, protects windows",
    status: "thinking",
    proposals: 28,
    accuracy: 94.6,
    accent: "var(--color-sky)",
  },
  {
    id: "document",
    name: "Document Agent",
    role: "BOL, POD, invoice reconciliation",
    status: "idle",
    proposals: 51,
    accuracy: 99.2,
    accent: "var(--color-violet)",
  },
  {
    id: "watch",
    name: "Watch Agent",
    role: "Weather, traffic, facility closures",
    status: "thinking",
    proposals: 15,
    accuracy: 91.8,
    accent: "var(--color-amber)",
  },
];

/* ------------------------------------------------------------------ */
/* Decision log seed                                                   */
/* ------------------------------------------------------------------ */

export const decisions: Decision[] = [
  {
    id: "DEC-1044",
    at: "2:40 PM",
    agent: "route",
    shipment: "SF-48291",
    action: "Reroute I-80 → I-680",
    rationale:
      "I-80 EB backlog at Emeryville curve projects +47m. I-680 N path recovers 35m within customer window for +4.2 mi fuel exposure.",
    approvedBy: "D. Reyes · Ops Lead",
    impact: "Window protected · +$18.40 fuel, −$220 detention",
    status: "approved",
  },
  {
    id: "DEC-1043",
    at: "1:58 PM",
    agent: "watch",
    shipment: "SF-48290",
    action: "Hold dispatch 20 min",
    rationale: "Chain control advisory on CA-99 N, 11 mi ahead of unit.",
    approvedBy: "auto · policy FLEET-HOLD-3",
    impact: "9m added, no window breach",
    status: "auto",
  },
  {
    id: "DEC-1042",
    at: "1:31 PM",
    agent: "dispatch",
    shipment: "SF-48295",
    action: "Reassign trailer TRL-7712 → TRL-7790",
    rationale: "Door 14 blocked by inbound; swap avoids 25m yard queue.",
    approvedBy: "A. Nakamura · Dispatch",
    impact: "0m added to ETA",
    status: "approved",
  },
  {
    id: "DEC-1041",
    at: "12:47 PM",
    agent: "document",
    shipment: "SF-48284",
    action: "Auto-clear POD variance",
    rationale: "Signature mismatch resolved against driver ID hash.",
    approvedBy: "auto · policy DOC-POD-1",
    impact: "Invoice released same day",
    status: "auto",
  },
  {
    id: "DEC-1040",
    at: "11:22 AM",
    agent: "route",
    shipment: "SF-48293",
    action: "Proposed CA-152 detour",
    rationale: "Projected 6m saving on Pacheco Pass.",
    approvedBy: "M. Silva · Ops Lead",
    impact: "Declined — driver hours of service risk",
    status: "declined",
  },
];

/* ------------------------------------------------------------------ */
/* Live activity feed                                                  */
/* ------------------------------------------------------------------ */

export const timeline: TimelineEvent[] = [
  {
    t: "2:40 PM",
    title: "Route Agent flagged SF-48291",
    detail: "47 min behind on I-80 EB, customer window at 3:00 PM.",
    tone: "warn",
  },
  {
    t: "2:40 PM",
    title: "Alternative priced",
    detail: "I-680 N → CA-4 E · 4.2 mi added · arrives 3:18 PM.",
    tone: "agent",
  },
  {
    t: "2:41 PM",
    title: "Approval requested",
    detail: "Routed to D. Reyes — within $25 fuel authority.",
    tone: "neutral",
  },
  {
    t: "2:41 PM",
    title: "Approved",
    detail: "D. Reyes · Ops Lead. Decision logged with rationale.",
    tone: "good",
  },
];

/* ------------------------------------------------------------------ */
/* Geo — route geometry for the map                                    */
/* ------------------------------------------------------------------ */

export type LngLat = [number, number];

export const geo = {
  oakland: [-122.2712, 37.8044] as LngLat,
  sacramento: [-121.4944, 38.5816] as LngLat,
  berkeley: [-122.2727, 37.8716] as LngLat,
  emeryville: [-122.2852, 37.8313] as LngLat,
  richmond: [-122.3477, 37.9358] as LngLat,
  vallejo: [-122.2566, 38.1041] as LngLat,
  fairfield: [-122.0399, 38.2494] as LngLat,
  davis: [-121.7405, 38.5449] as LngLat,
  walnutCreek: [-122.0596, 37.9063] as LngLat,
  concord: [-122.0311, 37.9780] as LngLat,
  pittsburg: [-121.8847, 38.0280] as LngLat,
  antioch: [-121.8058, 38.0049] as LngLat,

  /** Original plan — I-80 East, the congested one */
  original: [
    [-122.2712, 37.8044],
    [-122.2852, 37.8313],
    [-122.2727, 37.8716],
    [-122.3477, 37.9358],
    [-122.2566, 38.1041],
    [-122.0399, 38.2494],
    [-121.7405, 38.5449],
    [-121.4944, 38.5816],
  ] as LngLat[],

  /** Proposed — I-680 N → CA-4 E */
  proposed: [
    [-122.2712, 37.8044],
    [-122.0596, 37.9063],
    [-122.0311, 37.9780],
    [-121.8847, 38.0280],
    [-121.8058, 38.0049],
    [-121.7405, 38.5449],
    [-121.4944, 38.5816],
  ] as LngLat[],

  /** Current position of SF-48291 — stuck on I-80 near Emeryville */
  truck: [-122.2900, 37.8480] as LngLat,
};
