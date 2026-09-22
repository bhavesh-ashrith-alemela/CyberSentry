import { chromium, Browser } from "playwright";
import { env } from "../config/env.js";

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

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
    ],
  });

  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}
