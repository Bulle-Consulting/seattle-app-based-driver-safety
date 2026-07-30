import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { incidents, submissions, alertSubscriptions, type Incident, type InsertIncident, type Submission, type InsertSubmission, type AlertSubscription, type InsertAlert } from "@shared/schema";
import { eq } from "drizzle-orm";
import { SEED_DATA } from "@shared/seed-data";

const sqlite = new Database("ridewatch.db");
const db = drizzle(sqlite);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'crime',
    neighborhood TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    victim TEXT,
    platform TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    status TEXT NOT NULL,
    time_of_day TEXT,
    has_video INTEGER DEFAULT 0,
    suspect_name TEXT,
    case_number TEXT,
    case_status TEXT,
    sentence_info TEXT
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_at TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    address TEXT NOT NULL,
    platform TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS alert_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    phone TEXT,
    neighborhoods TEXT,
    created_at TEXT NOT NULL
  )
`);

export interface IStorage {
  getAllIncidents(): Incident[];
  getIncidentById(id: number): Incident | undefined;
  createIncident(data: InsertIncident): Incident;
  seedIfEmpty(): void;

  // Submissions
  getAllSubmissions(): Submission[];
  createSubmission(data: InsertSubmission): Submission;
  updateSubmissionStatus(id: number, status: string): void;

  // Alerts
  createAlert(data: InsertAlert): AlertSubscription;
  getAllAlerts(): AlertSubscription[];
}

export const storage: IStorage = {
  getAllIncidents(): Incident[] {
    return db.select().from(incidents).all();
  },

  getIncidentById(id: number): Incident | undefined {
    return db.select().from(incidents).where(eq(incidents.id, id)).get();
  },

  createIncident(data: InsertIncident): Incident {
    return db.insert(incidents).values(data).returning().get();
  },

  seedIfEmpty(): void {
    const count = db.select().from(incidents).all().length;
    if (count === 0) {
      for (const incident of SEED_DATA) {
        db.insert(incidents).values(incident).run();
      }
      console.log(`Seeded ${SEED_DATA.length} incidents`);
    }
  },

  getAllSubmissions() { return db.select().from(submissions).all(); },
  createSubmission(data) { return db.insert(submissions).values(data).returning().get(); },
  updateSubmissionStatus(id, status) { db.update(submissions).set({ status }).where(eq(submissions.id, id)).run(); },
  createAlert(data) { return db.insert(alertSubscriptions).values(data).returning().get(); },
  getAllAlerts() { return db.select().from(alertSubscriptions).all(); },
};
