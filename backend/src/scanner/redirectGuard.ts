import { Page, Route } from "playwright";
import { validateUrlSafety } from "../services/ssrfService.js";

/**
 * Attaches real-time navigation and redirect protection to a Playwright page.
 * Blocks any frame from navigating to internal/private addresses, cloud metadata, or non-HTTP protocols.
 */
export async function attachRedirectGuard(
  page: Page,
  options?: { allowLocalhost?: boolean }
): Promise<void> {
  await page.route("**/*", async (route: Route) => {
    const request = route.request();
    const resourceType = request.resourceType();

    // 1. RAM Optimization: Abort non-essential heavy binary assets immediately
    if (["image", "media", "font"].includes(resourceType)) {
      return route.abort();
    }

    // 2. Navigation / Redirect SSRF Protection
    if (request.isNavigationRequest()) {
      const url = request.url();
      const safety = await validateUrlSafety(url, options);

      if (!safety.safe) {
        console.warn(`[RedirectGuard] Aborted navigation to unsafe target: ${url} (${safety.error})`);
        return route.abort("accessdenied");
      }
    }

    return route.continue();
  });
}
