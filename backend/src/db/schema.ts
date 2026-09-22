import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  bigint,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// POSTGRESQL ENUMS
// ============================================================
export const userRoleEnum = pgEnum("user_role", ["admin", "researcher", "user"]);

export const scanStatusEnum = pgEnum("scan_status", [
  "pending",
  "scanning",
  "analyzing",
  "completed",
  "failed",
]);

export const trackerCategoryEnum = pgEnum("tracker_category", [
  "Advertising",
  "Analytics",
  "Social",
  "Fingerprinting",
  "Essential",
  "Content/CDN",
  "Other",
]);

export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high", "critical"]);

export const findingSeverityEnum = pgEnum("finding_severity", [
  "info",
  "low",
  "medium",
  "high",
  "critical",
]);

// ============================================================
// 1. USERS
// ============================================================
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("idx_users_email").on(table.email),
  })
);

// ============================================================
// 2. WEBSITES
// ============================================================
export const websites = pgTable(
  "websites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    url: varchar("url", { length: 2048 }).notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_websites_user_id").on(table.userId),
    domainIdx: index("idx_websites_domain").on(table.domain),
  })
);

// ============================================================
// 3. TRACKERS (Knowledge Base of Trackers)
// ============================================================
export const trackers = pgTable(
  "trackers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }),
    category: trackerCategoryEnum("category").default("Other").notNull(),
    description: text("description"),
    websiteUrl: varchar("website_url", { length: 2048 }),
    riskLevel: riskLevelEnum("risk_level").default("medium").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    domainIdx: index("idx_trackers_domain").on(table.domain),
    categoryIdx: index("idx_trackers_category").on(table.category),
  })
);

// ============================================================
// 4. SCANS
// ============================================================
export const scans = pgTable(
  "scans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    websiteId: uuid("website_id")
      .notNull()
      .references(() => websites.id, { onDelete: "cascade" }),
    status: scanStatusEnum("status").default("pending").notNull(),
    score: integer("score"),
    grade: varchar("grade", { length: 4 }),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms").default(0).notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    websiteIdx: index("idx_scans_website_id").on(table.websiteId),
    statusIdx: index("idx_scans_status").on(table.status),
    createdAtIdx: index("idx_scans_created_at").on(table.createdAt),
  })
);

// ============================================================
// 5. COOKIE_RECORDS
// ============================================================
export const cookieRecords = pgTable(
  "cookie_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    trackerId: uuid("tracker_id").references(() => trackers.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    path: varchar("path", { length: 255 }).default("/").notNull(),
    expires: bigint("expires", { mode: "number" }).default(-1).notNull(),
    isSession: boolean("is_session").default(false).notNull(),
    isSecure: boolean("is_secure").default(false).notNull(),
    isHttpOnly: boolean("is_http_only").default(false).notNull(),
    sameSite: varchar("same_site", { length: 20 }).default("Lax").notNull(),
    isThirdParty: boolean("is_third_party").default(false).notNull(),
    category: varchar("category", { length: 50 }).default("Unknown").notNull(),
    valuePreview: varchar("value_preview", { length: 255 }).default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scanIdx: index("idx_cookie_records_scan_id").on(table.scanId),
    trackerIdx: index("idx_cookie_records_tracker_id").on(table.trackerId),
    domainIdx: index("idx_cookie_records_domain").on(table.domain),
  })
);

// ============================================================
// 6. NETWORK_REQUESTS
// ============================================================
export const networkRequests = pgTable(
  "network_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    trackerId: uuid("tracker_id").references(() => trackers.id, { onDelete: "set null" }),
    url: text("url").notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    method: varchar("method", { length: 10 }).default("GET").notNull(),
    statusCode: integer("status_code"),
    resourceType: varchar("resource_type", { length: 50 }).default("other").notNull(),
    isThirdParty: boolean("is_third_party").default(true).notNull(),
    headers: jsonb("headers").$type<Record<string, string>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scanIdx: index("idx_network_requests_scan_id").on(table.scanId),
    trackerIdx: index("idx_network_requests_tracker_id").on(table.trackerId),
    domainIdx: index("idx_network_requests_domain").on(table.domain),
  })
);

// ============================================================
// 7. CONSENT_BANNERS (1:0..1 with Scans)
// ============================================================
export const consentBanners = pgTable(
  "consent_banners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    detected: boolean("detected").default(false).notNull(),
    cmpName: varchar("cmp_name", { length: 100 }),
    bannerText: text("banner_text"),
    hasAcceptButton: boolean("has_accept_button").default(false).notNull(),
    hasRejectButton: boolean("has_reject_button").default(false).notNull(),
    hasSettingsButton: boolean("has_settings_button").default(false).notNull(),
    rawMetadata: jsonb("raw_metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scanIdx: uniqueIndex("idx_consent_banners_scan_id").on(table.scanId),
  })
);

// ============================================================
// 8. FINDINGS
// ============================================================
export const findings = pgTable(
  "findings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    ruleId: varchar("rule_id", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    severity: findingSeverityEnum("severity").notNull(),
    scoreDeduction: integer("score_deduction").default(0).notNull(),
    description: text("description").notNull(),
    evidence: jsonb("evidence").$type<Record<string, any>>(),
    remediation: text("remediation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scanIdx: index("idx_findings_scan_id").on(table.scanId),
    severityIdx: index("idx_findings_severity").on(table.severity),
    ruleIdx: index("idx_findings_rule_id").on(table.ruleId),
  })
);

// ============================================================
// 9. REPORTS (1:1 with Scans)
// ============================================================
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    totalScore: integer("total_score").notNull(),
    grade: varchar("grade", { length: 4 }).notNull(),
    metrics: jsonb("metrics")
      .$type<{
        totalCookies: number;
        thirdPartyCookies: number;
        totalTrackers: number;
        thirdPartyRequests: number;
        durationMs: number;
        websiteTitle?: string;
        finalUrl?: string;
        metaTags?: Record<string, string>;
        consentTestSummary?: {
          tested: boolean;
          action: string;
          observedNewCookies: number;
          observedNewRequests: number;
        };
      }>()
      .notNull(),
    recommendations: jsonb("recommendations").$type<string[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scanIdx: uniqueIndex("idx_reports_scan_id").on(table.scanId),
  })
);

// ============================================================
// DRIZZLE RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  websites: many(websites),
}));

export const websitesRelations = relations(websites, ({ one, many }) => ({
  user: one(users, {
    fields: [websites.userId],
    references: [users.id],
  }),
  scans: many(scans),
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  website: one(websites, {
    fields: [scans.websiteId],
    references: [websites.id],
  }),
  cookieRecords: many(cookieRecords),
  networkRequests: many(networkRequests),
  findings: many(findings),
  consentBanner: one(consentBanners, {
    fields: [scans.id],
    references: [consentBanners.scanId],
  }),
  report: one(reports, {
    fields: [scans.id],
    references: [reports.scanId],
  }),
}));

export const trackersRelations = relations(trackers, ({ many }) => ({
  cookieRecords: many(cookieRecords),
  networkRequests: many(networkRequests),
}));

export const cookieRecordsRelations = relations(cookieRecords, ({ one }) => ({
  scan: one(scans, {
    fields: [cookieRecords.scanId],
    references: [scans.id],
  }),
  tracker: one(trackers, {
    fields: [cookieRecords.trackerId],
    references: [trackers.id],
  }),
}));

export const networkRequestsRelations = relations(networkRequests, ({ one }) => ({
  scan: one(scans, {
    fields: [networkRequests.scanId],
    references: [scans.id],
  }),
  tracker: one(trackers, {
    fields: [networkRequests.trackerId],
    references: [trackers.id],
  }),
}));

export const consentBannersRelations = relations(consentBanners, ({ one }) => ({
  scan: one(scans, {
    fields: [consentBanners.scanId],
    references: [scans.id],
  }),
}));

export const findingsRelations = relations(findings, ({ one }) => ({
  scan: one(scans, {
    fields: [findings.scanId],
    references: [scans.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  scan: one(scans, {
    fields: [reports.scanId],
    references: [scans.id],
  }),
}));

// ============================================================
// TYPE INFERENCES
// ============================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Website = typeof websites.$inferSelect;
export type NewWebsite = typeof websites.$inferInsert;

export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;

export type Tracker = typeof trackers.$inferSelect;
export type NewTracker = typeof trackers.$inferInsert;

export type CookieRecord = typeof cookieRecords.$inferSelect;
export type NewCookieRecord = typeof cookieRecords.$inferInsert;

export type NetworkRequest = typeof networkRequests.$inferSelect;
export type NewNetworkRequest = typeof networkRequests.$inferInsert;

export type ConsentBanner = typeof consentBanners.$inferSelect;
export type NewConsentBanner = typeof consentBanners.$inferInsert;

export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
