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

    const crimeOnly = all.filter(i => i.category === "crime");
    const fatal   = crimeOnly.filter(i => i.severity === "fatal").length;
    const injury  = crimeOnly.filter(i => i.severity === "injury").length;
    const robbery = crimeOnly.filter(i => i.severity === "robbery").length;
    const assault = crimeOnly.filter(i => i.severity === "assault").length;
    const policyCount = all.filter(i => i.category === "policy_regulatory").length;
    const legalCount = all.filter(i => i.category === "legal_sentencing").length;

    const resolved = all.filter(i => i.status === "resolved").length;
    const underInvestigation = all.filter(i => i.status === "under investigation").length;

    // Video evidence count
    const withVideo = all.filter(i => i.hasVideo === 1).length;

    // Cases with named suspects
    const withSuspect = all.filter(i => i.suspectName).length;

    const byPlatform: Record<string, number> = {};
    for (const i of crimeOnly) byPlatform[i.platform] = (byPlatform[i.platform] || 0) + 1;

    const byNeighborhood: Record<string, number> = {};
    for (const i of crimeOnly) byNeighborhood[i.neighborhood] = (byNeighborhood[i.neighborhood] || 0) + 1;

    const byMonth: Record<string, number> = {};
    for (const i of crimeOnly) {
      const month = i.date.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    }

    // Time of day distribution (24 hours)
    const byHour: Record<number, number> = {};
    for (let h = 0; h < 24; h++) byHour[h] = 0;
    for (const i of crimeOnly) {
      if (i.timeOfDay) {
        const hour = parseInt(i.timeOfDay.split(":")[0]);
        if (!isNaN(hour)) byHour[hour]++;
      }
    }

    // Repeat locations (neighborhoods with 2+ incidents)
    const repeatLocations = Object.entries(byNeighborhood)
      .filter(([, v]) => v >= 2)
      .sort(([, a], [, b]) => b - a);

    // Quarterly trend for forecasting
    const byQuarter: Record<string, number> = {};
    for (const i of crimeOnly) {
      const y = i.date.substring(0, 4);
      const m = parseInt(i.date.substring(5, 7));
      const q = Math.ceil(m / 3);
      const key = `${y} Q${q}`;
      byQuarter[key] = (byQuarter[key] || 0) + 1;
    }

    // Case status breakdown
    const caseStatuses: Record<string, number> = {};
    for (const i of all) {
      if (i.caseStatus) {
        caseStatuses[i.caseStatus] = (caseStatuses[i.caseStatus] || 0) + 1;
      }
    }

    res.json({
      total, fatal, injury, robbery, assault, policyCount, legalCount,
      crimeTotal: crimeOnly.length,
      resolved, underInvestigation,
      withVideo, withSuspect,
      byPlatform, byNeighborhood, byMonth, byHour,
      repeatLocations, byQuarter, caseStatuses,
      lastVerified: "2026-04-17",
    });
  });

  // Submissions
  app.get("/api/submissions", (_req, res) => {
    res.json(storage.getAllSubmissions());
  });

  app.post("/api/submissions", (req, res) => {
    try {
      const data = {
        ...req.body,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };
      const submission = storage.createSubmission(data);
      res.status(201).json(submission);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Alert subscriptions
  app.post("/api/alerts", (req, res) => {
    try {
      const data = {
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      const alert = storage.createAlert(data);
      res.status(201).json(alert);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // SPD Blotter RSS proxy
  app.get("/api/spd-blotter", async (_req, res) => {
    try {
      const response = await fetch("https://spdblotter.seattle.gov/feed/");
      if (!response.ok) throw new Error(`SPD Blotter returned ${response.status}`);
      const xml = await response.text();
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
