import { getBrowser } from "./browser.js";
import { attachRedirectGuard } from "./redirectGuard.js";
import { extractMetadata, WebsiteMetadata } from "./metadataExtractor.js";
import { detectConsentBanner, DetailedBannerInfo } from "./bannerDetector.js";
import { testConsentChoice, ConsentTestResult } from "./consentTester.js";
import { RawCookie, RawNetworkRequest } from "../analyzer/rules.js";
import { env } from "../config/env.js";

export interface ScanResultPayload {
  url: string;
  finalUrl: string;
  targetDomain: string;
  metadata: WebsiteMetadata;
  cookies: RawCookie[];
  requests: RawNetworkRequest[];
  bannerDetected: boolean;
  bannerCmpName: string | null;
  bannerInfo: DetailedBannerInfo;
  consentTest: ConsentTestResult;
  durationMs: number;
}

export async function runScan(
  targetUrl: string,
  options?: { allowLocalhost?: boolean }
): Promise<ScanResultPayload> {
  const startTime = Date.now();
  const parsedTarget = new URL(targetUrl);
  const targetDomain = parsedTarget.hostname;

  const browser = await getBrowser();
  // Create an isolated incognito browser context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  const capturedRequests: RawNetworkRequest[] = [];

  try {
    // 1. Attach redirect guard and media blocker
    await attachRedirectGuard(page, options);

    // 2. Track outgoing network requests and beacons
    page.on("request", (req) => {
      try {
        capturedRequests.push({
          url: req.url(),
          method: req.method(),
          resourceType: req.resourceType(),
          headers: req.headers(),
        });
      } catch {}
    });

    // 3. Navigate with timeout safeguard
    console.log(`[Scanner] Loading ${targetUrl} (Timeout: ${env.SCAN_TIMEOUT_MS}ms)`);
    try {
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: env.SCAN_TIMEOUT_MS,
      });
    } catch (navError: any) {
      // If page timed out but some content loaded, proceed; otherwise throw failure
      const currentUrl = page.url();
      if (!currentUrl || currentUrl === "about:blank") {
        throw new Error(`Navigation failed: ${navError.message}`);
      }
      console.warn(`[Scanner] Navigation warning for ${targetUrl}: ${navError.message}. Proceeding with partial page state.`);
    }

    // Allow asynchronous scripts, analytics tags, and banners brief dwell time to execute
    await page.waitForTimeout(2500);

    // 4. Extract Page Title, Final Redirected URL, and Meta Tags
    const metadata = await extractMetadata(page);

    // 5. Collect all initial cookies dropped prior to explicit user consent
    const rawCookies = await context.cookies();
    const formattedCookies: RawCookie[] = rawCookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: typeof c.expires === "number" && !isNaN(c.expires) ? Math.floor(c.expires) : -1,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: (c.sameSite as "Strict" | "Lax" | "None") || "Lax",
    }));

    // 6. Detect Consent Banner, Button Text, Visibility & Option Toggles
    const bannerInfo = await detectConsentBanner(page);

    // 7. Controlled Consent Testing (when safely feasible)
    const consentTest = await testConsentChoice(page, bannerInfo, formattedCookies.length);

    const durationMs = Date.now() - startTime;
    console.log(
      `[Scanner] Completed scan for ${targetDomain} in ${durationMs}ms: ` +
        `Title="${metadata.title.slice(0, 30)}", FinalURL="${metadata.finalUrl}", ` +
        `Cookies=${formattedCookies.length}, Requests=${capturedRequests.length}, ` +
        `BannerDetected=${bannerInfo.detected} (Accept="${bannerInfo.acceptButton.text || "None"}")`
    );

    return {
      url: targetUrl,
      finalUrl: metadata.finalUrl,
      targetDomain,
      metadata,
      cookies: formattedCookies,
      requests: capturedRequests,
      bannerDetected: bannerInfo.detected,
      bannerCmpName: bannerInfo.cmpName,
      bannerInfo,
      consentTest,
      durationMs,
    };
  } finally {
    // Crucial: Always close page and context to avoid resource leaks in low-memory environments
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}
