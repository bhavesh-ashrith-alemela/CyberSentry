import http from "http";
import { runScan } from "./scanner/scannerEngine.js";
import { scanService } from "./services/scanService.js";
import { scanRepository } from "./repositories/scanRepository.js";
import { db } from "./db/index.js";
import { scans, websites, consentBanners, cookieRecords, networkRequests, findings, reports } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { closeBrowser } from "./scanner/browser.js";

async function runScannerTestSuite() {
  console.log("==================================================");
  console.log(" 🕵️ CYBERSENTRY SCANNER ENGINE COMPREHENSIVE TEST");
  console.log("==================================================");

  // 1. Setup a Mock Target Server with realistic Cookie Banner & Tracking Scripts
  const mockPort = 8899;
  const mockServer = http.createServer((req, res) => {
    // Serve HTML with cookie banner and cookies
    if (req.url === "/") {
      res.writeHead(200, {
        "Content-Type": "text/html",
        "Set-Cookie": [
          "session_id=s_xyz12345; Path=/; HttpOnly; SameSite=Lax",
          "_ga=GA1.2.987654321.1600000000; Path=/; Max-Age=63072000",
        ],
      });

      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="CyberSentry test fixture for consent banner testing">
          <title>CyberSentry Consent Test Fixture</title>
          <script>
            // Simulate window CMP
            window.OneTrust = { version: "6.30.0" };
          </script>
        </head>
        <body>
          <h1>Welcome to Test Fixture</h1>
          <p>This page tests consent banner detection and cookie collection.</p>

          <!-- Simulated Cookie Banner -->
          <div id="onetrust-banner-sdk" style="position: fixed; bottom: 0; background: #333; color: white; padding: 20px; width: 100%;">
            <p>We use cookies to improve your experience and analyze site performance.</p>
            <div class="options">
              <label><input type="checkbox" name="cookie_analytics" checked> Analytics Cookies</label>
              <label><input type="checkbox" name="cookie_marketing"> Marketing Cookies</label>
            </div>
            <div class="actions">
              <button id="accept-btn" onclick="onAccept()">Accept All</button>
              <button id="reject-btn" onclick="onReject()">Reject All</button>
              <button id="settings-btn">Cookie Settings</button>
            </div>
          </div>

          <script>
            function onAccept() {
              // Set additional tracking cookie post-consent
              document.cookie = "_fbp=fb.1.123456789.987654; path=/; max-age=7776000";
              // Fire beacon
              fetch('/analytics/telemetry', { method: 'POST', body: 'accepted' }).catch(() => {});
            }
            function onReject() {
              document.cookie = "consent_declined=true; path=/";
            }
          </script>
        </body>
        </html>
      `);
      return;
    }

    if (req.url === "/analytics/telemetry") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "recorded" }));
      return;
    }

    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => mockServer.listen(mockPort, "127.0.0.1", resolve));
  console.log(`[Test Server] Mock target running on http://127.0.0.1:${mockPort}`);

  try {
    // 2. Direct runScan test on mock server
    console.log("\n[Test 1] Testing runScan() on mock site with CMP & Consent Banner...");
    const targetUrl = `http://127.0.0.1:${mockPort}`;
    const scanResult = await runScan(targetUrl, { allowLocalhost: true });

    console.log("  ✓ Metadata extracted:");
    console.log(`    - Title: "${scanResult.metadata.title}"`);
    console.log(`    - Final URL: ${scanResult.metadata.finalUrl}`);
    console.log(`    - Description: "${scanResult.metadata.metaTags.description}"`);
    console.log(`    - Charset: "${scanResult.metadata.metaTags.charset}"`);

    console.log("  ✓ Banner Detection:");
    console.log(`    - Detected: ${scanResult.bannerInfo.detected}`);
    console.log(`    - CMP Name: ${scanResult.bannerInfo.cmpName}`);
    console.log(`    - Accept Button: "${scanResult.bannerInfo.acceptButton.text}"`);
    console.log(`    - Reject Button: "${scanResult.bannerInfo.rejectButton.text}"`);
    console.log(`    - Settings Button: "${scanResult.bannerInfo.settingsButton.text}"`);
    console.log(`    - Option Indicators: count=${scanResult.bannerInfo.optionIndicators.count}, types=${scanResult.bannerInfo.optionIndicators.types.join(", ")}`);

    console.log("  ✓ Consent Choice Interaction Testing:");
    console.log(`    - Tested: ${scanResult.consentTest.tested}`);
    console.log(`    - Action: ${scanResult.consentTest.action}`);
    console.log(`    - Button Clicked: "${scanResult.consentTest.buttonText}"`);
    console.log(`    - Observed Post-Consent Cookies: ${scanResult.consentTest.observedNewCookies}`);
    console.log(`    - Observed Post-Consent Requests: ${scanResult.consentTest.observedNewRequests}`);

    if (!scanResult.bannerInfo.detected || scanResult.bannerInfo.cmpName !== "OneTrust") {
      throw new Error(`Expected OneTrust CMP detection, got: ${scanResult.bannerInfo.cmpName}`);
    }
    if (scanResult.bannerInfo.acceptButton.text !== "Accept All") {
      throw new Error(`Expected 'Accept All' accept button text, got: ${scanResult.bannerInfo.acceptButton.text}`);
    }
    if (scanResult.bannerInfo.rejectButton.text !== "Reject All") {
      throw new Error(`Expected 'Reject All' reject button text, got: ${scanResult.bannerInfo.rejectButton.text}`);
    }
    if (!scanResult.consentTest.tested || scanResult.consentTest.observedNewCookies < 1) {
      throw new Error("Consent testing did not observe the post-consent cookie!");
    }

    // 3. Test Full Scan Persistence through ScanService with Database verification
    console.log("\n[Test 2] Testing End-to-End Scan & Database Persistence via ScanService...");
    const scanOutcome = await scanService.executeScan("https://example.com");
    if (!scanOutcome.scan) {
      throw new Error("Scan execution did not return a valid scan entity!");
    }
    console.log(`  ✓ Scan completed with scan ID: ${scanOutcome.scan.id}`);
    console.log(`    - Score: ${scanOutcome.summary.score}/100 (Grade ${scanOutcome.summary.grade})`);
    console.log(`    - Duration: ${scanOutcome.scan.durationMs}ms`);

    // Verify in PostgreSQL tables:
    const [savedScan] = await db.select().from(scans).where(eq(scans.id, scanOutcome.scan.id));
    const [savedReport] = await db.select().from(reports).where(eq(reports.scanId, scanOutcome.scan.id));
    const savedCookies = await db.select().from(cookieRecords).where(eq(cookieRecords.scanId, scanOutcome.scan.id));
    const savedRequests = await db.select().from(networkRequests).where(eq(networkRequests.scanId, scanOutcome.scan.id));
    const savedFindings = await db.select().from(findings).where(eq(findings.scanId, scanOutcome.scan.id));

    console.log("\n  ✓ PostgreSQL Database Verification:");
    console.log(`    - Scans Table: status="${savedScan.status}", score=${savedScan.score}, grade="${savedScan.grade}"`);
    console.log(`    - Reports Table: 1:1 linked, summary="${savedReport.summary}"`);
    console.log(`    - Reports Metrics: title="${savedReport.metrics.websiteTitle}", duration=${savedReport.metrics.durationMs}ms`);
    console.log(`    - Cookie Records: ${savedCookies.length} rows`);
    console.log(`    - Network Requests: ${savedRequests.length} rows`);
    console.log(`    - Findings: ${savedFindings.length} rows`);

    if (savedScan.status !== "completed") {
      throw new Error(`Scan status is not 'completed': ${savedScan.status}`);
    }
    if (!savedReport) {
      throw new Error("Report record missing in database!");
    }

    // 4. Test Scan Failure State Handling
    console.log("\n[Test 3] Testing Failed Scan Status Transition in PostgreSQL...");
    const [failWebsite] = await db.insert(websites).values({
      url: "https://unreachable-test-domain.invalid",
      domain: "unreachable-test-domain.invalid",
    }).returning();

    const failScan = await scanRepository.createScan(failWebsite.id);
    console.log(`  Created pending scan: ${failScan.id}`);

    const errorMsg = "net::ERR_NAME_NOT_RESOLVED at https://unreachable-test-domain.invalid";
    await scanRepository.updateScanStatus(failScan.id, "failed", { errorMessage: errorMsg });

    const [verifiedFailScan] = await db.select().from(scans).where(eq(scans.id, failScan.id));
    console.log(`  ✓ Scan status updated: "${verifiedFailScan.status}"`);
    console.log(`  ✓ Error message persisted: "${verifiedFailScan.errorMessage}"`);

    if (verifiedFailScan.status !== "failed" || verifiedFailScan.errorMessage !== errorMsg) {
      throw new Error("Failed scan status or error message did not persist properly!");
    }

    console.log("\n==================================================");
    console.log(" 🎉 ALL SCANNER TESTS PASSED PERFECTLY!");
    console.log("==================================================");
  } finally {
    await closeBrowser();
    mockServer.close();
  }
}

runScannerTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Scanner test failed:", err);
    process.exit(1);
  });
