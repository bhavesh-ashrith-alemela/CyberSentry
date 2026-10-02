# CyberSentry — Master Interview Cheat Sheet (Last-Minute Revision)

> **Project in One Sentence**: CyberSentry is an automated, web-based privacy transparency platform that audits websites for covert tracking mechanisms and deceptive cookie consent dark patterns, synthesizing findings into a deterministic, evidence-backed Privacy Transparency Score.

---

## ⚡ 1. High-Density Architectural Summary

```
[ Next.js 14 App Router on Vercel ]
       │  (1.5s Client Polling over REST)
       ▼
[ Node.js + Express 4.x Container on Render (0.0.0.0:10000) ]
       ├── Multi-Layer SSRF Guard (Protocol, Host, DNS Lookup, CIDR Validation)
       ├── Scan Service (In-Process Concurrency Ceiling: MAX_CONCURRENT_SCANS=1)
       ├── Browser Manager (Playwright Chromium: 5-Scan Recycle, 5-Min Idle Cleanup)
       ├── Scanner Engine (Route Media Aborter: Image/Font/Media Aborted -> 68% RAM Cut)
       ├── Banner Detector (OneTrust, Cookiebot, Complianz CMP Fingerprinting)
       ├── Deterministic Scorer (10 Rules, Capped Deductions, Pure Functions)
       └── Tracker Knowledge Base (In-Memory Hash Matcher)
       │  (Drizzle ORM Queries + ACID Transactions)
       ▼
[ PostgreSQL 18 on Cloud Instance (Neon / Render) ]
```

---

## 🛠️ 2. Core Technology Stack

| Layer | Technology | Primary Role in CyberSentry | Alternative Rejected & Rationale |
|---|---|---|---|
| **Frontend Framework** | **Next.js 14** (App Router) | Client dashboard, dynamic routes (`/scan/[id]`), polling | **Plain React / Vite**: Lacked modern SSR shell and unified build optimizations. |
| **Language** | **TypeScript 5.5** | End-to-end static type safety across schemas, DTOs, and UI | **JavaScript / Python**: Type errors in complex nested telemetry structures. |
| **Styling & Icons** | **Tailwind CSS + Lucide** | Custom `--cs-*` design tokens, zero-runtime CSS bundle | **Material UI / Emotion**: Runtime CSS-in-JS overhead conflicts with React Server Components. |
| **Charts** | **Recharts** | Declarative React SVG category distributions | **Chart.js / D3**: Canvas renders blurry on retina; D3 imperatively mutates DOM. |
| **Backend API** | **Node.js + Express 4.x** | REST API gateway, job orchestration, SSRF security | **Next.js API Routes**: Serverless functions have 50MB limits and lack Chromium Linux libraries. |
| **Browser Engine** | **Playwright (Chromium)** | Headless crawling, request interception, DOM testing | **Puppeteer / Cheerio**: Cheerio cannot run JS; Puppeteer lacks first-party route abort hooks. |
| **Database** | **PostgreSQL 18** | Relational audit storage with hybrid JSONB evidence | **MongoDB**: Lacked strict multi-table relational integrity and ACID guarantees. |
| **ORM** | **Drizzle ORM** | Type-safe SQL builder with zero runtime overhead | **Prisma**: Prisma runs a 40MB Rust binary using 100MB+ RAM (instant OOM in 512MB RAM). |
| **Validation** | **Zod** | Runtime HTTP request validation and static type inference | **Joi / Yup**: Lacks first-class TypeScript inference (`z.infer<typeof schema>`). |
| **Containerization** | **Docker** (`jammy` base) | Pre-bundled Chromium OS libraries on Render | **Native Buildpacks**: Missing shared Linux desktop dependencies (`libnss3`, `libatk`). |

---

## 🗄️ 3. The 9 Database Entities (Drizzle PostgreSQL)

1. **`users`**: Audit accounts (`id: uuid PK`, `email`, `role`, `createdAt`). Anonymous scans supported.
2. **`websites`**: Audited domains (`id: uuid PK`, `userId FK`, `url`, `domain`, `createdAt`).
3. **`scans`**: Scan lifecycles (`id: uuid PK`, `websiteId FK`, `status`, `score`, `grade`, `durationMs`, `errorMessage`).
4. **`cookie_records`**: Captured cookies (`id`, `scanId FK`, `trackerId FK`, `name`, `domain`, `expires`, `isSession`, `isSecure`, `isHttpOnly`, `sameSite`, `isThirdParty`, `category`).
5. **`network_requests`**: HTTP egress (`id`, `scanId FK`, `trackerId FK`, `url`, `domain`, `method`, `statusCode`, `resourceType`, `isThirdParty`, `headers: jsonb`).
6. **`trackers`**: KB catalog (`id`, `domain UK`, `name`, `company`, `category`, `riskLevel`).
7. **`consent_banners`**: Detected CMPs (`id`, `scanId FK`, `detected`, `cmpName`, `hasAcceptButton`, `hasRejectButton`, `rawMetadata: jsonb`).
8. **`findings`**: Specific deductions (`id`, `scanId FK`, `ruleId`, `title`, `severity`, `scoreDeduction`, `description`, `evidence: jsonb`, `remediation`).
9. **`reports`**: Synthesized summaries (`id`, `scanId FK`, `totalScore`, `grade`, `summary`, `metrics: jsonb`, `recommendations: jsonb`).

*Key Constraints*: `ON DELETE CASCADE` across parent-child links; `ON DELETE SET NULL` on `trackerId`; UUIDv4 primary keys.

---

## ⚖️ 4. The 5 Scoring Categories & Rule Deductions

$$\text{Final Score} = \max\left(0, \min\left(100, 100 - \sum \text{Deductions}\right)\right)$$

| Category | Weight | Key Deductions & Rules |
|---|:---:|---|
| **Consent Integrity** | **30%** | • `RULE_NO_BANNER`: -20 (High)<br>• `RULE_NO_REJECT_BUTTON`: -15 (High)<br>• `RULE_PRE_CONSENT_TRACKING`: -20, max 30 (Critical) |
| **Tracking Transparency** | **25%** | • `RULE_SESSION_REPLAY`: -15 (Critical)<br>• `RULE_AD_TRACKERS`: -5 per domain, max 25 (High) |
| **User Control** | **20%** | • `RULE_ASYMMETRIC_CONSENT`: -10 (Medium)<br>• `RULE_PRESELECTED_OPTIONS`: -15 (High) |
| **Security Posture** | **15%** | • `RULE_INSECURE_COOKIES`: -2 per cookie, max 15 (Medium) |
| **Education & Clarity** | **10%** | • `RULE_THIRD_PARTY_COOKIES`: -5 per cookie, max 25 (High)<br>• `RULE_EXCESSIVE_EXPIRY`: -5 flat if any cookie $> 365\text{d}$, max 10 (Low) |

*Grade Scale*: **A+** (90–100), **A** (80–89), **B** (70–79), **C** (55–69), **D** (40–54), **F** (0–39).

---

## 🌐 5. Primary API Endpoints

* `POST /api/scans`: Creates scan job `{ url }`. Returns `HTTP 201 Created` with `{ scan: { id, status: 'pending' } }`. Returns `HTTP 429` if a scan is already running.
* `GET /api/scans/:id`: Returns lightweight scan status for 1.5s client polling (`pending` $\rightarrow$ `scanning` $\rightarrow$ `analyzing` $\rightarrow$ `completed`/`failed`).
* `GET /api/scans/:id/report`: Returns full audit summary, score, grade, and recommendations.
* `GET /api/scans/:id/cookies`: Returns full cookie inventory with security flags.
* `GET /api/scans/:id/trackers`: Returns identified tracker hostnames and categories.
* `GET /api/scans/:id/findings`: Returns rule deductions with JSON evidence payloads.
* `GET /api/scans`: Returns paginated audit history for `/history`.
* `GET /api/scans/compare?scanA=UUID&scanB=UUID`: Returns side-by-side comparison.
* `GET /health/live`: Liveness probe (Express process responsive, returns 200 OK without touching DB).
* `GET /health/ready`: Readiness probe (queries PostgreSQL `SELECT 1;`, returns 200 or 503).

---

## 📁 6. Important Files & Key Roles

* **Backend Gateway**: `backend/src/server.ts` — Express bootstrap, CORS security, fail-fast exception handlers.
* **Scan Orchestrator**: `backend/src/services/scanService.ts` — SSRF gate, `activeScans` concurrency tracking, async job launcher.
* **Crawler Engine**: `backend/src/scanner/scannerEngine.ts` — Playwright Chromium, route media aborting, dwell timer, context cleanup.
* **Browser Lifecycle**: `backend/src/scanner/browser.ts` — 5-scan recycling, 5-minute idle timeout, low-memory Chromium flags.
* **Rule Scorer**: `backend/src/analyzer/scorer.ts` — Pure deterministic classification, deduction calculation, evidence synthesis.
* **Tracker KB**: `backend/src/analyzer/trackerDb.ts` — Curated in-memory catalog of ad/analytics hostnames.
* **SSRF Guard**: `backend/src/services/ssrfService.ts` — Protocol, hostname blacklist, DNS pre-flight, and CIDR range blocker.
* **Database Schema**: `backend/src/db/schema.ts` — Drizzle ORM 9-table relational model.
* **Health Probes**: `backend/src/controllers/healthController.ts` — Isolated liveness (200) vs readiness (503 on DB disconnect).
* **Frontend Dashboard**: `frontend/src/app/scan/[id]/page.tsx` — Dynamic route, 1.5s polling loop, report dashboard, JSON & PDF export.
* **History Page**: `frontend/src/app/history/page.tsx` — Past audits, search filter, comparison selection.
* **Compare Page**: `frontend/src/app/compare/page.tsx` — Differential privacy comparison between two domains.

---

## 📊 7. UML / DFD / ER Diagram Summary

* **Architecture Diagram**: 7 components, decoupled Next.js + Express + PostgreSQL.
* **DFD Level 0**: 2 external entities (User, Target Website), 2 data stores (PostgreSQL, Tracker KB), 7 primary data flows.
* **DFD Level 1**: 5 processes (1.0 Ingestion, 2.0 Scanning, 3.0 Analysis, 4.0 Scoring, 5.0 Reporting).
* **Use Case Diagram**: Exactly 14 visual use cases (numbered 1–8 and 10–15; bubble 9 skipped in author's drawing). All 14 implemented.
* **Class Diagram**: 8 conceptual domain classes mapped to TypeScript functional Drizzle schemas and pure analyzer functions.
* **Sequence Diagram**: 16 core steps + 3 client-side export steps (1–19).
* **Activity Diagram**: 11 pipeline stages with parallel data collection fork and failure branching.
* **ER Diagram**: 8 relational tables + trackers table in PostgreSQL.

---

## 🛡️ 8. Security Mechanisms

1. **Protocol Whitelist**: Rejects non-HTTP/HTTPS protocols (`file://`, `ftp://`, `gopher://`).
2. **Hostname Blacklist**: Rejects `localhost`, `127.0.0.1`, `::1`, and `.internal`.
3. **DNS Pre-Flight Resolution**: Resolves hostnames via `dns.lookup` before browser launch; verifies public IPs.
4. **CIDR Range Blocking**: Rejects private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) and cloud metadata (`169.254.169.254`).
5. **Route Redirect Guard**: Re-validates destination IPs during 301/302 redirects to eliminate DNS rebinding.
6. **CORS Whitelisting**: Restricts API calls to authorized frontend domains.
7. **Environment Secrets**: Database URLs and API secrets stored exclusively in environment variables.

---

## 🔧 9. Backend Reliability & Crash Fix Summary

* **Old Failure Mode**: Backend went offline due to unhandled idle PostgreSQL socket drops, fatal uncaught exceptions corrupting heap memory, flapping Render health checks during DB cold starts, and Chromium memory bloat on 512MB RAM.
* **Engineered Fix**:
  1. `pool.on("error")` listener handles idle client disconnects cleanly.
  2. Bounded pool size (`max: 5`, `idleTimeout: 30000ms`).
  3. Liveness (`/health/live`) decoupled from readiness (`/health/ready`); `render.yaml` probes liveness to prevent deploy loops.
  4. Fail-fast crash policy: domain errors caught gracefully; unexpected uncaught exceptions log diagnostics and terminate with `process.exit(1)`, enabling container self-healing.
  5. `MAX_CONCURRENT_SCANS=1` prevents simultaneous crawls (returns HTTP 429).
  6. Proactive browser recycling every 5 scans; 5-minute idle cleanup.
  7. Route-level media aborting cuts page RAM by 68%.

---

## 🧪 10. Testing Suite (8 Analyzer Unit Tests)

Run with: `npm run test:analyzer` in `backend/`
* **Test 1**: Known tracker identification and exact category assignment.
* **Test 2**: Unknown third-party domains categorized safely as `Other` (no false accusations).
* **Test 3**: First-party vs third-party root domain resolution (eTLD+1).
* **Test 4**: Cookie categorization via semantic name heuristics.
* **Test 5**: Pre-consent tracking flagged with critical severity deduction.
* **Test 6**: Consent banner absence and asymmetric dark patterns detected.
* **Test 7**: Missing evidence handled gracefully without false compliances (80/100, Grade A).
* **Test 8**: Configurable scoring weights override defaults.

---

## ⚠️ 11. Honest Limitations

* **Single Concurrency**: Handles 1 active scan at a time to survive on 512MB RAM.
* **Bot Defenses**: Sites behind Cloudflare Turnstile or CAPTCHAs are audited as-served.
* **Complex CMPs**: Banners inside cross-origin iframes cannot be clicked programmatically.
* **Knowledge Base**: Curated catalog covers common trackers; unknown trackers categorized as `Other`.
* **No Legal Certification**: Provides technical transparency signals, not statutory legal advice.

---

## 🚀 12. Realistic Future Enhancements

* **Distributed Queue**: BullMQ + Redis to scale across multiple dedicated worker containers.
* **Multi-Page Crawling**: Audit sample subpages (checkout, login, blog) across an entire domain.
* **Machine Learning CMP Detection**: Lightweight vision/DOM model to identify custom banners.
* **Drift Monitoring**: Weekly scheduled scans with automated email alerts on privacy regressions.
* **Server-Side PDF Generation**: Downloadable formal compliance audit certificates.
