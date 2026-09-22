import { Page } from "playwright";
import { DetailedBannerInfo } from "./bannerDetector.js";

export interface ConsentTestResult {
  tested: boolean;
  action: "accept" | "reject" | "none";
  buttonText: string | null;
  observedNewCookies: number;
  observedNewRequests: number;
  reason?: string;
  details?: string;
}

/**
 * Safely tests consent choice interactions when an unambiguous consent button is identified.
 * Only reports success if the interaction was actually performed and its delta was observed.
 */
export async function testConsentChoice(
  page: Page,
  bannerInfo: DetailedBannerInfo,
  initialCookieCount: number
): Promise<ConsentTestResult> {
  // If no banner or no recognizable accept button, return un-tested
  if (!bannerInfo.detected || !bannerInfo.acceptButton.detected || !bannerInfo.acceptButton.text) {
    return {
      tested: false,
      action: "none",
      buttonText: null,
      observedNewCookies: 0,
      observedNewRequests: 0,
      reason: "No unambiguous consent button detected.",
    };
  }

  const targetText = bannerInfo.acceptButton.text.trim();
  let newRequestCount = 0;

  // Temporary listener to monitor outbound network calls triggered by consent interaction
  const requestListener = () => {
    newRequestCount++;
  };
  page.on("request", requestListener);

  try {
    // 1. Locate the button specifically by text and role, ensuring it is visible
    const buttonLocator = page
      .locator("button, a, input[type='button'], div[role='button']")
      .filter({ hasText: targetText })
      .first();

    const isVisible = await buttonLocator.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      page.off("request", requestListener);
      return {
        tested: false,
        action: "accept",
        buttonText: targetText,
        observedNewCookies: 0,
        observedNewRequests: 0,
        reason: "Identified consent button was obscured or not interactable.",
      };
    }

    // 2. Perform safe click with a strict timeout
    console.log(`[ConsentTester] Safely clicking consent option: "${targetText}"`);
    await buttonLocator.click({ timeout: 3000 });

    // 3. Dwell briefly (2 seconds) to observe post-consent cookies and telemetry calls
    await page.waitForTimeout(2000);

    // 4. Measure delta
    const postCookies = await page.context().cookies();
    const observedNewCookies = Math.max(0, postCookies.length - initialCookieCount);

    page.off("request", requestListener);

    return {
      tested: true,
      action: "accept",
      buttonText: targetText,
      observedNewCookies,
      observedNewRequests: newRequestCount,
      details: `Successfully interacted with "${targetText}". Observed ${observedNewCookies} additional cookies and ${newRequestCount} network calls post-consent.`,
    };
  } catch (err: any) {
    page.off("request", requestListener);
    return {
      tested: false,
      action: "accept",
      buttonText: targetText,
      observedNewCookies: 0,
      observedNewRequests: 0,
      reason: `Consent interaction could not be completed safely: ${err.message}`,
    };
  }
}
