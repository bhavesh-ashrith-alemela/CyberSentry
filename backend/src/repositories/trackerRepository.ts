import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { trackers, Tracker } from "../db/schema.js";

export class TrackerRepository {
  async getAllTrackers(): Promise<Tracker[]> {
    return db.select().from(trackers);
  }

  async findByDomain(domain: string): Promise<Tracker | null> {
    const list = await db
      .select()
      .from(trackers)
      .where(eq(trackers.domain, domain))
      .limit(1);

    return list.length > 0 ? list[0] : null;
  }
}

export const trackerRepository = new TrackerRepository();
