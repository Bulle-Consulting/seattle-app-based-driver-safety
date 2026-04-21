import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Incident } from "@shared/schema";

const SEV_COLORS: Record<string, string> = {
  fatal: "#000000", injury: "#4F4F4F", robbery: "#7A7A7A", assault: "#9E9E9E", policy: "#9E9E9E", other: "#9E9E9E",
};
const SEV_R: Record<string, number> = { fatal: 10, injury: 8, robbery: 7, assault: 7, other: 5, policy: 5 };

interface Props {
  incidents: Incident[];
  selectedId?: number | null;
  onSelectIncident?: (id: number) => void;
  showHeatmap?: boolean;
  height?: string;
}

export default function SeattleMap({ incidents, selectedId, onSelectIncident, showHeatmap = false, height = "420px" }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const cRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<L.CircleMarker[]>([]);
  const hRef = useRef<any>(null);

  useEffect(() => {
    if (!cRef.current || mapRef.current) return;
    const map = L.map(cRef.current, { center: [47.608, -122.335], zoom: 11, zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com">CARTO</a>', subdomains: "abcd", maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    if (!document.querySelector('script[src*="leaflet-heat"]')) {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
      document.head.appendChild(s);
    }
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !incidents.length) return;
    mRef.current.forEach(m => m.remove()); mRef.current = [];
    if (hRef.current) { hRef.current.remove(); hRef.current = null; }

    if (showHeatmap && (window as any).L?.heatLayer) {
      const pts = incidents.map(i => [i.lat, i.lng, i.severity === "fatal" ? 1 : 0.55]);
      const h = (L as any).heatLayer(pts, {
        radius: 30, blur: 20, maxZoom: 13, max: 1,
        gradient: { 0.2: "#E0E0E0", 0.4: "#000000", 0.6: "#000000", 0.8: "#4F4F4F", 1.0: "#7A7A7A" },
      });
      h.addTo(map); hRef.current = h;
    } else {
      incidents.forEach(inc => {
        const c = SEV_COLORS[inc.severity] ?? "#9E9E9E";
        const r = SEV_R[inc.severity] ?? 5;
        const sel = inc.id === selectedId;
        const m = L.circleMarker([inc.lat, inc.lng], {
          radius: sel ? r + 3 : r, fillColor: c, color: sel ? "#000000" : "#FFFFFF",
          weight: sel ? 2 : 1, opacity: 1, fillOpacity: sel ? 1 : 0.8,
        });
        const d = new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        m.bindPopup(`
          <div style="min-width:200px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.5">
            <div style="font-size:10px;font-weight:500;color:${c};margin-bottom:3px">${inc.type}</div>
            <div style="font-size:13px;font-weight:600;color:#000000;margin-bottom:4px">${inc.neighborhood}</div>
            <div style="font-size:10.5px;color:#4F4F4F;margin-bottom:8px">${inc.description.length > 100 ? inc.description.substring(0,100)+"…" : inc.description}</div>
            <div style="display:flex;gap:5px;font-size:9px">
              <span style="background:${c}20;color:${c};padding:2px 7px;border-radius:4px">${inc.severity}</span>
              <span style="background:#F2F2F2;color:#9E9E9E;padding:2px 7px;border-radius:4px">${inc.platform}</span>
              <span style="background:#F2F2F2;color:#9E9E9E;padding:2px 7px;border-radius:4px">${d}</span>
            </div>
          </div>
        `, { maxWidth: 280 });
        m.on("click", () => onSelectIncident?.(inc.id!));
        m.addTo(map); mRef.current.push(m);
      });
    }
  }, [incidents, selectedId, showHeatmap, onSelectIncident]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const inc = incidents.find(i => i.id === selectedId);
    if (inc) map.flyTo([inc.lat, inc.lng], 14, { duration: 1 });
  }, [selectedId, incidents]);

  return <div ref={cRef} style={{ height, width: "100%" }} className="map-container" data-testid="map-container" />;
}
