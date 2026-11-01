import type { Status } from "./fleet";

/* ------------------------------------------------------------------ */
/* Shipments — fuller rows for the Shipments page                      */
/* ------------------------------------------------------------------ */

export interface ShipmentRow {
  id: string;
  lane: string;
  carrier: string;
  driver: string;
  status: Status;
  eta: string;
  window: string;
  delta: string;
  miles: number;
  load: string;
  hero?: boolean;
}

export const shipments: ShipmentRow[] = [
  {
    id: "SF-48291",
    lane: "OAK → SAC",
    carrier: "Bayline Freight",
    driver: "M. Okonkwo",
    status: "late",
    eta: "3:18 PM",
    window: "3:00 – 3:30 PM",
    delta: "+47m",
    miles: 92.4,
    load: "Retail replenishment · 22 pallets",
    hero: true,
  },
  {
    id: "SF-48288",
    lane: "SFO → SJC",
    carrier: "Peninsula Haul",
    driver: "L. Tran",
    status: "on_time",
    eta: "2:44 PM",
    window: "2:30 – 3:00 PM",
    delta: "0m",
    miles: 41.2,
    load: "Electronics · 14 pallets",
  },
  {
    id: "SF-48290",
    lane: "FRE → RNO",
    carrier: "Sierra Line",
    driver: "J. Alvarez",
    status: "at_risk",
    eta: "4:02 PM",
    window: "3:45 – 4:15 PM",
    delta: "+9m",
    miles: 218.6,
    load: "Building materials · 26 pallets",
  },
  {
    id: "SF-48293",
    lane: "SAC → LAX",
    carrier: "Valley Freight",
    driver: "R. Singh",
    status: "on_time",
    eta: "8:10 PM",
    window: "8:00 – 8:45 PM",
    delta: "−3m",
    miles: 384.1,
    load: "Packaged food · 24 pallets",
  },
  {
    id: "SF-48295",
    lane: "MOD → SAC",
    carrier: "Central Coast",
    driver: "K. Boatemaa",
    status: "on_time",
    eta: "3:37 PM",
    window: "3:30 – 4:00 PM",
    delta: "0m",
    miles: 76.9,
    load: "Dry goods · 18 pallets",
  },
  {
    id: "SF-48284",
    lane: "SCK → OAK",
    carrier: "Bayline Freight",
    driver: "T. Ferreira",
    status: "delivered",
    eta: "1:12 PM",
    window: "1:00 – 1:30 PM",
    delta: "on time",
    miles: 81.3,
    load: "Retail returns · 9 pallets",
  },
];

/* ------------------------------------------------------------------ */
/* Routes                                                             */
/* ------------------------------------------------------------------ */

export interface RouteRow {
  name: string;
  status: "active" | "proposed" | "idle";
  loads: number;
  avgDelay: string;
  miles: number;
  note: string;
}

export const routes: RouteRow[] = [
  {
    name: "I-680 N → CA-4 E",
    status: "proposed",
    loads: 1,
    avgDelay: "−35m",
    miles: 96.6,
    note: "Route Agent proposal for SF-48291 · awaiting approval",
  },
  {
    name: "I-80 EB",
    status: "active",
    loads: 3,
    avgDelay: "+47m",
    miles: 92.4,
    note: "Congestion at Emeryville curve · chain advisory active",
  },
  {
    name: "CA-99 N",
    status: "active",
    loads: 2,
    avgDelay: "+9m",
    miles: 218.6,
    note: "SF-48290 nominal, Watch Agent monitoring",
  },
  {
    name: "US-101 S",
    status: "idle",
    loads: 0,
    avgDelay: "—",
    miles: 384.1,
    note: "No assigned loads this shift",
  },
];

/* ------------------------------------------------------------------ */
/* Documents                                                          */
/* ------------------------------------------------------------------ */

export interface DocRow {
  id: string;
  type: "BOL" | "POD" | "Invoice";
  shipment: string;
  status: "verified" | "variance" | "pending";
  updated: string;
  owner: string;
}

export const documents: DocRow[] = [
  { id: "DOC-8841", type: "BOL", shipment: "SF-48291", status: "verified", updated: "2:12 PM", owner: "M. Okonkwo" },
  { id: "DOC-8840", type: "POD", shipment: "SF-48284", status: "verified", updated: "1:31 PM", owner: "Document Agent" },
  { id: "DOC-8839", type: "Invoice", shipment: "SF-48284", status: "verified", updated: "1:32 PM", owner: "Billing" },
  { id: "DOC-8838", type: "POD", shipment: "SF-48288", status: "pending", updated: "12:58 PM", owner: "L. Tran" },
  { id: "DOC-8837", type: "BOL", shipment: "SF-48293", status: "variance", updated: "11:44 AM", owner: "R. Singh" },
  { id: "DOC-8836", type: "Invoice", shipment: "SF-48290", status: "pending", updated: "10:20 AM", owner: "Billing" },
];

/* ------------------------------------------------------------------ */
/* Analytics                                                          */
/* ------------------------------------------------------------------ */

export const analytics = {
  weekly: [
    { day: "Mon", onTime: 94, decisions: 18 },
    { day: "Tue", onTime: 96, decisions: 22 },
    { day: "Wed", onTime: 93, decisions: 16 },
    { day: "Thu", onTime: 97, decisions: 25 },
    { day: "Fri", onTime: 95, decisions: 21 },
    { day: "Sat", onTime: 98, decisions: 12 },
    { day: "Sun", onTime: 96, decisions: 14 },
  ],
  byAgent: [
    { name: "Route Agent", decisions: 34, accuracy: 97.1, color: "var(--color-signal)" },
    { name: "Dispatch Agent", decisions: 28, accuracy: 94.6, color: "var(--color-sky)" },
    { name: "Document Agent", decisions: 51, accuracy: 99.2, color: "var(--color-violet)" },
    { name: "Watch Agent", decisions: 15, accuracy: 91.8, color: "var(--color-amber)" },
  ],
  delayCauses: [
    { cause: "Traffic", pct: 46 },
    { cause: "Facility queue", pct: 22 },
    { cause: "Weather", pct: 14 },
    { cause: "Driver hours", pct: 11 },
    { cause: "Other", pct: 7 },
  ],
};

/* ------------------------------------------------------------------ */
/* Settings                                                           */
/* ------------------------------------------------------------------ */

export const settingsGroups = [
  {
    title: "Autonomy",
    items: [
      { label: "Auto-approve reroutes under", value: "$0.00", note: "Human approval required above this" },
      { label: "Auto-approve holds", value: "Policy FLEET-HOLD-3", note: "Watch Agent chain advisories" },
      { label: "Document variance auto-clear", value: "Enabled", note: "ID-hash match required" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { label: "Approval requests", value: "Push + email", note: "Within authority limits" },
      { label: "Window breach risk", value: "Push", note: "T-30 min threshold" },
      { label: "Daily digest", value: "7:00 AM", note: "Ops lead + dispatch" },
    ],
  },
  {
    title: "Data",
    items: [
      { label: "Decision log retention", value: "24 months", note: "Immutable, exportable" },
      { label: "Telematics source", value: "Samsara", note: "5 min poll interval" },
      { label: "Map provider", value: "OpenStreetMap", note: "Tile cache, no paid key" },
    ],
  },
];
