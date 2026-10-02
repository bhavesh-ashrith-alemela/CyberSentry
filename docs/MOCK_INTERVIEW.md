# CyberSentry — Complete 3-Round Mock Interview Guide

> **Document Purpose**: Realistic Mock Interview Simulator with Model Answers, Expected Follow-ups, and Rigorous Evaluation Criteria.  
> **Structure**:  
> • **Round 1**: Project Ideation, HR, and Motivation (15 Questions)  
> • **Round 2**: Technical Implementation & Engineering (25 Questions)  
> • **Round 3**: Deep Systems Architecture, Reliability & Scalability (25 Questions)

---

## 🎯 ROUND 1: Project Ideation, HR & Motivation (15 Questions)

### Q1.1: Tell me about your project in simple words.
* **Model Answer**: "CyberSentry is an automated website privacy audit platform. You input a URL, and our server spins up an isolated headless Chromium browser that inspects the site just like a real user. It detects what companies are tracking you, checks whether the cookie banner actually gives you a choice or hides the reject button, and produces an explainable 0–100 score and letter grade with an exact checklist of what to fix."
* **Expected Follow-up**: "Who would pay for or use this tool?"
* **Evaluation Criteria**: Demonstrates clear communication without getting bogged down in jargon; defines problem, solution, and outcome naturally.

### Q1.2: What motivated you to choose this specific problem?
* **Model Answer**: "I noticed a huge disconnect between GDPR privacy laws and actual web practices. Sites show cookie banners to appear compliant, but if you inspect the network tab, dozens of ad trackers have already executed before you even read the banner. I wanted to build an objective tool that exposes this 'consent theater' with empirical evidence."
* **Expected Follow-up**: "Aren't ad blockers already doing this?"
* **Evaluation Criteria**: Articulates a clear problem statement; distinguishes between client protection (ad blockers) and independent transparency auditing.

### Q1.3: What was the biggest personal challenge you faced while building CyberSentry?
* **Model Answer**: "Managing headless Chromium memory on a cloud container with only 512MB RAM. Chromium is notorious for memory leaks. Early on, the container would crash with OOM errors during heavy crawls. I had to research and implement route-level media aborts to drop image transfers, enforce a single-scan concurrency ceiling, and implement proactive browser recycling every 5 scans."
* **Expected Follow-up**: "How did you measure the 68% memory reduction?"
* **Evaluation Criteria**: Shows engineering ownership, problem-solving maturity, and quantitative validation rather than vague generalities.

### Q1.4: Did you work on this alone or in a team? What was your specific role?
* **Model Answer**: "I led the core full-stack implementation: designing the decoupled architecture, building the Playwright crawling engine, implementing the multi-layer SSRF security service, writing the 10-dimension deterministic scoring engine, and developing the Next.js 14 frontend dashboard." *(Tailor based on your actual role)*.
* **Expected Follow-up**: "Which of those components took the longest to build?"
* **Evaluation Criteria**: Demonstrates clear accountability and ability to explain the inner workings of claimed components.

### Q1.5: Why did you build a web application instead of a Chrome extension?
* **Model Answer**: "A web platform provides centralized, reproducible auditing. An extension inherits the user's existing cookies, browser cache, and extensions, which skews audit results. CyberSentry launches an ephemeral, incognito Chromium context with an empty cookie jar every time, ensuring clean-slate audits and shareable permanent report URLs."
* **Expected Follow-up**: "Isn't running headless browsers on a server much more expensive than client-side extensions?"
* **Evaluation Criteria**: Explains architectural trade-offs between clean-slate reproducibility and server compute costs.

### Q1.6: How did you prioritize which features to build first?
* **Model Answer**: "I followed a tracer-bullet approach: first establishing the core data pipeline—URL in, headless browser crawl, cookie capture, database write, and basic frontend display. Once the end-to-end flow worked, I layered in SSRF defense, CMP dark pattern heuristics, deterministic scoring rules, and comparative analysis."
* **Expected Follow-up**: "What feature did you have to cut due to time constraints?"
* **Evaluation Criteria**: Demonstrates agile development discipline and incremental value delivery.

### Q1.7: What did this project teach you about web security?
* **Model Answer**: "It gave me deep respect for Server-Side Request Forgery (SSRF). When your server accepts arbitrary user URLs and fetches them with a browser, you are effectively giving the public a proxy into your internal network. I learned to implement defense in depth: DNS pre-flight checks, CIDR range validation, and real-time route redirect guards."
* **Expected Follow-up**: "Can an attacker bypass your DNS check using DNS rebinding?"
* **Evaluation Criteria**: Shows awareness of real-world attack vectors and practical defense mechanisms.

### Q1.8: What was a technical decision you made that you later regretted or had to refactor?
* **Model Answer**: "Initially, I attempted to keep Node.js alive after uncaught exceptions by suppressing them with `console.error`. I thought it would maximize uptime. In reality, it left the process in a corrupt, memory-leaked state until the container died. I refactored it to a fail-fast crash model: catching domain errors gracefully, but exiting with `process.exit(1)` on unexpected errors so Render could restart a clean container."
* **Expected Follow-up**: "What is the difference between an operational error and a programmer error?"
* **Evaluation Criteria**: Demonstrates humility, learning from mistakes, and understanding Node.js runtime best practices.

### Q1.9: How do you handle feedback or criticism about your project's limitations?
* **Model Answer**: "I embrace transparency. CyberSentry is an engineering transparency tool that audits observable technical signals, not a licensed legal compliance certification. When people point out that we don't bypass Cloudflare CAPTCHAs or support multi-page crawling, I document those as clear boundaries and future enhancements rather than making false claims."
* **Expected Follow-up**: "How would you explain that limitation to an executive?"
* **Evaluation Criteria**: Demonstrates integrity, professional maturity, and objective self-assessment.

### Q1.10: Why did you avoid using Large Language Models (LLMs) for the scoring engine?
* **Model Answer**: "Because compliance auditing requires mathematical explainability, reproducibility, and zero hallucinations. If a website scores 72 today, it must score 72 tomorrow given identical telemetry. LLMs are non-deterministic, have token latency and cost, and can hallucinate violations. Our deterministic rule engine is instant, free to run, and 100% auditable."
* **Expected Follow-up**: "Is there any place in this project where an LLM would make sense?"
* **Evaluation Criteria**: Demonstrates critical thinking against hype; uses the right tool for the job.

### Q1.11: How did you ensure your UI was intuitive for non-technical users?
* **Model Answer**: "By following the principle of progressive disclosure: showing the most important high-level information first (the 0–100 score gauge and letter grade), followed by categorical health bars, and only revealing raw JSON evidence and technical remediation steps when an accordion item is expanded."
* **Expected Follow-up**: "Did you test this on any real users?"
* **Evaluation Criteria**: Demonstrates empathy for user experience and information hierarchy design.

### Q1.12: What was the most interesting dark pattern you uncovered during testing?
* **Model Answer**: "Choice asymmetry on major media websites. The 'Accept All' button was a giant, high-contrast primary button, while 'Reject' was completely absent from the first screen. To reject cookies, a user had to click 'Manage Settings', which opened a modal with 15 pre-selected vendor categories that had to be manually toggled off one by one."
* **Expected Follow-up**: "How does CyberSentry score that specific behavior?"
* **Evaluation Criteria**: Connects real-world observations directly to codebase rule deductions (`RULE_ASYMMETRIC_CONSENT`, `RULE_PRESELECTED_OPTIONS`).

### Q1.13: How did you manage project deadlines and scope?
* **Model Answer**: "By defining strict scope boundaries early. I treated deep multi-page crawling and user authentication as future roadmap items, focusing 100% of my energy on perfecting single-page telemetry interception, reliable browser cleanup, and deterministic scoring."
* **Expected Follow-up**: "How would you estimate the effort required to add multi-page crawling?"
* **Evaluation Criteria**: Demonstrates scope discipline and ability to estimate technical complexity.

### Q1.14: Where do you see web privacy heading in the next 3 to 5 years?
* **Model Answer**: "With Google phasing out third-party cookies and privacy regulations tightening globally, tracking is shifting toward first-party data collection, server-side tagging, and browser fingerprinting. Auditing tools will need to evolve beyond simple cookie inspection to analyze canvas hashes, WebGL contexts, and server-side egress."
* **Expected Follow-up**: "Can CyberSentry detect canvas fingerprinting today?"
* **Evaluation Criteria**: Demonstrates domain knowledge and strategic foresight.

### Q1.15: If you had another month to work on this, what would you build next?
* **Model Answer**: "I would decouple the scanner into a distributed worker queue using BullMQ and Redis. That would allow CyberSentry to scale horizontally across multiple worker containers, eliminating the single-scan concurrency ceiling and supporting scheduled weekly monitoring with email drift alerts."
* **Expected Follow-up**: "Why Redis specifically for the queue?"
* **Evaluation Criteria**: Articulates a clear, technically realistic scaling vision.

---

## 💻 ROUND 2: Technical Implementation & Engineering (25 Questions)

### Q2.1: Explain the step-by-step lifecycle of a scan request.
* **Model Answer**: "The user submits a URL on Next.js. `POST /api/scans` hits Express. Zod validates the input format, and `ssrfService` checks protocol, hostname, and resolves DNS to block private IPs. `scanService` creates a `pending` row in PostgreSQL and returns HTTP 201 in $<50\text{ms}$. The frontend redirects to `/scan/[id]` and polls every 1.5s. Asynchronously, `processScanJob` launches Playwright, sets up route aborts, navigates to the page, intercepts network requests and cookies, runs CMP detection, and tests consent. `scorer.ts` evaluates the 10 rules, and `scanRepository` commits all results atomically to PostgreSQL. The next frontend poll receives `completed` and fetches the full report."
* **Expected Follow-up**: "What happens if the browser crashes halfway through that lifecycle?"
* **Evaluation Criteria**: Demonstrates thorough understanding of the end-to-end data pipeline, state machine, and error boundaries.

### Q2.2: Why does the route media aborter improve performance so drastically?
* **Model Answer**: "When scraping modern sites, images, video ads, and custom fonts make up over 70% of network payload bytes and consume significant Chromium heap memory for bitmap decoding and VRAM caching. Aborting `image`, `media`, and `font` resource types at the Playwright route layer eliminates network download latency and reduces peak memory from ~450MB to ~140MB without impacting tracker script execution or cookie headers."
* **Expected Follow-up**: "Could aborting fonts break visual banner detection?"
* **Evaluation Criteria**: Explains browser rendering mechanics, memory allocation, and performance trade-offs.

### Q2.3: How do you differentiate a first-party cookie from a third-party cookie?
* **Model Answer**: "We use root domain extraction based on public suffix rules (`extractRootDomain`). We clean the hostname, strip leading dots and ports, and identify multi-part ccTLDs like `.co.uk` or `.com.au`. If the cookie domain's root matches the target site's root domain, it is first-party; otherwise, it is flagged as third-party."
* **Expected Follow-up**: "What if the target is `blog.example.com` and the cookie is set on `.example.com`?"
* **Evaluation Criteria**: Understands eTLD+1 logic, cookie scoping, and public suffix list mechanics.

### Q2.4: How does CyberSentry detect Consent Management Platforms (CMPs)?
* **Model Answer**: "In `bannerDetector.ts`, we maintain a signature catalog of major commercial CMPs. We evaluate the DOM for specific ID and class selectors, such as `#onetrust-banner-sdk` for OneTrust, `#CybotCookiebotDialog` for Cookiebot, and `.cmplz-cookiebanner` for Complianz. If no known CMP matches, we evaluate generic semantic selectors matching `role='dialog'`, `aria-label*='cookie'`, and button text patterns."
* **Expected Follow-up**: "What if the banner is rendered inside a shadow DOM or iframe?"
* **Evaluation Criteria**: Demonstrates knowledge of DOM querying, CMP architecture, and selector heuristics.

### Q2.5: What are the 10 deterministic scoring rules?
* **Model Answer**: "1. `RULE_NO_BANNER` (-20, Consent), 2. `RULE_BANNER_FOUND` (0, Info), 3. `RULE_NO_REJECT_BUTTON` (-15, Consent), 4. `RULE_ASYMMETRIC_CONSENT` (-10, DarkPattern), 5. `RULE_PRESELECTED_OPTIONS` (-15, DarkPattern), 6. `RULE_PRE_CONSENT_TRACKING` (-20 to -30, Consent), 7. `RULE_SESSION_REPLAY` (-15, Trackers), 8. `RULE_AD_TRACKERS` (-5/domain max 25, Trackers), 9. `RULE_THIRD_PARTY_COOKIES` (-5/cookie max 25, Cookies), 10. `RULE_INSECURE_COOKIES` (-2/cookie max 15, Security), plus `RULE_EXCESSIVE_EXPIRY` (-5, Cookies)."
* **Expected Follow-up**: "How is the final score bounded?"
* **Evaluation Criteria**: Knows exact rule IDs, deduction points, categories, and clamping behavior ($\max(0, \min(100, 100 - \sum \text{Deductions}))$).

### Q2.6: How do you calculate the category percentages shown on the frontend?
* **Model Answer**: "The 5 presentation categories have fixed baseline point weights: Tracking Transparency (25pts), Consent Integrity (30pts), Security Posture (15pts), User Control (20pts), and Education & Clarity (10pts). When findings are generated, we sum deductions in each category and calculate: $\text{Category Pct} = \text{round}(((W - \text{Deductions}) / W) \times 100)$, clamped between 10% and 100%."
* **Expected Follow-up**: "Why clamp the minimum score at 10% on the UI?"
* **Evaluation Criteria**: Explains mathematical mapping from rule deductions to visual progress bars in `page.tsx`.

### Q2.7: What is the purpose of `trackerDb.ts`?
* **Model Answer**: "It is an in-memory knowledge base containing curated definitions of known ad tech, analytics, social, and session replay domains (DoubleClick, Google Analytics, Criteo, Hotjar, Meta Pixel). It maps hostnames to categories, company owners, and risk levels. In-memory hash lookups take microseconds, avoiding hundreds of database queries during a single scan."
* **Expected Follow-up**: "How do you handle a domain that is NOT in `trackerDb.ts`?"
* **Evaluation Criteria**: Demonstrates knowledge of caching, performance optimization, and conservative classification.

### Q2.8: How do you prevent SQL injection when storing scan findings?
* **Model Answer**: "We use Drizzle ORM, which generates parameterized SQL queries under the hood. All string values, UUIDs, and JSONB payloads are passed as bound parameters rather than concatenated raw SQL strings, completely preventing SQL injection."
* **Expected Follow-up**: "Have you ever needed to write raw SQL in Drizzle?"
* **Evaluation Criteria**: Understands parameterized queries and ORM query compilation.

### Q2.9: What happens if a target website has an infinite redirect loop?
* **Model Answer**: "Playwright's `page.goto` has a strict 30,000ms navigation timeout. When the redirect limit or timeout is exceeded, Playwright throws an exception. `scannerEngine` catches it, sets `status = 'failed'` with the error message in PostgreSQL, and closes the browser context cleanly in the `finally` block."
* **Expected Follow-up**: "Does that exception crash Express?"
* **Evaluation Criteria**: Explains exception boundaries and resource cleanup under adverse network conditions.

### Q2.10: Why did you separate `/health/live` and `/health/ready`?
* **Model Answer**: "To prevent deployment reboot loops. `/health/live` only checks that Express is responsive and returns HTTP 200 without touching PostgreSQL. Render probes this endpoint. `/health/ready` executes `SELECT 1;` against PostgreSQL and returns 503 if down. If Render probed the database check and PostgreSQL had a 5-second cold start, Render would kill and restart the container infinitely."
* **Expected Follow-up**: "What does the frontend health badge probe?"
* **Evaluation Criteria**: Masterful explanation of container orchestration, probing semantics, and cold-start resilience.

### Q2.11: How does the client-side polling loop work in Next.js?
* **Model Answer**: "Inside `useEffect`, we set a 1500ms `setInterval`. Every tick calls `api.getScanStatus(scanId)`. If `status === 'completed'`, it clears the interval and calls `fetchCompletedReportData()`. If `status === 'failed'`, it clears the interval and sets the error banner. The effect cleanup function clears the interval and sets an `isMounted` flag to false to prevent state updates on unmounted components."
* **Expected Follow-up**: "Why not use SWR or React Query?"
* **Evaluation Criteria**: Demonstrates mastery of React component lifecycle, timers, and cleanup routines.

### Q2.12: How does the JSON export button work?
* **Model Answer**: "It bundles the current scan, report, cookies, trackers, findings, and banner state into an object, converts it to JSON via `JSON.stringify(payload, null, 2)`, creates a Blob of type `application/json`, creates an Object URL via `URL.createObjectURL(blob)`, assigns it to a hidden `<a>` element with a `download` attribute, clicks it, and immediately revokes the URL."
* **Expected Follow-up**: "Why revoke the Object URL?"
* **Evaluation Criteria**: Understands browser DOM APIs, memory management with Blobs, and file downloads.

### Q2.13: How does print-to-PDF work on `/scan/[id]`?
* **Model Answer**: "It invokes `window.print()`. In `globals.css`, we defined `@media print` rules: hiding the desktop sidebar, mobile header, back buttons, and export buttons (`display: none`), while formatting cards with clean borders, removing box shadows, and enforcing page-break rules so the report prints cleanly as an executive PDF."
* **Expected Follow-up**: "Did you encounter any issues with Recharts printing?"
* **Evaluation Criteria**: Demonstrates understanding of responsive print stylesheets and media queries.

### Q2.14: What is SSRF and how did you prevent it?
* **Model Answer**: "SSRF allows an attacker to make the server request internal resources. In `ssrfService.ts`, we validate that protocol is HTTP/HTTPS, reject hostnames like `localhost`, resolve the domain's IP via `dns.lookup`, and verify that the IP is not in loopback (`127.0.0.0/8`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), or cloud metadata (`169.254.169.254`). Finally, Playwright's route guard re-checks IPs on redirects."
* **Expected Follow-up**: "What error does the API return if SSRF validation fails?"
* **Evaluation Criteria**: Thorough knowledge of network security, IP parsing, and defensive programming.

### Q2.15: Why is `MAX_CONCURRENT_SCANS` set to 1?
* **Model Answer**: "Render's free tier provides 512MB RAM. Chromium instances consume 120–250MB during active crawling. Running two concurrent scans risks exceeding cgroup memory limits, triggering an immediate kernel `SIGKILL` (`OOMKilled`). Setting the limit to 1 and returning HTTP 429 when busy protects container stability."
* **Expected Follow-up**: "How would you handle high user traffic with this constraint?"
* **Evaluation Criteria**: Balances realistic cloud constraints with production reliability guarantees.

### Q2.16: How does browser recycling work in `browser.ts`?
* **Model Answer**: "We maintain a counter `scanCount`. Every time a scan finishes via `notifyScanComplete()`, `scanCount` increments. When it reaches 5 (`MAX_SCANS_BEFORE_RECYCLE`), we close the existing Chromium instance and reset the counter. The next scan automatically initializes a fresh Chromium instance."
* **Expected Follow-up**: "Why not recycle after every single scan?"
* **Evaluation Criteria**: Explains browser lifecycle trade-offs: startup latency (~2s) vs memory leak prevention.

### Q2.17: What does `scheduleIdleClose()` do?
* **Model Answer**: "Whenever a scan completes, `scheduleIdleClose()` sets a 5-minute `setTimeout`. If no new scans are dispatched within 5 minutes, it closes the Chromium process and sets `browserInstance = null`. If a new scan arrives before the timer fires, the timer is cleared. This releases all browser memory to the OS during idle periods."
* **Expected Follow-up**: "What happens when a new scan arrives after an idle close?"
* **Evaluation Criteria**: Demonstrates resource efficiency and event loop timer management.

### Q2.18: What is the purpose of `drizzle-kit push` vs `drizzle-kit migrate`?
* **Model Answer**: "`drizzle-kit push` directly inspects TypeScript schemas and applies changes to the database without generating migration files, ideal for rapid local prototyping. `drizzle-kit migrate` generates explicit, versioned `.sql` migration scripts that are committed to git and executed sequentially in production via `migrate.ts`."
* **Expected Follow-up**: "Which one runs inside your Docker container?"
* **Evaluation Criteria**: Understands database migration lifecycles and production deployment safety.

### Q2.19: How did you implement connection pool error handling in PostgreSQL?
* **Model Answer**: "In `backend/src/db/index.ts`, we attach an error listener directly to the pool: `pool.on('error', (err) => console.error('[DatabasePool] Unexpected idle client error:', err))`. This intercepts network socket drops on idle connections so they don't escalate into uncaught exceptions that crash the process."
* **Expected Follow-up**: "What is the pool's idle timeout setting?"
* **Evaluation Criteria**: Direct code-level knowledge of Node.js event emitters and connection pool management.

### Q2.20: Explain the retry loop in `backend/src/db/migrate.ts`.
* **Model Answer**: "Managed databases on free tiers often sleep and take 3–8 seconds to respond on cold starts. When Docker launches, `migrate.ts` runs a `while` loop with up to 5 attempts. If `drizzle.migrate()` fails, it catches the error, logs a warning, waits 3,000ms using a Promise sleep, and retries. If all 5 attempts fail, it exits with code 1."
* **Expected Follow-up**: "Why exit with code 1 after 5 attempts?"
* **Evaluation Criteria**: Demonstrates defensive programming for distributed cloud dependencies.

### Q2.21: How do you test banner consent interactions in `consentTester.ts`?
* **Model Answer**: "We query the page for primary accept buttons using semantic regex locators (`/accept all|allow all|i agree/i`). If found, we attach a temporary network request listener, simulate a click with a 3,000ms timeout, wait 2,000ms for network settling, and compare post-click cookies and requests against initial counts to compute the empirical delta."
* **Expected Follow-up**: "What if the click triggers a page navigation?"
* **Evaluation Criteria**: Understands browser event coordination, telemetry listeners, and empirical deltas.

### Q2.22: What is the purpose of `extractRootDomain` and how is it tested?
* **Model Answer**: "It extracts the base registrable domain from subdomains while handling multi-part TLDs (e.g., `ads.google.co.uk` $\rightarrow$ `google.co.uk`). In Test 3 of our analyzer test suite, we assert that `sub.example.com` and `example.com` share the root domain `example.com`, correctly identifying first-party requests."
* **Expected Follow-up**: "What if the domain is an IP address?"
* **Evaluation Criteria**: Demonstrates rigorous boundary testing and URL parsing expertise.

### Q2.23: What are the 8 tests in `analyzer.test.ts`?
* **Model Answer**: "Test 1: Known tracker identification; Test 2: Unknown 3rd parties categorized as Other; Test 3: First vs third party root resolution; Test 4: Semantic cookie categorization; Test 5: Pre-consent tracking deductions; Test 6: Banner absence and dark patterns; Test 7: Missing evidence handling; Test 8: Configurable scoring weights override."
* **Expected Follow-up**: "How do you run that test suite?"
* **Evaluation Criteria**: Knows exact test names, inputs, assertions, and execution command (`npm run test:analyzer`).

### Q2.24: How does the `/compare` page work under the hood?
* **Model Answer**: "The user selects two completed scans from `/history` or inputs their IDs. Next.js fetches both scan reports via `Promise.all([api.getReport(idA), api.getReport(idB)])`. It computes score deltas, compares cookie counts and tracker volumes, and performs set intersection on tracker domains to highlight shared trackers versus unique trackers."
* **Expected Follow-up**: "What happens if one of the scan IDs is invalid?"
* **Evaluation Criteria**: Understands comparative data modeling, set operations, and error handling.

### Q2.25: How does `server.ts` handle CORS safely?
* **Model Answer**: "We configure the `cors` middleware with an `origin` delegate function. It checks if the incoming `Origin` header matches `env.FRONTEND_URL` or localhost during development. If it matches, it allows it; if not, it returns `callback(null, false)` instead of throwing an unhandled 500 error, cleanly denying unauthorized origins."
* **Expected Follow-up**: "What happens during a CORS preflight request?"
* **Evaluation Criteria**: Deep knowledge of HTTP preflight mechanisms and Express middleware.

---

## 🏗️ ROUND 3: Deep Systems Architecture, Reliability & Scalability (25 Questions)

### Q3.1: How would you redesign CyberSentry to scale to 10,000 concurrent scans?
* **Model Answer**: "I would decouple the system into a distributed event-driven architecture:
  1. **API Gateway Tier**: Lightweight Express or Go microservices behind an Application Load Balancer that validate requests and push jobs onto a Redis-backed queue (BullMQ).
  2. **Worker Pool Tier**: An autoscaling cluster of dedicated worker containers running in Kubernetes or AWS ECS. Each worker pulls one job, launches a short-lived Playwright container, and pushes results back.
  3. **Data Tier**: Read-replica PostgreSQL database with connection pooling via PgBouncer.
  4. **Object Storage**: Offload raw network HAR files and screenshots to AWS S3 rather than storing massive telemetry in PostgreSQL JSONB."
* **Expected Follow-up**: "How would you handle Redis queue failures?"
* **Evaluation Criteria**: Demonstrates cloud-native distributed systems design, worker queue patterns, and resource decoupling.

### Q3.2: Why is storing HAR files in PostgreSQL JSONB an anti-pattern at enterprise scale?
* **Model Answer**: "PostgreSQL JSONB is stored in TOAST tables when row size exceeds 2KB. While fine for our prototype's summary evidence, storing multi-megabyte raw HAR files causes severe database bloat, exhausts I/O bandwidth, degrades VACUUM performance, and increases backup times. Large binary or raw payloads belong in S3 or Google Cloud Storage, with only the object URL and extracted metadata stored in PostgreSQL."
* **Expected Follow-up**: "At what payload size would you switch to S3?"
* **Evaluation Criteria**: Deep understanding of PostgreSQL internal storage architecture (TOAST) and object storage trade-offs.

### Q3.3: How would you guarantee scan idempotency?
* **Model Answer**: "By generating a deterministic hash of the normalized URL and a configurable time window (e.g., `SHA-256(canonical_url + date_bucket)`). When a scan request arrives, we query for an existing scan with that hash created within the last 30 minutes. If found, we return the existing scan ID rather than launching a redundant, expensive headless browser crawl."
* **Expected Follow-up**: "What if the website owner updated their consent banner 5 minutes ago?"
* **Evaluation Criteria**: Understands caching strategies, cache invalidation, and idempotent API design.

### Q3.4: How would you prevent an attacker from bypassing your SSRF filter via DNS rebinding?
* **Model Answer**: "In DNS rebinding, an attacker's DNS server returns a public IP with a TTL of 1 second, then immediately flips to `169.254.169.254`. We mitigate this by:
  1. Pinning DNS: resolving the IP during pre-flight and instructing the browser to connect directly to that resolved IP with a custom `Host` header.
  2. Playwright Route Interception: intercepting every redirect and re-resolving the destination IP before allowing navigation.
  3. Linux Network Namespaces: running worker containers inside an isolated Docker network bridge with iptables rules dropping all outbound traffic to private subnets and metadata IPs."
* **Expected Follow-up**: "Can iptables block link-local 169.254.169.254 traffic?"
* **Evaluation Criteria**: Expert-level security architecture spanning DNS protocols, browser mechanics, and OS network controls.

### Q3.5: What would break if you deployed multiple backend instances with the current codebase?
* **Model Answer**: "Two things:
  1. **Concurrency Ceiling**: `activeScans` is an in-memory integer. With 3 instances, you would allow 3 concurrent scans, potentially exceeding downstream database limits or resource quotas.
  2. **Browser Lifecycle**: Browser recycling and idle cleanup would run independently per container, which is functionally fine but uncoordinated.
  *Fix*: Replace the in-memory counter with an atomic Redis lock (`SET lock:scan NX EX 60`)."
* **Expected Follow-up**: "How does a distributed lock release safely if the node crashes?"
* **Evaluation Criteria**: Identifies stateful in-memory anti-patterns in horizontally scaled environments.

### Q3.6: What is the exact difference between an uncaughtException and an unhandledRejection in Node.js?
* **Model Answer**: "`uncaughtException` occurs when a synchronous exception is thrown and not caught by any `try/catch` block within the call stack. `unhandledRejection` occurs when a Promise rejects and has no `.catch()` handler or `try/catch` around an `await` within that turn of the event loop. In modern Node.js, both terminate the process by default unless an event listener is registered."
* **Expected Follow-up**: "Why does CyberSentry exit with code 1 on both?"
* **Evaluation Criteria**: Precise knowledge of Node.js event loop internals and Promise error propagation.

### Q3.7: Explain the concept of Database Connection Starvation and how your configuration prevents it.
* **Model Answer**: "Connection starvation occurs when all connections in a pool are checked out by slow queries or hung transactions, causing incoming requests to queue and time out. We prevent this by:
  1. Capping `max: 5` to stay well below PostgreSQL limits.
  2. Setting `connectionTimeoutMillis: 10000` so queries fail fast rather than hanging indefinitely.
  3. Setting `idleTimeoutMillis: 30000` to close inactive sockets.
  4. Executing all multi-table audit writes inside short-lived atomic transactions that commit in $<15\text{ms}$."
* **Expected Follow-up**: "What tool would you use to pool connections across multiple containers?"
* **Evaluation Criteria**: Understands connection pool saturation, latency budgets, and PgBouncer architecture.

### Q3.8: Why did you choose Drizzle ORM over Prisma from an architectural standpoint?
* **Model Answer**: "Prisma relies on a monolithic Rust engine binary (`query-engine`) that communicates with the Node.js layer over a local socket or IPC channel. This engine consumes 100MB+ of resident memory. In a memory-constrained container (512MB RAM) running Chromium, that leaves almost no headroom. Drizzle is a zero-runtime, zero-binary TypeScript SQL builder that compiles directly to raw parameterized SQL strings, consuming negligible memory."
* **Expected Follow-up**: "What do you sacrifice by using Drizzle instead of Prisma?"
* **Evaluation Criteria**: Architectural depth in memory profiling, runtime overhead, and ORM internals.

### Q3.9: How does Playwright's browser context isolation work at the operating system level?
* **Model Answer**: "Playwright's `browser.newContext()` creates an incognito browsing session within a single Chromium browser process. It allocates separate in-memory cookie stores, cache storages, IndexedDB files, and session states. However, all contexts share the underlying browser process's GPU process and network process threads, avoiding the heavy OS process creation overhead of spawning a new browser binary for each scan."
* **Expected Follow-up**: "If one context crashes, does it crash the entire browser process?"
* **Evaluation Criteria**: Deep knowledge of Chromium multi-process architecture (Browser, Renderer, GPU, Network).

### Q3.10: How would you architect automated bot-detection evasion if legal to do so?
* **Model Answer**: "I would employ Playwright Stealth techniques:
  1. Overriding `navigator.webdriver` via `Object.defineProperty`.
  2. Emulating realistic human cursor paths using cubic Bezier curves rather than instant coordinate clicks.
  3. Randomizing viewport dimensions, hardware concurrency, and user agent strings.
  4. Routing traffic through residential proxy networks with automated IP rotation.
  *Note*: For CyberSentry, our policy is to audit websites as-served without actively bypassing CAPTCHA walls."
* **Expected Follow-up**: "Why is avoiding CAPTCHA bypass the right choice for CyberSentry?"
* **Evaluation Criteria**: Demonstrates technical knowledge of anti-scraping defenses while maintaining ethical and legal engineering boundaries.

### Q3.11: How do you prevent database deadlocks during high-concurrency writes?
* **Model Answer**: "Deadlocks occur when two concurrent transactions acquire locks on multiple tables in conflicting orders. In `saveScanFullResults`, we eliminate deadlocks by enforcing strict lock ordering: always inserting `scans` first, followed by child records (`consent_banners`, `cookie_records`, `network_requests`, `findings`, `reports`) in the exact same sequence every time. Since parent rows exist first, no cyclic lock dependency can form."
* **Expected Follow-up**: "What transaction isolation level does PostgreSQL use by default?"
* **Evaluation Criteria**: Masterful understanding of relational lock contention and ACID transaction isolation.

### Q3.12: Why is the hybrid relational + JSONB design superior to pure relational or pure document stores here?
* **Model Answer**: "Pure relational schemas struggle with polymorphic, rapidly evolving telemetry: CMP configurations vary wildly (OneTrust vs Cookiebot vs custom), and violation evidence shapes change per rule. Making columns for every possible attribute leads to sparse, 100-column tables. Pure document stores (MongoDB) lack ACID guarantees across multi-table audits and cascade deletion rules. The hybrid model uses relational columns for indexed foreign keys and queries, and JSONB for polymorphic evidence payloads."
* **Expected Follow-up**: "Can you index specific keys inside a JSONB column in PostgreSQL?"
* **Evaluation Criteria**: Explains relational vs document trade-offs and PostgreSQL GIN indexing capabilities.

### Q3.13: How does the deterministic scoring engine guarantee zero score drift over time?
* **Model Answer**: "Because all rule definitions in `scoringConfig.ts` are immutable constants with fixed deduction point values, and the analyzer functions in `scorer.ts` are pure functions with zero external API calls or random seeds. Given the exact same raw scan payload, the mathematical output is identical across every run."
* **Expected Follow-up**: "How do you test that scores don't drift across software updates?"
* **Evaluation Criteria**: Understands deterministic algorithms, regression testing, and pure functional programming.

### Q3.14: Explain the difference between `dns.lookup` and `dns.resolve` in Node.js.
* **Model Answer**: "`dns.lookup` uses the operating system's underlying C-library `getaddrinfo(3)` call, which honors `/etc/hosts` and local DNS configurations, running on the Node.js libuv worker pool thread. `dns.resolve` bypasses the OS resolver and performs network queries directly using c-ares asynchronously. We use `dns.lookup` because it accurately mimics how the browser resolves hostnames on the host OS."
* **Expected Follow-up**: "Can `dns.lookup` block the event loop if the worker pool is exhausted?"
* **Evaluation Criteria**: Advanced understanding of Node.js libuv internals, thread pools, and DNS resolution mechanics.

### Q3.15: How does the application prevent memory fragmentation in long-running Node.js processes?
* **Model Answer**: "V8's garbage collector can suffer from heap fragmentation when allocating and deallocating large buffers. We mitigate this by:
  1. Aborting media transfers so large binary buffers are never created.
  2. Recycling the Chromium browser every 5 scans to release OS memory handles.
  3. Launching Node.js with standard V8 heap configurations and letting container orchestrators restart containers cleanly if memory trends upward."
* **Expected Follow-up**: "What flag controls Node.js maximum heap size?"
* **Evaluation Criteria**: Understands V8 garbage collection, heap fragmentation, and container lifecycle management.

### Q3.16: What is the purpose of `drizzle-orm/node-postgres` vs `pg` directly?
* **Model Answer**: "`pg` is the low-level Node.js PostgreSQL driver handling TCP sockets, connection pooling, and SSL handshakes. `drizzle-orm/node-postgres` is the query builder and ORM layer that wraps `pg`. Drizzle compiles TypeScript expressions into SQL strings and hands them to `pg.query()` for execution, adding compile-time type safety with zero runtime query engine overhead."
* **Expected Follow-up**: "Does Drizzle add significant latency compared to raw SQL?"
* **Evaluation Criteria**: Clearly delineates between database drivers and ORM compilation layers.

### Q3.17: How would you implement dark pattern detection for cookie banner text using NLP?
* **Model Answer**: "Currently, we use deterministic keyword regex patterns. If expanding to NLP, I would train a lightweight BERT or RoBERTa classification model fine-tuned on dark pattern corpora (e.g., Mountain et al.). The model would classify banner text into dark pattern taxonomies (confirmshaming, false urgency, preselected defaults) and output a confidence score used as an evidence weight."
* **Expected Follow-up**: "Would you run that NLP model in-process in Node.js?"
* **Evaluation Criteria**: Bridges current rule-based implementation with advanced ML architectures.

### Q3.18: Explain the difference between Cookie `SameSite=Lax`, `SameSite=Strict`, and `SameSite=None`.
* **Model Answer**: 
  - `Strict`: The cookie is never sent in cross-site requests, even when following a top-level link from an external site.
  - `Lax`: The cookie is withheld on cross-site subrequests (images, iframes), but sent when a user navigates to the origin site via a top-level link (default in modern browsers).
  - `None`: The cookie is sent on all cross-site requests, enabling third-party tracking, but requires the `Secure` flag."
* **Expected Follow-up**: "Which setting do third-party ad trackers require?"
* **Evaluation Criteria**: Masterful knowledge of modern cookie security, CSRF defense, and cross-site tracking mechanics.

### Q3.19: How do you handle target sites that serve different content based on Geo-IP?
* **Model Answer**: "Because CyberSentry runs on cloud servers located in specific data center regions (e.g., US-East or EU-Frankfurt), target sites will serve privacy banners tailored to that server's IP jurisdiction (e.g., GDPR banners in the EU, CCPA 'Do Not Sell' links in California). In a distributed production deployment, we would deploy regional worker nodes or route crawls through regional proxies to audit geo-specific compliance."
* **Expected Follow-up**: "Does your current deployment run in the US or Europe?"
* **Evaluation Criteria**: Demonstrates awareness of real-world Geo-IP routing and jurisdictional compliance differences.

### Q3.20: How does `drizzle.config.ts` enable schema migrations?
* **Model Answer**: "It defines the schema file path (`./src/db/schema.ts`), output folder (`./drizzle`), database dialect (`postgresql`), and connection credentials. Running `drizzle-kit generate` compares the schema file against historical migration snapshots and generates incremental, deterministic `.sql` migration files."
* **Expected Follow-up**: "What happens if two developers generate conflicting migrations?"
* **Evaluation Criteria**: Understands schema diffing, migration generation, and version control workflows.

### Q3.21: Explain why `pool.end()` is called during graceful shutdown.
* **Model Answer**: "`pool.end()` drains the connection pool: it stops accepting new queries, waits for currently active queries to complete, and sends TCP `Terminate` messages to PostgreSQL to close all open client connections gracefully. Without it, PostgreSQL leaves connection handles hanging until remote TCP timeouts expire."
* **Expected Follow-up**: "How long does `pool.end()` wait before timing out?"
* **Evaluation Criteria**: Demonstrates knowledge of graceful termination and socket cleanup.

### Q3.22: What is the architectural role of `meta?.timestamp` in API responses?
* **Model Answer**: "All API responses returned via `sendSuccess` include an ISO 8601 UTC timestamp. This provides audit traceability, allows clients to measure network latency and clock skew, and ensures frontend cache-busting accuracy."
* **Expected Follow-up**: "Why UTC rather than local time?"
* **Evaluation Criteria**: Understands distributed time coordination and API response standardization.

### Q3.23: How would you implement end-to-end encryption for sensitive audit reports?
* **Model Answer**: "I would implement client-side encryption using the Web Crypto API. The user generates an AES-256-GCM symmetric key stored locally in `sessionStorage`. Before saving to the backend, the client encrypts the audit payload and uploads ciphertext. The server stores only encrypted blobs, ensuring zero-knowledge privacy where only the user can decrypt the report."
* **Expected Follow-up**: "How would that impact the `/compare` feature?"
* **Evaluation Criteria**: Demonstrates advanced cryptographic systems design and zero-knowledge architecture.

### Q3.24: What is the difference between a synthetic crawl and real-user monitoring (RUM)?
* **Model Answer**: "Synthetic crawling (CyberSentry) simulates a standardized, clean-slate visitor using automated headless browsers under controlled conditions. Real-User Monitoring (RUM) embeds JavaScript snippets on live production sites to capture telemetry from actual visitors across diverse devices, networks, and geographies. CyberSentry is synthetic, providing repeatable, objective benchmarking."
* **Expected Follow-up**: "What is the primary limitation of synthetic crawling?"
* **Evaluation Criteria**: Clear understanding of performance and auditing methodologies (Synthetic vs RUM).

### Q3.25: What is your closing technical defense for why CyberSentry is production-ready?
* **Model Answer**: "CyberSentry is production-ready within its defined operational scope because:
  1. It enforces rigorous input validation and multi-layer SSRF defense.
  2. Its crawling pipeline is bounded by defensive resource controls: media aborting, single-scan concurrency, browser recycling, and idle cleanup that prevent container crashes on 512MB RAM tiers.
  3. Its health probes are semantically decoupled to prevent deployment reboot loops.
  4. Its database writes are encapsulated in atomic ACID transactions.
  5. Its scoring engine is 100% deterministic, backed by verifiable JSON evidence, and validated by unit tests.
  It is a resilient, dependable, and explainable transparency platform."
* **Expected Follow-up**: "Thank you, that concludes our interview."
* **Evaluation Criteria**: Confident, well-structured, authoritative technical summary covering security, reliability, architecture, and verification.
