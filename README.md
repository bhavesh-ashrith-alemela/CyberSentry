# 🛡️ CyberSentry

> **Explainable Cookie Consent and Web Tracking Transparency Platform**  
> Audit websites for stealth third-party trackers, pre-consent violations, deceptive choice dark patterns, and cookie security configurations with deterministic, evidence-backed proofs.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.47-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.33-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Analyzer Tests: 8/8 Passing](https://img.shields.io/badge/Analyzer_Tests-8%2F8%20Passing-brightgreen.svg)](https://github.com/bhavesh-ashrith-alemela/CyberSentry)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Why CyberSentry?](#-why-cybersentry)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [System Design Diagrams & Traceability](#-system-design-diagrams--traceability)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started Locally](#-getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Deployment Guide](#-deployment-guide)
  - [Backend Deployment on Render (Docker)](#backend-deployment-on-render-docker)
  - [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
  - [Steps for Applying Future Updates to Already Deployed App](#steps-for-applying-future-updates-to-already-deployed-app)
- [Deterministic Scoring Algorithm](#-deterministic-scoring-algorithm)
- [Backend Runtime Reliability & Cloud Hardening](#-backend-runtime-reliability--cloud-hardening)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Interview & Viva Preparation Resources](#-interview--viva-preparation-resources)
- [Regulatory & Legal Framework Alignment](#-regulatory--legal-framework-alignment)
- [License](#-license)

---

## 🌟 Overview

**CyberSentry** is an open-source, full-stack cybersecurity and web privacy transparency platform that demystifies modern web tracking and consent theater.

When visitors browse modern websites, dozens of third-party advertising trackers, fingerprinting scripts, and tracking cookies often execute in the background—frequently before the user has even read or interacted with the consent banner. Furthermore, many consent banners employ **deceptive choice architecture (dark patterns)** to nudge visitors into accepting invasive surveillance.

CyberSentry launches an isolated, headless Chromium browser, captures client-side network telemetry and storage events in real time, audits consent banner interfaces, and calculates an **Explainable Privacy Transparency Score (0–100)** with empirical, mathematically bounded evidence.

---

## 🎯 Why CyberSentry?

1. **Zero Black-Box AI / LLM Hallucinations**: Every deduction, rule violation, and score deduction is computed through strictly deterministic, reproducible algorithms backed by recorded HTTP requests, DOM structures, and cookie storage states.
2. **Empirical Evidence Chains**: Findings are accompanied by raw technical proof (request URLs, cookie attributes, selector bounding boxes, timestamps) stored in PostgreSQL.
3. **Multi-Layer Defensive Security**: Protected by an exhaustive Server-Side Request Forgery (SSRF) defense engine blocking private subnets, cloud metadata endpoints (`169.254.169.254`), loopbacks, and DNS rebinding attacks.
4. **Clean, Modern, Awwwards-Inspired Design System**: Built with a clean modern palette (`#F7F9FC` background, crisp card surfaces, refined typography, responsive navigation, and accessible data visualizations) offering optimal clarity across desktop, tablet, and mobile viewports.
5. **Engineered for 512MB RAM Containers**: Defensive memory management featuring route-level media aborting (68% RAM reduction), single-scan concurrency controls (`MAX_CONCURRENT_SCANS=1`), proactive browser recycling every 5 scans, and decoupled health probes.

---

## ✨ Key Features

- **🌐 Real-Time Headless Browser Crawling**: Spawns ephemeral, incognito Chromium instances via Playwright with automatic media blocking (images, fonts, video) for fast, lightweight audits.
- **🍪 Cookie Lifecycle & Flag Auditing**:
  - Differentiates first-party vs. third-party cookies using root domain matching (`eTLD+1`).
  - Checks security flags: `Secure`, `HttpOnly`, and `SameSite` attributes.
  - Flags excessive expiration lifespans exceeding regulatory thresholds (> 365 days).
- **📡 Third-Party Tracker Classification**:
  - Maps outbound network requests to known tracker entities (Advertising, Analytics, Fingerprinting, Social Widgets, CDNs).
  - Identifies parent entities (Google LLC, Meta Platforms, Amazon, Microsoft, Criteo, Hotjar, Cloudflare).
  - Unknown third parties are categorized safely as `Other` to eliminate false accusations.
- **⚖️ Consent Banner & Dark Pattern Heuristics**:
  - Detects Consent Management Platforms (CMPs) including OneTrust, Cookiebot, Complianz, Didomi, Quantcast, Klaro, and custom banners.
  - Audits **Choice Asymmetry** (e.g., prominent "Accept All" button with "Reject" buried in secondary preferences).
  - Performs controlled automated interaction tests to record telemetry before and after consent.
- **📊 Comprehensive Privacy Reports**:
  - Circular SVG transparency score gauge with letter grades (`A+` to `F`).
  - Outbound tracker request distribution charts (Recharts SVG).
  - Filterable cookie ledger with search, category filtering, and third-party isolation.
  - Actionable technical recommendations for web developers and site operators.
  - Structured evidence accordion with collapsible JSON payloads.
- **🔄 Side-by-Side Audit Comparison (`/compare`)**:
  - Compares two scans of the same or different websites side-by-side.
  - Calculates score deltas, cookie changes, tracker changes, and shared vs. unique tracker domains.
- **📜 Persistent Audit History (`/history`)**:
  - Searchable domain index with instant filtering and direct comparison selection.
- **📄 Complete Report Export**:
  - **JSON Export**: Downloads the full audit archive as a structured `.json` file (`handleExportJson`).
  - **Print / PDF Export**: Formats the report for print and PDF generation (`handlePrintPdf` via `@media print` CSS).

---

## 🏛️ System Architecture

CyberSentry is built on an independently deployable, decoupled architecture:

```
┌───────────────────────────────────────────────────────────────────┐
│                     Client Browser / End User                     │
└──────────────────┬────────────────────────────────▲───────────────┘
                   │                                │
     1. HTTP / Next.js SSR             6. JSON Report & Telemetry
                   ▼                                │
┌──────────────────────────────────────┐            │
│       Vercel Serverless Edge         │            │
│   CyberSentry Next.js 14 Frontend    │            │
│  (React, TypeScript, Tailwind, SVG)  │            │
└──────────────────┬───────────────────┘            │
                   │                                │
                   │ 2. REST API Requests           │
                   │    (POST /scans, GET /report)  │
                   ▼                                │
┌───────────────────────────────────────────────────┴───────────────┐
│              Render Cloud Web Service (Docker Container)          │
│             CyberSentry Express REST API (Node.js 20)             │
│                                                                   │
│  ┌──────────────────────┐  ┌───────────────────────────────────┐  │
│  │ Multi-Layer SSRF Guard│  │  Deterministic Scoring Engine     │  │
│  │ (DNS & CIDR Filter)  │  │  (10-Dimension Rule Pipeline)     │  │
│  └──────────┬───────────┘  └─────────────────▲─────────────────┘  │
│             │                                │                    │
│             │ 3. Isolated Target Launch      │ 4. Telemetry Stream│
│             ▼                                │                    │
│  ┌───────────────────────────────────────────┴─────────────────┐  │
│  │        Headless Chromium Engine (Playwright Linux)          │  │
│  │  - Media Aborter (Images/Fonts Blocked -> 68% RAM Cut)      │  │
│  │  - Network Request Listener  - Cookie Store Ledger          │  │
│  │  - CMP DOM Inspector         - 5-Scan Proactive Recycling   │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────┬────────────────────────────────────────────────┘
                   │
                   │ 5. Relational Persistence & Snapshots
                   ▼
┌───────────────────────────────────────────────────────────────────┐
│             Render Managed PostgreSQL 16+ Database                │
│         (Drizzle ORM, Connection Pooling, Cascade Logic)          │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📐 System Design Diagrams & Traceability

The system design of CyberSentry is formally documented through 8 architectural models, verified for design-to-code traceability:

| Diagram # | System Design Diagram | File Location | Consistency Score | Verification Link |
|---|---|---|:---:|:---:|
| **1** | **System Architecture** | [`diagrams/system architecture.png`](diagrams/system%20architecture.png) | **92%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#1-system-architecture-diagram) |
| **2** | **DFD Level 0 (Context Diagram)** | [`diagrams/DFD.jpeg`](diagrams/DFD.jpeg) | **95%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#2-data-flow-diagram-dfd-level-0--context-diagram) |
| **3** | **DFD Level 1** | [`diagrams/DFD.jpeg`](diagrams/DFD.jpeg) | **92%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#3-data-flow-diagram-dfd-level-1) |
| **4** | **UML Use Case Diagram** | [`diagrams/use case uml.png`](diagrams/use%20case%20uml.png) | **93%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#4-uml-use-case-diagram) |
| **5** | **UML Class Diagram** | [`diagrams/class uml.png`](diagrams/class%20uml.png) | **85%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#5-uml-class-diagram) |
| **6** | **UML Sequence Diagram** | [`diagrams/sequence uml.png`](diagrams/sequence%20uml.png) | **90%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#6-uml-sequence-diagram) |
| **7** | **UML Activity Diagram** | [`diagrams/Activity UML.png`](diagrams/Activity%20UML.png) | **95%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#7-uml-activity-diagram) |
| **8** | **Entity-Relationship (ER) Diagram** | [`diagrams/ER.png`](diagrams/ER.png) | **92%** | [Traceability Audit](docs/DESIGN_TRACEABILITY_REPORT.md#8-entity-relationship-er-diagram-alignment) |

> 📑 **Full Academic Traceability Audit**: Read [`docs/DESIGN_TRACEABILITY_REPORT.md`](docs/DESIGN_TRACEABILITY_REPORT.md) for detailed component-by-component evidence, database table mappings, and API route proofs.

---

## 💻 Technology Stack

| Layer | Technology | Key Choice Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | Edge rendering, optimized bundle sizes, dynamic client-side route caching (`/scan/[id]`). |
| **Frontend Styling** | **Tailwind CSS** | Custom `--cs-*` design tokens, zero runtime overhead, mobile-first responsive layout. |
| **Data Visualization** | **Recharts** | Declarative SVG category distribution charts with responsive containers. |
| **Backend Framework** | **Node.js 20 + Express 4.x** | Non-blocking async event loop, layered service/repository architecture. |
| **Browser Engine** | **Playwright Chromium** | Network routing hooks (`page.route`), CDP cookie access, isolated incognito contexts. |
| **ORM & Query Builder** | **Drizzle ORM** | Zero binary overhead, type-safe SQL, atomic transactions, no Rust query engine bloat. |
| **Database** | **PostgreSQL 16+** | Relational integrity, ACID compliance, JSONB support for rich violation evidence. |
| **Input Validation** | **Zod** | Static TypeScript type inference and runtime schema enforcement for URLs and DTOs. |
| **Containerization** | **Docker (Playwright Jammy)** | Pre-bundled Chromium Linux desktop libraries (`libnss3`, `libatk`) ready for cloud deployment. |

---

## 📁 Project Directory Structure

```
CyberSentry/
├── backend/                        # Express API & Playwright Scanner
│   ├── drizzle/                    # Generated SQL migration snapshots
│   ├── src/
│   │   ├── analyzer/               # Deterministic scoring & classification rules
│   │   │   ├── rules.ts            # Rule definitions, penalties, and caps
│   │   │   ├── scorer.ts           # 10-dimension mathematical evaluation pipeline
│   │   │   ├── scoringConfig.ts    # Grade thresholds & category weights
│   │   │   ├── trackerDb.ts        # Known tracker domain registry
│   │   │   └── analyzer.test.ts    # 8-suite unit test for scoring & rules
│   │   ├── config/                 # Environment validation via Zod (env.ts)
│   │   ├── controllers/            # Request handlers (scanController, healthController)
│   │   ├── db/                     # Drizzle schema, connection pool & migrations
│   │   │   ├── index.ts            # PostgreSQL pool configuration with error listener
│   │   │   ├── migrate.ts          # Resilient migration runner with retry backoff
│   │   │   └── schema.ts           # 9 relational table definitions + JSONB
│   │   ├── middlewares/            # Error handling, request logging
│   │   ├── repositories/           # Database data access layer (scanRepository, etc.)
│   │   ├── routes/                 # Express API routes (scanRoutes, healthRoutes)
│   │   ├── scanner/                # Playwright headless browser engine
│   │   │   ├── bannerDetector.ts   # CMP detection & choice asymmetry audit
│   │   │   ├── browser.ts          # 5-scan recycling & 5-min idle process cleanup
│   │   │   ├── consentTester.ts    # Automated button click interaction
│   │   │   └── scannerEngine.ts    # Page navigation, media aborting & telemetry capture
│   │   ├── services/               # SSRF validation, scan orchestration
│   │   ├── server.ts               # Express server entry point & fail-fast handlers
│   │   └── test-comprehensive.ts   # 20-scenario verification test suite
│   ├── Dockerfile                  # Production containerfile (Playwright Jammy base)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── layout.tsx          # Root layout with Sidebar and Topbar
│   │   │   ├── page.tsx            # Redesigned homepage & scan console
│   │   │   ├── globals.css         # Modern design tokens & print styles
│   │   │   ├── history/page.tsx    # Persistent audit history table
│   │   │   ├── compare/page.tsx    # Side-by-side comparative analysis
│   │   │   └── scan/[id]/page.tsx  # Dynamic scan status & full privacy report
│   │   ├── components/             # Reusable UI primitives and report modules
│   │   │   ├── ConsentCard.tsx     # Choice architecture audit card
│   │   │   ├── CookieTable.tsx     # Stored cookie ledger with security flags
│   │   │   ├── FindingsList.tsx    # Evidence-based findings with remediation
│   │   │   ├── Footer.tsx          # Legal disclaimer & academic footer
│   │   │   ├── MetricsGrid.tsx     # Key telemetry metric tiles
│   │   │   ├── ScoreGauge.tsx      # SVG circular score meter
│   │   │   ├── StatusStepper.tsx   # Live scan progress timeline
│   │   │   ├── TrackerChart.tsx    # Recharts outbound telemetry distribution chart
│   │   │   └── ui/                 # Design system primitives (Button, Card, Badge, etc.)
│   │   └── lib/                    # API client, TypeScript types, formatters
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── diagrams/                       # Academic system design diagrams
│   ├── Activity UML.png            # UML Activity Diagram
│   ├── DFD.jpeg                    # DFD Level 0 & Level 1 Context Diagram
│   ├── ER.png                      # Entity-Relationship Diagram
│   ├── class uml.png               # UML Class Diagram
│   ├── sequence uml.png            # UML Sequence Diagram
│   ├── system architecture.png     # Full System Architecture Diagram
│   └── use case uml.png            # UML Use Case Diagram
│
├── docs/                           # Documentation, audits, and interview guides
│   ├── DESIGN_TRACEABILITY_REPORT.md # Bidirectional design-to-code traceability
│   ├── INTERVIEW_PREPARATION_GUIDE.md # 28-section master viva/interview guide
│   ├── INTERVIEW_CHEAT_SHEET.md     # Last-minute interview revision cheat sheet
│   └── MOCK_INTERVIEW.md            # 3-round 65-question mock interview simulator
│
├── render.yaml                     # Render Blueprint infrastructure definition
└── README.md                       # Official documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js**: v20.x recommended (v18.17.0+)
- **PostgreSQL**: v14, 15, or 16+ running locally
- **npm**: v9+ or v10+

---

### 1. Clone Repository

```bash
git clone https://github.com/bhavesh-ashrith-alemela/CyberSentry.git
cd CyberSentry
```

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright Chromium browser**:
   ```bash
   npx playwright install chromium
   ```

4. **Configure Environment Variables**:
   Create a `.env` file:
   ```ini
   NODE_ENV=development
   PORT=5001
   HOST=0.0.0.0
   DATABASE_URL=postgresql://postgres:password@localhost:5432/cybersentry
   FRONTEND_URL=http://localhost:3000
   MAX_CONCURRENT_SCANS=1
   ```

5. **Initialize Database & Run Migrations**:
   ```bash
   npm run db:migrate
   ```

6. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   The backend API will start on **`http://localhost:5001`**.  
   Verify liveness: `http://localhost:5001/health/live`  
   Verify readiness: `http://localhost:5001/health/ready`

---

### 3. Frontend Setup

1. **Open a new terminal window and navigate to `frontend`**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:5001
   ```

4. **Start Frontend Development Server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser.

---

## 🗄️ Database Schema & Migrations

CyberSentry uses Drizzle ORM across 9 primary entities:
- **`websites`**: Audited domains and URLs.
- **`scans`**: Historical audit instances, scores, grades, and statuses (`pending`, `scanning`, `analyzing`, `completed`, `failed`).
- **`cookie_records`**: Granular cookie records (name, domain, expiration epoch, `isSecure`, `isHttpOnly`, `sameSite`, `isThirdParty`, `category`).
- **`network_requests`**: Intercepted HTTP telemetry, methods, resources, and classification.
- **`trackers`**: Known third-party tracker knowledge base.
- **`consent_banners`**: Detected CMP metadata, buttons, and interaction delta results.
- **`findings`**: Rule violations with severity levels, deductions, remediation, and JSONB empirical evidence.
- **`reports`**: Synthesized summaries with category breakdowns and recommendations.
- **`users`**: User profiles with UUID primary keys.

### Useful Database Commands (in `backend/`):
```bash
# Apply pending migrations
npm run db:migrate

# Push schema directly to database (development)
npm run db:push

# Generate new migration files after modifying schema.ts
npm run db:generate

# Launch Drizzle Studio Web UI
npm run db:studio
```

---

## 🌐 Deployment Guide

### Backend Deployment on Render (Docker)

1. Connect your repository to [Render](https://render.com).
2. Configure as a **Web Service** with **Docker** environment:
   - **Root Directory**: `backend`
   - **Health Check Path**: `/health/live` *(Crucial: liveness probe avoids DB cold-start reboot loops)*
3. **Environment Variables**:
   ```ini
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<Your Cloud PostgreSQL Connection String>
   FRONTEND_URL=https://<your-frontend>.vercel.app
   MAX_CONCURRENT_SCANS=1
   ```
4. Render builds using `backend/Dockerfile` and automatically runs database migrations on startup.

---

### Frontend Deployment on Vercel

1. In the [Vercel Dashboard](https://vercel.com/), click **Add New...** → **Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://<your-render-backend>.onrender.com`
5. Click **Deploy**.

---

### Steps for Applying Future Updates to Already Deployed App

Since the project is already deployed on Render and Vercel:

#### 1. Push Code Changes to GitHub
Both Render and Vercel are configured with GitHub continuous deployment (auto-deploy on git push):
```bash
git add .
git commit -m "feat: your update message"
git push origin main
```

#### 2. Monitor Render Backend Deployment
1. Go to your **Render Dashboard** $\rightarrow$ `cybersentry-backend` service.
2. In the **Events / Logs** tab, watch the build process:
   - Docker pulls `mcr.microsoft.com/playwright:v1.63.0-jammy`.
   - `npm install` and `npm run build` execute.
   - The startup command runs `node dist/db/migrate.js && node dist/server.js`.
   - Render probes `GET /health/live` $\rightarrow$ receives `200 OK` $\rightarrow$ marks service **Live**.
3. *If new database migrations exist*: The startup script applies them automatically with its 5-attempt retry loop.

#### 3. Monitor Vercel Frontend Deployment
1. Go to your **Vercel Dashboard** $\rightarrow$ `cybersentry-frontend`.
2. In the **Deployments** tab, watch the Next.js build:
   - `next build` runs type checking and static generation (6/6 routes).
   - Once complete, the edge deployment updates instantly with zero downtime.

#### 4. Post-Deployment Smoke Test
1. Visit your live Vercel URL.
2. Verify the Topbar API Health badge displays green ("Online").
3. Submit a live public URL (e.g. `https://example.com` or a news portal).
4. Verify that:
   - The scan status transitions smoothly from `pending` to `scanning` to `completed`.
   - Score gauge and metrics render accurately.
   - "Export JSON" downloads the audit archive.
   - `/history` records the new scan.
   - `/compare` correctly accepts two scans.

---

## 🧮 Deterministic Scoring Algorithm

The **Privacy Transparency Score** begins at 100 points:

$$\text{Score} = \max\left(0, \min\left(100, 100 - \sum \text{Deductions}\right)\right)$$

### Evaluated Rules & Penalty Dimensions:
| Rule ID | Category | Severity | Deduction | Condition |
|---|---|:---:|:---:|---|
| `RULE_NO_BANNER` | Consent | High | -20 pts | No observable consent mechanism on landing |
| `RULE_NO_REJECT_BUTTON` | Consent | High | -15 pts | Banner lacks explicit rejection option |
| `RULE_ASYMMETRIC_CONSENT` | DarkPattern | Medium | -10 pts | Accept button visually emphasized over Reject |
| `RULE_PRESELECTED_OPTIONS` | DarkPattern | High | -15 pts | Non-essential tracking checkboxes default to enabled |
| `RULE_PRE_CONSENT_TRACKING` | Consent | Critical | -20 to -30 pts | Third-party ad trackers execute before user consent |
| `RULE_SESSION_REPLAY` | Trackers | Critical | -15 pts | Intrusive session recording scripts detected (Hotjar, etc.) |
| `RULE_AD_TRACKERS` | Trackers | High | -5 pts/domain | Known advertising trackers (capped at -25 pts) |
| `RULE_THIRD_PARTY_COOKIES` | Cookies | High | -5 pts/cookie | Third-party tracking cookies (capped at -25 pts) |
| `RULE_INSECURE_COOKIES` | Security | Medium | -2 pts/cookie | Cookies missing `Secure` or `HttpOnly` (capped at -15 pts) |
| `RULE_EXCESSIVE_EXPIRY` | Cookies | Low | -5 pts | Persistent cookies with lifespan > 365 days (capped at -10 pts) |

### Grade Scale:
- **A+ (90–100 pts)**: Pristine privacy posture; strictly necessary telemetry; equal choice architecture.
- **A (80–89 pts)**: Strong transparency; minimal non-essential scripts; compliant consent notice.
- **B (70–79 pts)**: Moderate tracking exposure; minor choice friction.
- **C (55–69 pts)**: Elevated privacy risk; pre-consent scripts or asymmetric buttons.
- **D (40–54 pts)**: High tracking exposure; pervasive third-party beacons.
- **F (0–39 pts)**: Critical privacy failure; unmitigated pre-consent tracking without user agency.

---

## 🛡️ Backend Runtime Reliability & Cloud Hardening

To ensure stable 24/7 operation on constrained cloud containers (Render 512MB RAM free tier), the backend implements six defensive engineering mechanisms:

1. **Decoupled Health Probes**:
   - `GET /health/live`: Probed by Render; returns HTTP 200 directly from Express memory without touching the database.
   - `GET /health/ready`: Probed by load balancers; verifies PostgreSQL connectivity (`SELECT 1;`), returning 503 if down.
2. **PostgreSQL Pool Error Handling**:
   - Registered `pool.on("error")` listener intercepts idle TCP socket drops without crashing the process.
   - Bounded connection pool: `max: 5`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 10000`.
3. **Fail-Fast Crash Policy**:
   - Domain-level errors (navigation timeouts, DNS failures) are caught in services, marked as `failed` in PostgreSQL, and handled gracefully.
   - Unexpected uncaught exceptions (`uncaughtException`, `unhandledRejection`) log diagnostics, close the pool, and terminate with `process.exit(1)`, enabling container self-healing.
4. **Strict Concurrency Control (`MAX_CONCURRENT_SCANS=1`)**:
   - Only 1 scan runs at a time to prevent memory exhaustion; concurrent requests receive immediate `HTTP 429 Too Many Requests`.
   - The active counter is decremented inside a `finally` block to prevent counter leakage.
5. **Deterministic Browser Recycling**:
   - Chromium restarts automatically after every 5 scans (`MAX_SCANS_BEFORE_RECYCLE = 5`) to prevent memory leaks.
   - Shuts down Chromium after 5 minutes of inactivity (`scheduleIdleClose`).
6. **Route-Level Media Aborting**:
   - Blocks images, media, and fonts, lowering Chromium RAM footprint from ~450MB down to ~140MB (**68% reduction**).

---

## 🧪 Testing & Quality Assurance

### Privacy Analysis Engine Unit Tests
Run with:
```bash
npm run test:analyzer # in backend/
```

**Verified Scenarios (8 of 8 Passing)**:
1. `Test 1`: Known tracker identification & categorization.
2. `Test 2`: Unknown third-party domains safely categorized as `Other` (no false accusations).
3. `Test 3`: First-party vs. third-party root domain resolution (`eTLD+1`).
4. `Test 4`: Semantic cookie categorization (essential, analytics, advertising, functional).
5. `Test 5`: Pre-consent tracking violation detection with critical severity.
6. `Test 6`: Consent banner detection, missing reject buttons, and dark patterns.
7. `Test 7`: Missing evidence handled gracefully without false compliances (80/100, Grade A).
8. `Test 8`: Configurable scoring weights override defaults.

---

## 📚 Interview & Viva Preparation Resources

Complete, authoritative documentation is provided in the [`docs/`](docs/) directory:

- **[`docs/INTERVIEW_PREPARATION_GUIDE.md`](docs/INTERVIEW_PREPARATION_GUIDE.md)**: 28-section master guide covering ideation, system design, UML/DFD/ER analysis, file-by-file code breakdowns, 100 rapid-fire questions, 75 deep grilling questions, follow-up trees, live demo script, and claims NOT to make.
- **[`docs/INTERVIEW_CHEAT_SHEET.md`](docs/INTERVIEW_CHEAT_SHEET.md)**: Ultra-dense summary sheet for last-minute revision covering architecture, 9 entities, 5 categories, weights, API endpoints, reliability fixes, security, and limitations.
- **[`docs/MOCK_INTERVIEW.md`](docs/MOCK_INTERVIEW.md)**: 3-round 65-question mock interview simulator with model answers, expected follow-ups, and evaluation criteria.
- **[`docs/DESIGN_TRACEABILITY_REPORT.md`](docs/DESIGN_TRACEABILITY_REPORT.md)**: Full design-to-code traceability verifying all 8 conceptual system diagrams against the implementation.

---

## ⚖️ Regulatory & Legal Framework Alignment

CyberSentry is architected around international data protection frameworks:

- **GDPR (Regulation (EU) 2016/679)**:
  - *Article 4(11)*: Freely given, specific, informed, and unambiguous consent.
  - *Article 7(3)*: Withdrawing consent must be as effortless as giving it.
- **ePrivacy Directive (Directive 2002/58/EC)**:
  - *Article 5(3)*: Prior informed consent requirement for storing or accessing information on terminal equipment.
- **European Data Protection Board (EDPB) Guidelines**:
  - Prohibition of deceptive countdown timers, hidden refusal links, and choice asymmetry.
- **California Consumer Privacy Act (CCPA / CPRA)**:
  - Do Not Sell or Share My Personal Information transparency.

> **Disclaimer**: CyberSentry provides automated, empirical privacy indicators based strictly on observable client-side website behaviour. It does not provide formal legal advice or statutory regulatory compliance certification.

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

Developed by **Bhavesh** for Academic Engineering and Web Privacy Transparency.
