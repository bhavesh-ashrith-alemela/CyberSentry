import { Page } from "playwright";

export interface WebsiteMetadata {
  title: string;
  finalUrl: string;
  metaTags: {
    description?: string;
    generator?: string;
    viewport?: string;
    charset?: string;
  };
}

/**
 * Extracts page title, canonical/final destination URL, and relevant HTML meta tags
 */
export async function extractMetadata(page: Page): Promise<WebsiteMetadata> {
  const finalUrl = page.url();
  let title = "";

  try {
    title = (await page.title()) || "";
  } catch {
    title = "";
  }

  const metaTags: WebsiteMetadata["metaTags"] = {};

  try {
    const metas = await page.evaluate(() => {
      const result: Record<string, string> = {};
      const desc = document.querySelector('meta[name="description"]');
      if (desc) result.description = desc.getAttribute("content") || "";

      const gen = document.querySelector('meta[name="generator"]');
      if (gen) result.generator = gen.getAttribute("content") || "";

      const view = document.querySelector('meta[name="viewport"]');
      if (view) result.viewport = view.getAttribute("content") || "";

      const charset = document.querySelector("meta[charset]");
      if (charset) result.charset = charset.getAttribute("charset") || "";

      return result;
    });

    Object.assign(metaTags, metas);
  } catch {
    // Non-fatal if metadata extraction encounters restrictions
  }

  return {
    title: title.slice(0, 500),
    finalUrl,
    metaTags,
  };
}
