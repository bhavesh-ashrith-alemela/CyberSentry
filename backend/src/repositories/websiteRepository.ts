import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { websites, Website } from "../db/schema.js";

export class WebsiteRepository {
  async findOrCreateWebsite(url: string, domain: string): Promise<Website> {
    const existing = await db
      .select()
      .from(websites)
      .where(eq(websites.domain, domain))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(websites)
      .values({
        url,
        domain,
      })
      .returning();

    return inserted[0];
  }

  async findById(id: string): Promise<Website | null> {
    const records = await db
      .select()
      .from(websites)
      .where(eq(websites.id, id))
      .limit(1);

    return records.length > 0 ? records[0] : null;
  }
}

export const websiteRepository = new WebsiteRepository();
