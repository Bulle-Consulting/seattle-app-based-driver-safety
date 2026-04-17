import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const incidents = sqliteTable("incidents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  category: text("category").notNull(),
  neighborhood: text("neighborhood").notNull(),
  address: text("address").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  victim: text("victim"),
  platform: text("platform").notNull(),
  description: text("description").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  status: text("status").notNull(),
  // New fields
  timeOfDay: text("time_of_day"),        // "02:17", "12:40", etc.
  hasVideo: integer("has_video"),         // 0 or 1 — dashcam/bodycam evidence
  suspectName: text("suspect_name"),
  caseNumber: text("case_number"),
  caseStatus: text("case_status"),        // pending, arraigned, trial, convicted, sentenced
  sentenceInfo: text("sentence_info"),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true });
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// Submitted incidents (unverified)
export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submittedAt: text("submitted_at").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  neighborhood: text("neighborhood").notNull(),
  address: text("address").notNull(),
  platform: text("platform").notNull(),
  description: text("description").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  status: text("status").notNull(), // pending, verified, rejected
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// Alert subscriptions
export const alertSubscriptions = sqliteTable("alert_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email"),
  phone: text("phone"),
  neighborhoods: text("neighborhoods"), // JSON array
  createdAt: text("created_at").notNull(),
});

export const insertAlertSchema = createInsertSchema(alertSubscriptions).omit({ id: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type AlertSubscription = typeof alertSubscriptions.$inferSelect;
