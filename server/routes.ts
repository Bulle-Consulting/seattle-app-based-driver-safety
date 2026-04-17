import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export function registerRoutes(httpServer: Server, app: Express): Server {
  storage.seedIfEmpty();

  app.get("/api/incidents", (_req, res) => {
    res.json(storage.getAllIncidents());
  });

  app.get("/api/incidents/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const incident = storage.getIncidentById(id);
    if (!incident) return res.status(404).json({ error: "Not found" });
    res.json(incident);
  });

  app.get("/api/stats", (_req, res) => {
    const all = storage.getAllIncidents();
    const total = all.length;

    // Crime incidents only — exclude policy_regulatory and legal_sentencing from severity KPIs
    const crimeOnly = all.filter(i => i.category === "crime");
    const fatal   = crimeOnly.filter(i => i.severity === "fatal").length;
    const injury  = crimeOnly.filter(i => i.severity === "injury").length;
    const robbery = crimeOnly.filter(i => i.severity === "robbery").length;
    const assault = crimeOnly.filter(i => i.severity === "assault").length;
    const policyCount = all.filter(i => i.category === "policy_regulatory").length;
    const legalCount = all.filter(i => i.category === "legal_sentencing").length;

    const resolved = all.filter(i => i.status === "resolved").length;
    const underInvestigation = all.filter(i => i.status === "under investigation").length;

    const byPlatform: Record<string, number> = {};
    for (const i of crimeOnly) byPlatform[i.platform] = (byPlatform[i.platform] || 0) + 1;

    const byNeighborhood: Record<string, number> = {};
    for (const i of crimeOnly) byNeighborhood[i.neighborhood] = (byNeighborhood[i.neighborhood] || 0) + 1;

    const byMonth: Record<string, number> = {};
    for (const i of crimeOnly) {
      const month = i.date.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    }

    res.json({
      total, fatal, injury, robbery, assault, policyCount, legalCount,
      crimeTotal: crimeOnly.length,
      resolved, underInvestigation,
      byPlatform, byNeighborhood, byMonth,
      lastVerified: "2026-04-17",
    });
  });

  // SPD Blotter RSS proxy
  app.get("/api/spd-blotter", async (_req, res) => {
    try {
      const response = await fetch("https://spdblotter.seattle.gov/feed/");
      if (!response.ok) throw new Error(`SPD Blotter returned ${response.status}`);
      const xml = await response.text();
      // Parse basic RSS items
      const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
        const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
        const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
        const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? block.match(/<description>(.*?)<\/description>/)?.[1] ?? "";
        items.push({ title, link, pubDate, description: desc.substring(0, 300) });
      }
      res.json({ items: items.slice(0, 10), fetchedAt: new Date().toISOString() });
    } catch (err: any) {
      res.json({ items: [], fetchedAt: new Date().toISOString(), error: err.message });
    }
  });

  return httpServer;
}
