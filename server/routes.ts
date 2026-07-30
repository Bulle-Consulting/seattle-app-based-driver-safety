import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { computeStats } from "@shared/stats";

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
    res.json(computeStats(storage.getAllIncidents()));
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
  app.get("/api/alerts", (_req, res) => {
    res.json(storage.getAllAlerts());
  });

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
