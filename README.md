# 🛡️ CyberSentry

> **Explainable Cookie Consent and Web Tracking Transparency Platform**  
> Audit websites for stealth third-party trackers, pre-consent violations, dark patterns, and cookie security flags with deterministic, evidence-based proofs.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.47-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.33-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Tests: 20/20 Passing](https://img.shields.io/badge/Tests-20%2F20%20Passing-brightgreen.svg)](https://github.com/bhavesh-ashrith-alemela/CyberSentry)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Why CyberSentry?](#-why-cybersentry)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started Locally](#-getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Deployment Guide](#-deployment-guide)
  - [Deploy Backend on Render](#deploy-backend-on-render)
  - [Deploy Frontend on Vercel](#deploy-frontend-on-vercel)
- [Deterministic Scoring Algorithm](#-deterministic-scoring-algorithm)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Regulatory & Legal Framework Alignment](#-regulatory--legal-framework-alignment)
- [License](#-license)

---

## 🌟 Overview

**CyberSentry** is an open-source, full-stack cybersecurity and web privacy platform that demystifies modern web tracking. 

When a user visits a website, dozens of third-party advertising trackers, fingerprinting scripts, and tracking cookies often execute in the background—frequently before the user has even read or interacted with the consent banner. Many consent banners employ **deceptive choice architecture (dark patterns)** to nudge visitors into accepting surveillance.

CyberSentry launches an isolated, headless Chromium browser, captures client-side network telemetry and storage events in real time, audits consent banner interfaces, and calculates an **Explainable Privacy Transparency Score (0–100)** with empirical, mathematically bounded evidence.

---

## 🎯 Why CyberSentry?

1. **Zero Black-Box AI / LLM Hallucinations**: Every deduction, rule violation, and score deduction is computed through strictly deterministic, reproducible algorithms backed by recorded HTTP requests, DOM structures, and cookie storage states.
2. **Empirical Evidence Chains**: Findings are accompanied by raw technical proof (request URLs, cookie attributes, selector bounding boxes, timestamps) stored in PostgreSQL.
3. **Multi-Layer Defensive Security**: Protected by an exhaustive Server-Side Request Forgery (SSRF) defense engine blocking private subnets, cloud metadata endpoints, loopbacks, and DNS rebinding attacks.
4. **Editorial Swiss Design**: Built with a clean, typography-first, minimalist aesthetic inspired by modern design systems, offering high readability across desktop, tablet, and mobile viewports.

---

## ✨ Key Features

- **🌐 Real-Time Headless Browser Crawling**: Spawns ephemeral, incognito Chromium instances via Playwright with automatic media blocking for lightning-fast audits.
- **🍪 Cookie Lifecycle & Flag Auditing**:
  - Differentiates first-party vs. third-party cookies using root domain matching (`eTLD+1`).
  - Checks security flags: `Secure`, `HttpOnly`, and `SameSite` attributes.
  - Flags excessive expiration lifespans exceeding regulatory thresholds (> 365 days).
- **📡 Third-Party Tracker Classification**:
  - Maps outbound network requests to known tracker entities (Advertising, Analytics, Fingerprinting, Social Widgets, CDNs).
  - Identifies parent entities (Google LLC, Meta Platforms, Amazon, Microsoft, Criteo, Hotjar, Cloudflare).
- **⚖️ Consent Banner & Dark Pattern Heuristics**:
  - Detects Consent Management Platforms (CMPs) including OneTrust, Cookiebot, Didomi, Quantcast, Klaro, and custom banners.
  - Audits **Choice Asymmetry** (e.g., prominent "Accept All" button with "Reject" buried in secondary preferences).
  - Performs controlled automated interaction tests to record telemetry before and after consent.
- **📊 Comprehensive Privacy Reports**:
  - Circular SVG transparency score gauge with letter grades (`A` to `F`).
  - Outbound tracker request distribution bar chart (Recharts).
  - Filterable cookie ledger with search, category filtering, and third-party isolation.
  - Actionable technical recommendations for web developers and site operators.
  - Educational guidance glossary explaining complex compliance terminology in plain language.
- **🔄 Side-by-Side Audit Comparison**:
  - Compares two scans of the same or different websites.
  - Calculates score deltas, cookie changes, tracker changes, and differential findings (added vs. resolved).
  - Includes contextual evaluation guidance notices to ensure objective interpretation.
- **📜 Persistent Audit History**:
  - Searchable domain index with instant filtering.
  - Multi-select comparative drawer allowing users to pick two historical scans and launch a comparison.
- **📄 Export Functionality**:
  - **Export JSON**: One-click download of full structured telemetry and findings.
  - **Print / PDF**: Custom `@media print` styling that hides navigation and buttons for official PDF reporting.

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
│ (React, TypeScript, Tailwind, Canvas)│            │
└──────────────────┬───────────────────┘            │
                   │                                │
                   │ 2. REST API Requests           │
                   │    (POST /scans, GET /report)  │
                   ▼                                │
┌───────────────────────────────────────────────────┴───────────────┐
│                    Render Cloud Web Service                       │
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
│  │  - Network Request Listener  - Cookie Store Ledger          │  │
│  │  - CMP DOM Inspector         - Controlled Interaction Test  │  │
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

## 💻 Technology Stack

| Layer | Technology | Key Choice Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | Server-side rendering, optimized bundle sizes, dynamic client-side route caching. |
| **Frontend Styling** | **Tailwind CSS** | Zero runtime overhead, precise design system tokens, seamless dark/light control. |
| **Data Visualization** | **Recharts** | Declarative SVG bar charts with responsive containers and custom tooltips. |
| **Backend Framework** | **Node.js 20 + Express** | Robust asynchronous event loop, mature middleware ecosystem, high I/O throughput. |
| **Browser Engine** | **Playwright Chromium** | Full CDP network interception, modern consent DOM evaluation, ephemeral context isolation. |
| **ORM & Query Builder** | **Drizzle ORM** | Zero overhead, type-safe SQL, automatic schema migrations, and fast relational joins. |
| **Database** | **PostgreSQL 16+** | Relational integrity, ACID compliance, JSONB support for raw evidence storage. |
| **Input Validation** | **Zod** | End-to-end type safety, runtime schema enforcement for URLs and API payloads. |

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
│   │   │   └── trackerDb.ts        # Known tracker domain registry
│   │   ├── config/                 # Environment validation (Zod)
│   │   ├── controllers/            # Request handlers (scans, health)
│   │   ├── db/                     # Drizzle schema, connection pool & migrations
│   │   │   ├── index.ts            # PostgreSQL pool configuration
│   │   │   ├── migrate.ts          # Resilient migration runner
│   │   │   └── schema.ts           # Relational table definitions
│   │   ├── middlewares/            # Error handling, request logging
│   │   ├── repositories/           # Database data access layer
│   │   ├── routes/                 # Express API route declarations
│   │   ├── scanner/                # Playwright headless browser engine
│   │   │   ├── bannerDetector.ts   # CMP detection & choice asymmetry audit
│   │   │   ├── browser.ts          # Singleton browser lifecycle manager
│   │   │   ├── consentTester.ts    # Automated button click interaction
│   │   │   └── scannerEngine.ts    # Main page navigation & telemetry orchestrator
│   │   ├── services/               # SSRF validation, scan orchestration
│   │   ├── server.ts               # Express server entry point (PORT/HOST binding)
│   │   └── test-comprehensive.ts   # 20-scenario exhaustive verification test suite
│   ├── Dockerfile                  # Production containerfile (Playwright Jammy base)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── layout.tsx          # Root layout with Navbar and Footer
│   │   │   ├── page.tsx            # Homepage with scan console and preview
│   │   │   ├── globals.css         # Swiss typography, focus rings & print styles
│   │   │   ├── history/page.tsx    # Persistent audit history table
│   │   │   ├── compare/page.tsx    # Side-by-side comparative analysis
│   │   │   └── scan/[id]/page.tsx  # Dynamic scan status & full privacy report
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ConsentCard.tsx     # Choice architecture audit card
│   │   │   ├── CookieTable.tsx     # Stored cookie ledger with security flags
│   │   │   ├── EducationalGuidance.tsx # Plain-language compliance glossary
│   │   │   ├── FindingsList.tsx    # Evidence-based findings with remediation
│   │   │   ├── Footer.tsx          # Legal disclaimer & academic footer
│   │   │   ├── MetricsGrid.tsx     # Key telemetry metric tiles
│   │   │   ├── Navbar.tsx          # Sticky header with mobile drawer & status pill
│   │   │   ├── ScoreGauge.tsx      # SVG circular score meter
│   │   │   ├── StatusStepper.tsx   # Live scan progress timeline
│   │   │   └── TrackerChart.tsx    # Recharts outbound telemetry bar chart
│   │   └── lib/                    # API client, TypeScript types, formatters
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── render.yaml                     # Render Blueprint infrastructure definition
└── README.md                       # Official documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js**: v18.17.0+ or v20.x
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
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your local PostgreSQL connection string:
   ```ini
   NODE_ENV=development
   PORT=5001
   HOST=0.0.0.0
   DATABASE_URL=postgresql://postgres:password@localhost:5432/cybersentry
   FRONTEND_ORIGIN=http://localhost:3000
   PLAYWRIGHT_HEADLESS=true
   SCAN_TIMEOUT_MS=30000
   ```

5. **Initialize PostgreSQL Database & Apply Migrations**:
   Ensure PostgreSQL is running, create the `cybersentry` database, and run:
   ```bash
   npm run db:migrate
   ```

6. **Start Backend Development Server**:
   ```bash
   npm run dev
   ```
   The backend API will start on **`http://localhost:5001`**. Verify at `http://localhost:5001/api/health`.

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
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
   ```

4. **Start Frontend Development Server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser.

---

## 🗄️ Database Schema & Migrations

CyberSentry uses Drizzle ORM to maintain strict relational integrity across 9 primary entities:

- **`websites`**: Deduplicated domains and target URLs.
- **`scans`**: Historical audit instances, scores, grades, durations, and statuses (`pending`, `scanning`, `analyzing`, `completed`, `failed`).
- **`cookies`**: Granular cookie records (name, domain, expiration, `isSecure`, `isHttpOnly`, `sameSite`, `isThirdParty`).
- **`network_requests`**: Intercepted HTTP telemetry, methods, resources, and classification.
- **`trackers`**: Identified third-party trackers with company ownership.
- **`consent_banners`**: Detected CMP metadata, buttons, and interaction delta results.
- **`findings`**: Rule violations with severity levels, point deductions, and JSONB empirical evidence.

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

CyberSentry is designed for independent, decoupled deployment:
- **Backend API & PostgreSQL** on [Render](https://render.com)
- **Frontend Dashboard** on [Vercel](https://vercel.com)

---

### Deploy Backend on Render

#### Option A: 1-Click Blueprint Deployment (Recommended)
1. Push your code to your GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com/), click **Blueprints** → **New Blueprint Instance**.
3. Connect your repository. Render will detect [`render.yaml`](file:///Users/bhavesh/Downloads/Bhavesh%20windows/Mini-Project/CyberSentry/render.yaml) and automatically provision both the Web Service and PostgreSQL database.

#### Option B: Manual Web Service Setup
1. **Create PostgreSQL Database on Render**:
   - **Name**: `cybersentry-db`
   - **Database**: `cybersentry`
   - **User**: `cybersentry`
   - **Plan**: Free
   - Copy the **Internal Database URL** once provisioned.

2. **Create Web Service on Render**:
   - **Name**: `cybersentry-backend`
   - **Root Directory**: `backend` *(Crucial: monorepo configuration)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx playwright install --with-deps chromium && npm run build
     ```
   - **Start Command**:
     ```bash
     node dist/db/migrate.js && node dist/server.js
     ```
   - **Health Check Path**: `/api/health`
   - **Environment Variables**:
     ```ini
     NODE_ENV=production
     HOST=0.0.0.0
     PORT=10000
     DATABASE_URL=<Your Render PostgreSQL Internal Database URL>
     FRONTEND_ORIGIN=https://<your-vercel-app>.vercel.app
     PLAYWRIGHT_HEADLESS=true
     SCAN_TIMEOUT_MS=30000
     ```

---

### Deploy Frontend on Vercel

1. In the [Vercel Dashboard](https://vercel.com/), click **Add New...** → **Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`**.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: Set to your Render backend URL:
     ```
     https://cybersentry-backend.onrender.com
     ```
5. Click **Deploy**. Vercel will build and deploy the Next.js frontend globally on its Edge network.

---

## 🧮 Deterministic Scoring Algorithm

The **Privacy Transparency Score** is calculated out of 100 points:

$$\text{Score} = \max\left(0, 100 - \sum \text{Deductions}\right)$$

### Penalty Dimensions & Weights:
| Category | Evaluated Conditions | Penalty Range | Category Cap |
|---|---|---|---|
| **Pre-Consent Violations** | Third-party requests or cookies deposited prior to consent | -15 to -20 pts | 35 pts |
| **Dark Patterns & Choice Asymmetry** | Prominent "Accept" with hidden or missing "Reject" button | -15 to -25 pts | 30 pts |
| **Third-Party Trackers** | Known advertising, analytics, and fingerprinting domains | -4 pts per tracker | 25 pts |
| **Insecure Storage** | Cookies missing `Secure` or `HttpOnly` flags | -2 to -4 pts each | 15 pts |
| **Excessive Lifespan** | Persistent cookies configured with lifespan > 365 days | -2 pts each | 10 pts |
| **Missing Consent Notice** | No observable CMP or privacy declaration on landing | -20 pts | 20 pts |

### Grade Distribution:
- **Grade A (90–100 pts)**: Excellent privacy posture; minimal or strictly necessary cookies; equal-prominence refusal.
- **Grade B (80–89 pts)**: Good transparency; minor non-essential tracking with compliant consent dialogs.
- **Grade C (70–79 pts)**: Moderate tracking exposure; minor choice friction or unflagged cookies.
- **Grade D (55–69 pts)**: High privacy risk; pre-consent telemetry or asymmetric consent buttons.
- **Grade F (0–54 pts)**: Severe tracking exposure; pervasive third-party beacons without consent mechanisms.

---

## 🧪 Testing & Quality Assurance

CyberSentry includes an automated 20-scenario verification test suite:

```bash
# In backend directory:
npm run test:comprehensive
```

### Verified Scenarios:
1. Valid public website URL end-to-end crawl.
2. Invalid URL format rejection (Zod schema).
3. Empty and whitespace URL rejection.
4. Unsupported schemes (`ftp://`, `file://`, `gopher://`).
5. Private & loopback IP blocking (SSRF defense).
6. Website navigation timeout handling & cleanup.
7. Unresolvable DNS domain rejection.
8. Zero-cookie website resilience.
9. Third-party request mapping to tracker entities.
10. Consent banner affirmative detection.
11. Missing consent banner penalty enforcement.
12. Failed scan status persistence in PostgreSQL.
13. Report retrieval status codes (`200`, `400`, `404`).
14. Scan history pagination and domain filtering.
15. Side-by-side scan comparison analysis.
16. Database connection resilience & zero credential leaks.
17. Frontend API client connection error wrapping.
18. Mobile responsiveness & 320px viewport constraints.
19. Incomplete scan evidence graceful fallback.
20. Repeated scan deduplication across shared website entities.

---

## ⚖️ Regulatory & Legal Framework Alignment

CyberSentry is architected around established international data protection regulations:

- **GDPR (Regulation (EU) 2016/679)**:
  - *Article 4(11)*: Freely given, specific, informed, and unambiguous consent.
  - *Article 7(3)*: Withdrawing consent must be as effortless as giving it.
- **ePrivacy Directive (Directive 2002/58/EC)**:
  - *Article 5(3)*: Prior informed consent requirement for storing or accessing information on terminal equipment.
- **European Data Protection Board (EDPB) Guidelines**:
  - Rejection of deceptive countdown timers, hidden refusal links, and choice asymmetry.
- **California Consumer Privacy Act (CCPA / CPRA)**:
  - Do Not Sell or Share My Personal Information transparency.

> **Disclaimer**: CyberSentry provides automated, empirical privacy indicators based strictly on observable client-side website behaviour. It does not provide formal legal advice or statutory regulatory compliance certification.

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

Developed by **Bhavesh** for Academic Engineering and Web Privacy Transparency.
