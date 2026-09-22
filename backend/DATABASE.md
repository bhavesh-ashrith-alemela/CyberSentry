# CyberSentry Database Guide (PostgreSQL & Drizzle ORM)

This document provides step-by-step instructions for configuring, migrating, and seeding the CyberSentry PostgreSQL database.

---

## 🗄️ Relational Schema (9 PostgreSQL Entities)

The CyberSentry database implements the 9 core entities from the architectural ER diagram:

1. **`users`**: Academic researchers, administrators, or users owning scanned websites (`id` UUID, `email` UNIQUE, `name`, `role` enum, `createdAt`, `updatedAt`).
2. **`websites`**: Scanned domain catalog (`id` UUID, `userId` FK nullable, `url`, `domain`, `createdAt`, `updatedAt`).
3. **`scans`**: Execution runs (`id` UUID, `websiteId` FK, `status` enum, `score`, `grade`, `startedAt`, `completedAt`, `durationMs`, `errorMessage`). Indexed on `websiteId`, `status`, `createdAt`.
4. **`trackers`**: Knowledge base catalog of recognized tracking vendors (`id` UUID, `name`, `domain` indexed, `company`, `category` enum, `description`, `websiteUrl`, `riskLevel` enum).
5. **`cookie_records`**: Extracted cookies (`id` UUID, `scanId` FK, `trackerId` optional FK, `name`, `domain`, `path`, `expires`, `isSession`, `isSecure`, `isHttpOnly`, `sameSite`, `isThirdParty`, `category`, `valuePreview`).
6. **`network_requests`**: Outbound telemetry calls (`id` UUID, `scanId` FK, `trackerId` optional FK, `url`, `domain`, `method`, `statusCode`, `resourceType`, `isThirdParty`, `headers` **JSONB**).
7. **`consent_banners`**: Banner heuristics (**1:0..1 with Scans**, `scanId` UNIQUE FK, `detected`, `cmpName`, `bannerText`, `hasAcceptButton`, `hasRejectButton`, `hasSettingsButton`, `rawMetadata` **JSONB**).
8. **`findings`**: Explainable deductions (`id` UUID, `scanId` FK, `ruleId`, `title`, `severity` enum, `scoreDeduction`, `description`, `evidence` **JSONB**, `remediation`).
9. **`reports`**: Final audit report (**1:1 with Scans**, `scanId` UNIQUE FK, `summary`, `totalScore`, `grade`, `metrics` **JSONB**, `recommendations` **JSONB array**).

---

## ⚙️ Step 1: Create the Database Locally

Open your terminal or PostgreSQL GUI (pgAdmin, TablePlus, DBeaver, or psql CLI):

```bash
psql -U postgres
```

Inside the `psql` prompt, create the database:

```sql
CREATE DATABASE cybersentry;
```

Exit `psql`:
```sql
\q
```

---

## 🔑 Step 2: Configure DATABASE_URL in backend/.env

Open `backend/.env` (or copy from `.env.example`):

```env
NODE_ENV=development
PORT=5001

# Format: postgresql://[USER]:[PASSWORD]@localhost:5432/[DATABASE]
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/cybersentry
```

*Replace `YOUR_ACTUAL_PASSWORD` with the password you set during your PostgreSQL installation.*

---

## 🧪 Step 3: Verify the Connection

From inside the `backend/` directory, run:

```bash
npm run db:check
```

When your credentials are correct, you will see:

```text
==================================================
 PostgreSQL Connected Successfully!
 Database : cybersentry
 User     : postgres
 Version  : PostgreSQL 16.x (or 15.x/17.x)
==================================================
```

---

## 🚀 Step 4: Run the Database Migrations

Apply the complete schema, native enum types, UUID generation, JSONB columns, foreign keys with cascading deletes, and B-Tree indexes:

```bash
npm run db:migrate
```

*Expected output:*
```text
Applying pending PostgreSQL migrations from ./drizzle...
All PostgreSQL migrations applied successfully.
```

*(Note: During development you can also run `npm run db:push` to push schema updates directly).*

---

## 🌱 Step 5: Seed the Tracker Knowledge Base

Populate the `trackers` knowledge base with 18+ industry tracking entities (Google Analytics, Meta Pixel, DoubleClick, Hotjar, Microsoft Clarity, FullStory, Amplitude, Criteo, TikTok, etc.) along with a default academic demo user and sample websites:

```bash
npm run db:seed
```

*Expected output:*
```text
Seeding 18 trackers into knowledge base...
Inserted 18 new tracker records (0 already present).
Created default user: researcher@cybersentry.local
Created sample website record: example.com
Database seeding completed successfully.
```

---

## 🖥️ Step 6: Explore Data Visually with Drizzle Studio

To inspect your PostgreSQL tables, relations, and JSONB payloads in an interactive web UI:

```bash
npm run db:studio
```

Navigate to [https://local.drizzle.studio](https://local.drizzle.studio) in your browser.

---

## 🌐 Switching to Cloud PostgreSQL (Production)

To connect to a managed cloud database (such as **Neon**, **Render PostgreSQL**, or **Supabase**), simply change `DATABASE_URL` in your production environment variables:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_CLOUD_PASSWORD@ep-sample-123456.us-east-2.aws.neon.tech/cybersentry?sslmode=require
```

The database connection pool automatically detects `sslmode=require` or `NODE_ENV=production` and enables secure TLS connections (`ssl: { rejectUnauthorized: false }`). Zero code changes are required!
