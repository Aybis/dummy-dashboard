import { useEffect, useRef } from "react";
import L from "leaflet";
import { geo } from "../data/fleet";

const depotIcon = (color: string, label: string) =>
  L.divIcon({
    className: "ff-dot",
    html: `<span style="
      width:14px;height:14px;background:${color};
      box-shadow:0 0 0 3px rgba(8,9,11,.9), 0 0 14px ${color}88;
      display:flex;align-items:center;justify-content:center;"></span>
      <span style="position:absolute;left:19px;top:-2px;white-space:nowrap;
        font:600 9px/1.4 Inter,sans-serif;letter-spacing:.09em;text-transform:uppercase;
        color:${color};text-shadow:0 0 8px rgba(0,0,0,.95)">${label}</span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const truckIcon = L.divIcon({
  className: "ff-dot",
  html: `
    <span style="position:absolute;inset:0;border-radius:99px;
      border:1.5px solid #f5b544;animation:ring 2.4s ease-out infinite"></span>
    <span style="position:absolute;inset:0;border-radius:99px;
      border:1.5px solid #f5b544;animation:ring 2.4s ease-out infinite .8s"></span>
    <span style="width:11px;height:11px;background:#f5b544;position:absolute;left:3.5px;top:3.5px;
      box-shadow:0 0 0 2.5px rgba(8,9,11,.95), 0 0 16px #f5b544"></span>
    <span style="position:absolute;left:14px;top:-9px;white-space:nowrap;
      background:rgba(11,13,16,.92);border:1px solid rgba(245,181,68,.35);
      border-radius:5px;padding:1px 5px;
      font:700 9px/1.5 Inter,sans-serif;letter-spacing:.05em;color:#f5b544">
      SF-48291 · +47m</span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function RouteMap() {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!holder.current || mapRef.current) return;

    const map = L.map(holder.current, {
      center: [38.03, -122.1],
      zoom: 9,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Original plan — I-80 EB, the congested lane (rose, dashed, dimmed)
    L.polyline(geo.original, {
      color: "#f2566b",
      weight: 2.5,
      opacity: 0.55,
      dashArray: "6 7",
      lineCap: "round",
    })
      .addTo(map)
      .bindTooltip("I-80 EB · original plan · +47m", {
        sticky: true,
        className: "ff-tip",
      });

    // Proposed — I-680 N (signal, solid, glowing)
    L.polyline(geo.proposed, {
      color: "#c6f24e",
      weight: 3.2,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    // animated overlay dash travelling along the proposed path
    const dash = L.polyline(geo.proposed, {
      color: "#eaffb0",
      weight: 1.4,
      opacity: 0.85,
      dashArray: "2 24",
      lineCap: "round",
    }).addTo(map);
    const el = dash.getElement() as SVGPathElement | null;
    if (el) el.style.animation = "dashmove 3.2s linear infinite";

    L.marker(geo.oakland, { icon: depotIcon("#8a92a3", "Oakland · origin") }).addTo(map);
    L.marker(geo.sacramento, {
      icon: depotIcon("#c6f24e", "Sacramento · 3:18 PM"),
    }).addTo(map);
    L.marker(geo.truck, { icon: truckIcon, zIndexOffset: 900 }).addTo(map);

    // fit the whole corridor with breathing room
    const bounds = L.latLngBounds([...geo.original, ...geo.proposed] as L.LatLngTuple[]);
    map.fitBounds(bounds, { padding: [42, 42] });

    // small "congestion" halo at Emeryville
    L.circle(geo.emeryville, {
      radius: 3200,
      color: "#f2566b",
      weight: 1,
      opacity: 0.4,
      fillColor: "#f2566b",
      fillOpacity: 0.07,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={holder} className="h-full w-full" />;
}
