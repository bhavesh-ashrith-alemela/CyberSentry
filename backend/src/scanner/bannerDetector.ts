import { Page } from "playwright";
import { KNOWN_CMPS } from "../analyzer/trackerDb.js";

export interface DetailedBannerInfo {
  detected: boolean;
  cmpName: string | null;
  bannerText: string | null;
  visibility: "visible" | "hidden" | "unknown";
  acceptButton: {
    detected: boolean;
    text: string | null;
    selector?: string;
  };
  rejectButton: {
    detected: boolean;
    text: string | null;
    selector?: string;
  };
  settingsButton: {
    detected: boolean;
    text: string | null;
    selector?: string;
  };
  optionIndicators: {
    detected: boolean;
    count: number;
    types: string[]; // e.g. ["checkbox", "toggle"]
  };
}

export async function detectConsentBanner(page: Page): Promise<DetailedBannerInfo> {
  const result: DetailedBannerInfo = {
    detected: false,
    cmpName: null,
    bannerText: null,
    visibility: "unknown",
    acceptButton: { detected: false, text: null },
    rejectButton: { detected: false, text: null },
    settingsButton: { detected: false, text: null },
    optionIndicators: { detected: false, count: 0, types: [] },
  };

  try {
    // 1. Check known CMPs and selectors
    for (const cmp of KNOWN_CMPS) {
      for (const selector of cmp.selectors) {
        try {
          const el = await page.$(selector);
          if (el) {
            const isVis = await el.isVisible().catch(() => false);
            const textContent = (await el.innerText().catch(() => "")) || "";

            result.detected = true;
            result.cmpName = cmp.name;
            result.visibility = isVis ? "visible" : "hidden";
            result.bannerText = textContent.trim().slice(0, 800) || null;
            break;
          }
        } catch {}
      }
      if (result.detected) break;

      // Script pattern check
      for (const pat of cmp.scriptPatterns) {
        const hasScript = await page
          .evaluate((pattern) => {
            const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>("script"));
            return scripts.some((s) => s.src && s.src.toLowerCase().includes(pattern.toLowerCase()));
          }, pat)
          .catch(() => false);

        if (hasScript) {
          result.detected = true;
          result.cmpName = cmp.name;
          result.visibility = "visible";
          break;
        }
      }
      if (result.detected) break;
    }

    // 2. Check window object CMP globals
    if (!result.detected) {
      const windowCmp = await page
        .evaluate(() => {
          const win = window as any;
          if (win.OneTrust || win.Optanon) return "OneTrust";
          if (win.Cookiebot) return "Cookiebot";
          if (win.didomiOnReady || win.Didomi) return "Didomi";
          if (win.UC_UI || win.__tcfapi) return "Usercentrics / TCF";
          if (win.truste) return "TrustArc";
          return null;
        })
        .catch(() => null);

      if (windowCmp) {
        result.detected = true;
        result.cmpName = windowCmp;
        result.visibility = "visible";
      }
    }

    // 3. Inspect DOM for buttons (Accept, Reject, Preferences) and Option Toggles
    const domScan = await page
      .evaluate(() => {
        const buttons = Array.from(document.querySelectorAll<HTMLElement>("button, a, input[type='button'], div[role='button']"));

        let foundAccept: { text: string; selector?: string } | null = null;
        let foundReject: { text: string; selector?: string } | null = null;
        let foundSettings: { text: string; selector?: string } | null = null;

        const acceptRegex = /accept (all|cookies|recommended)?|allow (all|cookies)?|agree|i accept|got it|consent/i;
        const rejectRegex = /reject (all|cookies)?|decline (all|cookies)?|deny (all)?|disagree|necessary only|only essential/i;
        const settingsRegex = /cookie settings|manage (cookies|preferences|options)|privacy settings|customize|preferences/i;

        for (const b of buttons) {
          const text = (b.textContent || b.getAttribute("value") || "").trim();
          if (!text || text.length > 60) continue;

          // Check visibility
          const isVisible = b.offsetParent !== null;
          if (!isVisible) continue;

          if (!foundAccept && acceptRegex.test(text)) {
            foundAccept = { text };
          } else if (!foundReject && rejectRegex.test(text)) {
            foundReject = { text };
          } else if (!foundSettings && settingsRegex.test(text)) {
            foundSettings = { text };
          }
        }

        // Check for consent options (toggles, checkboxes inside consent banners)
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[type='checkbox'], [role='switch']"));
        const consentInputs = inputs.filter((inp) => {
          const nameOrId = (inp.name + " " + inp.id + " " + (inp.getAttribute("aria-label") || "")).toLowerCase();
          return /cookie|consent|analytics|marketing|advertising|tracking/i.test(nameOrId);
        });

        return {
          foundAccept,
          foundReject,
          foundSettings,
          optionCount: consentInputs.length,
          hasToggles: consentInputs.some((inp) => inp.getAttribute("role") === "switch"),
          hasCheckboxes: consentInputs.some((inp) => inp.type === "checkbox"),
        };
      })
      .catch(() => null);

    if (domScan) {
      if (domScan.foundAccept) {
        result.acceptButton = { detected: true, text: domScan.foundAccept.text };
      }
      if (domScan.foundReject) {
        result.rejectButton = { detected: true, text: domScan.foundReject.text };
      }
      if (domScan.foundSettings) {
        result.settingsButton = { detected: true, text: domScan.foundSettings.text };
      }

      if (domScan.optionCount > 0) {
        const types: string[] = [];
        if (domScan.hasCheckboxes) types.push("checkbox");
        if (domScan.hasToggles) types.push("toggle");
        result.optionIndicators = {
          detected: true,
          count: domScan.optionCount,
          types,
        };
      }

      // If buttons were found even without a known CMP, mark as generic cookie banner
      if (!result.detected && (domScan.foundAccept || domScan.foundReject || domScan.foundSettings)) {
        result.detected = true;
        result.cmpName = "Standard Cookie Banner";
        result.visibility = "visible";
      }
    }

    return result;
  } catch (err: any) {
    return result;
  }
}
