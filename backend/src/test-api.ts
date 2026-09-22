import { validateUrlSafety } from "./services/ssrfService.js";
import { testConnection } from "./db/index.js";
import app from "./server.js";
import http from "http";

async function runTests() {
  console.log("==================================================");
  console.log(" 🧪 CYBERSENTRY BACKEND INTEGRATION TEST SUITE");
  console.log("==================================================");

  // 1. Test Database Connectivity
  console.log("\n[Test 1] Testing PostgreSQL Connectivity...");
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error("❌ Database connection test failed!");
    process.exit(1);
  }
  console.log("✅ Database connectivity verified.");

  // 2. Test SSRF Protections
  console.log("\n[Test 2] Testing SSRF Protection Module...");
  const ssrfCases = [
    { url: "http://localhost:5432", shouldPass: false, reason: "Localhost" },
    { url: "http://127.0.0.1:8080", shouldPass: false, reason: "IPv4 loopback" },
    { url: "http://169.254.169.254/latest/meta-data/", shouldPass: false, reason: "Cloud metadata" },
    { url: "http://10.0.0.1", shouldPass: false, reason: "Private Class A IP" },
    { url: "http://192.168.1.1", shouldPass: false, reason: "Private Class C IP" },
    { url: "ftp://example.com", shouldPass: false, reason: "Non-HTTP protocol" },
    { url: "not-a-valid-url", shouldPass: false, reason: "Malformed string" },
    { url: "https://example.com", shouldPass: true, reason: "Valid public domain" },
  ];

  for (const tc of ssrfCases) {
    const result = await validateUrlSafety(tc.url);
    const passed = tc.shouldPass ? result.safe : !result.safe;
    if (!passed) {
      console.error(`❌ SSRF test failed for "${tc.url}" (${tc.reason}). Result:`, result);
      process.exit(1);
    }
    console.log(`  ✓ ${tc.reason.padEnd(24)}: ${tc.shouldPass ? "ALLOWED" : "BLOCKED"} (${tc.url})`);
  }
  console.log("✅ SSRF protections verified.");

  // 3. Test HTTP Server & Endpoints
  console.log("\n[Test 3] Testing Express REST API Endpoints...");
  const testPort = 5002;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(testPort, "127.0.0.1", () => {
      console.log(`  Test HTTP server listening on http://127.0.0.1:${testPort}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${testPort}`;

  try {
    // 3.1 GET /api/health
    console.log("\n  Testing GET /api/health ...");
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    console.log("  Health Status:", healthJson);
    if (healthRes.status !== 200 || healthJson.data?.database?.status !== "connected") {
      throw new Error("Health check failed");
    }
    console.log("  ✓ Health check passed (200 OK)");

    // 3.2 GET /api/scans
    console.log("\n  Testing GET /api/scans (list scans) ...");
    const listRes = await fetch(`${baseUrl}/api/scans?page=1&limit=5`);
    const listJson = await listRes.json();
    console.log(`  Scans returned: ${listJson.data?.length}, Total in DB: ${listJson.meta?.total}`);
    if (listRes.status !== 200) {
      throw new Error("List scans failed");
    }
    console.log("  ✓ GET /api/scans passed (200 OK)");

    // 3.3 POST /api/scans with SSRF target (should be rejected with 400)
    console.log("\n  Testing POST /api/scans with SSRF payload (http://127.0.0.1) ...");
    const ssrfPostRes = await fetch(`${baseUrl}/api/scans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://127.0.0.1" }),
    });
    const ssrfPostJson = await ssrfPostRes.json();
    console.log("  Response Code:", ssrfPostRes.status, ssrfPostJson.error?.message);
    if (ssrfPostRes.status !== 400) {
      throw new Error("SSRF payload was not rejected!");
    }
    console.log("  ✓ SSRF rejection passed (400 Bad Request)");

    // 3.4 POST /api/scans with real public website (https://example.com)
    console.log("\n  Testing POST /api/scans with valid site (https://example.com) ...");
    const scanPostRes = await fetch(`${baseUrl}/api/scans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const scanPostJson = await scanPostRes.json();
    if (scanPostRes.status !== 201 || !scanPostJson.data?.scan?.id) {
      console.error("Scan response:", scanPostJson);
      throw new Error("Scan creation failed");
    }

    const createdScanId = scanPostJson.data.scan.id;
    console.log(`  ✓ Scan job initiated with ID: ${createdScanId}`);
    console.log(`    Initial Status: ${scanPostJson.data.scan.status}`);

    // 3.5 Poll GET /api/scans/:id until completed (mirroring frontend integration)
    console.log(`\n  Testing live polling of GET /api/scans/${createdScanId} ...`);
    let scanCompleted = false;
    let attempts = 0;
    const maxAttempts = 30;
    let latestScanData: any = null;

    while (!scanCompleted && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
      const pollRes = await fetch(`${baseUrl}/api/scans/${createdScanId}`);
      const pollJson = await pollRes.json();
      latestScanData = pollJson.data;

      console.log(`    [Poll #${attempts}] Status: ${latestScanData?.status}`);

      if (latestScanData?.status === "completed") {
        scanCompleted = true;
        console.log(`  ✓ Scan completed! Score: ${latestScanData.score}/100, Grade: ${latestScanData.grade}`);
      } else if (latestScanData?.status === "failed") {
        throw new Error(`Scan failed during crawl: ${latestScanData.errorMessage}`);
      }
    }

    if (!scanCompleted) {
      throw new Error(`Scan polling timed out after ${maxAttempts}s`);
    }
    console.log("  ✓ GET /api/scans/:id polling passed (200 OK)");

    // 3.6 GET /api/scans/:id/report
    console.log(`\n  Testing GET /api/scans/${createdScanId}/report ...`);
    const reportRes = await fetch(`${baseUrl}/api/scans/${createdScanId}/report`);
    const reportJson = await reportRes.json();
    if (reportRes.status !== 200 || !reportJson.data?.metrics) {
      throw new Error("Failed to fetch scan report");
    }
    console.log("  ✓ GET /api/scans/:id/report passed (200 OK)");
    console.log("    Summary:", reportJson.data.summary);

    // 3.7 GET /api/scans/:id/cookies
    console.log(`\n  Testing GET /api/scans/${createdScanId}/cookies ...`);
    const cookiesRes = await fetch(`${baseUrl}/api/scans/${createdScanId}/cookies`);
    const cookiesJson = await cookiesRes.json();
    if (cookiesRes.status !== 200) {
      throw new Error("Failed to fetch scan cookies");
    }
    console.log(`  ✓ GET /api/scans/:id/cookies passed (${cookiesJson.data?.count} cookies)`);

    // 3.8 GET /api/scans/:id/trackers
    console.log(`\n  Testing GET /api/scans/${createdScanId}/trackers ...`);
    const trackersRes = await fetch(`${baseUrl}/api/scans/${createdScanId}/trackers`);
    const trackersJson = await trackersRes.json();
    if (trackersRes.status !== 200) {
      throw new Error("Failed to fetch scan trackers");
    }
    console.log(`  ✓ GET /api/scans/:id/trackers passed (${trackersJson.data?.count} trackers)`);

    // 3.9 GET /api/scans/:id/findings
    console.log(`\n  Testing GET /api/scans/${createdScanId}/findings ...`);
    const findingsRes = await fetch(`${baseUrl}/api/scans/${createdScanId}/findings`);
    const findingsJson = await findingsRes.json();
    if (findingsRes.status !== 200) {
      throw new Error("Failed to fetch scan findings");
    }
    console.log(`  ✓ GET /api/scans/:id/findings passed (${findingsJson.data?.count} findings)`);

    // 3.10 GET /api/scans/compare
    console.log(`\n  Testing GET /api/scans/compare ...`);
    const compareRes = await fetch(`${baseUrl}/api/scans/compare?scanA=${createdScanId}&scanB=${createdScanId}`);
    const compareJson = await compareRes.json();
    if (compareRes.status !== 200 || !compareJson.data?.comparison) {
      throw new Error("Failed to compare scans");
    }
    console.log("  ✓ GET /api/scans/compare passed (200 OK)");
    console.log("    Score difference:", compareJson.data.comparison.scoreDifference);

    console.log("\n==================================================");
    console.log(" 🎉 ALL 10 TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================");
  } finally {
    server.close();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Test suite failed:", err);
    process.exit(1);
  });
