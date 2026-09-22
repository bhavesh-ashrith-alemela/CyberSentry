DO $$ BEGIN
 CREATE TYPE "public"."finding_severity" AS ENUM('info', 'low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."scan_status" AS ENUM('pending', 'scanning', 'analyzing', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tracker_category" AS ENUM('Advertising', 'Analytics', 'Social', 'Fingerprinting', 'Essential', 'Content/CDN', 'Other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('admin', 'researcher', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consent_banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"detected" boolean DEFAULT false NOT NULL,
	"cmp_name" varchar(100),
	"banner_text" text,
	"has_accept_button" boolean DEFAULT false NOT NULL,
	"has_reject_button" boolean DEFAULT false NOT NULL,
	"has_settings_button" boolean DEFAULT false NOT NULL,
	"raw_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cookie_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"tracker_id" uuid,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"path" varchar(255) DEFAULT '/' NOT NULL,
	"expires" bigint DEFAULT -1 NOT NULL,
	"is_session" boolean DEFAULT false NOT NULL,
	"is_secure" boolean DEFAULT false NOT NULL,
	"is_http_only" boolean DEFAULT false NOT NULL,
	"same_site" varchar(20) DEFAULT 'Lax' NOT NULL,
	"is_third_party" boolean DEFAULT false NOT NULL,
	"category" varchar(50) DEFAULT 'Unknown' NOT NULL,
	"value_preview" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"rule_id" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"severity" "finding_severity" NOT NULL,
	"score_deduction" integer DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"evidence" jsonb,
	"remediation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "network_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"tracker_id" uuid,
	"url" text NOT NULL,
	"domain" varchar(255) NOT NULL,
	"method" varchar(10) DEFAULT 'GET' NOT NULL,
	"status_code" integer,
	"resource_type" varchar(50) DEFAULT 'other' NOT NULL,
	"is_third_party" boolean DEFAULT true NOT NULL,
	"headers" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"total_score" integer NOT NULL,
	"grade" varchar(4) NOT NULL,
	"metrics" jsonb NOT NULL,
	"recommendations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" uuid NOT NULL,
	"status" "scan_status" DEFAULT 'pending' NOT NULL,
	"score" integer,
	"grade" varchar(4),
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trackers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"company" varchar(255),
	"category" "tracker_category" DEFAULT 'Other' NOT NULL,
	"description" text,
	"website_url" varchar(2048),
	"risk_level" "risk_level" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "websites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"url" varchar(2048) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consent_banners" ADD CONSTRAINT "consent_banners_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cookie_records" ADD CONSTRAINT "cookie_records_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cookie_records" ADD CONSTRAINT "cookie_records_tracker_id_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."trackers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "findings" ADD CONSTRAINT "findings_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "network_requests" ADD CONSTRAINT "network_requests_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "network_requests" ADD CONSTRAINT "network_requests_tracker_id_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."trackers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scans" ADD CONSTRAINT "scans_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_consent_banners_scan_id" ON "consent_banners" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cookie_records_scan_id" ON "cookie_records" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cookie_records_tracker_id" ON "cookie_records" USING btree ("tracker_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cookie_records_domain" ON "cookie_records" USING btree ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_findings_scan_id" ON "findings" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_findings_severity" ON "findings" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_findings_rule_id" ON "findings" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_network_requests_scan_id" ON "network_requests" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_network_requests_tracker_id" ON "network_requests" USING btree ("tracker_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_network_requests_domain" ON "network_requests" USING btree ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_reports_scan_id" ON "reports" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scans_website_id" ON "scans" USING btree ("website_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scans_status" ON "scans" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scans_created_at" ON "scans" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_trackers_domain" ON "trackers" USING btree ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_trackers_category" ON "trackers" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_websites_user_id" ON "websites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_websites_domain" ON "websites" USING btree ("domain");