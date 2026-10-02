import { chromium, Browser } from "playwright";
import { env } from "../config/env.js";

let browserInstance: Browser | null = null;
let scansCompletedSinceLaunch = 0;
const MAX_SCANS_BEFORE_RECYCLE = 5;
let idleCloseTimer: NodeJS.Timeout | null = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of idle closes browser to free RAM

function scheduleIdleClose() {
  if (idleCloseTimer) clearTimeout(idleCloseTimer);
  idleCloseTimer = setTimeout(async () => {
    if (browserInstance) {
      console.log("[Playwright] Reclaiming idle Chromium process to preserve memory...");
      await closeBrowser();
    }
  }, IDLE_TIMEOUT_MS);
}

export async function getBrowser(): Promise<Browser> {
  // Clear any scheduled idle shutdown
  if (idleCloseTimer) {
    clearTimeout(idleCloseTimer);
    idleCloseTimer = null;
  }

  // If browser has handled maximum scans, recycle it to eliminate V8 heap leaks
  if (browserInstance && scansCompletedSinceLaunch >= MAX_SCANS_BEFORE_RECYCLE) {
    console.log(`[Playwright] Recycling browser after ${scansCompletedSinceLaunch} scans to release memory.`);
    await closeBrowser();
  }

  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  console.log("[Playwright] Launching Chromium instance with low-memory configuration...");
  browserInstance = await chromium.launch({
    headless: env.PLAYWRIGHT_HEADLESS,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-zygote",
      "--disable-background-networking",
      "--disable-default-apps",
      "--mute-audio",
      "--renderer-process-limit=2",
      "--js-flags=--max-old-space-size=256",
    ],
  });

  scansCompletedSinceLaunch = 0;

  browserInstance.on("disconnected", () => {
    console.warn("[Playwright] Chromium disconnected.");
    browserInstance = null;
    scansCompletedSinceLaunch = 0;
  });

  return browserInstance;
}

export function notifyScanComplete(): void {
  scansCompletedSinceLaunch++;
  scheduleIdleClose();
}

export async function closeBrowser(): Promise<void> {
  if (idleCloseTimer) {
    clearTimeout(idleCloseTimer);
    idleCloseTimer = null;
  }
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
    scansCompletedSinceLaunch = 0;
  }
}

