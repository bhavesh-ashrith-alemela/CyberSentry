import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { trackers, users, websites, NewTracker } from "./schema.js";

const SEED_TRACKERS: Omit<NewTracker, "id">[] = [
  // Analytics Trackers
  {
    name: "Google Analytics",
    domain: "google-analytics.com",
    company: "Google LLC",
    category: "Analytics",
    description: "Tracks visitor metrics, page views, session durations, and user demographics across the web.",
    websiteUrl: "https://analytics.google.com",
    riskLevel: "medium",
  },
  {
    name: "Google Tag Manager",
    domain: "googletagmanager.com",
    company: "Google LLC",
    category: "Analytics",
    description: "Tag management system utilized to load third-party ad pixels, marketing tags, and analytics scripts dynamically.",
    websiteUrl: "https://tagmanager.google.com",
    riskLevel: "medium",
  },
  {
    name: "Mixpanel",
    domain: "mixpanel.com",
    company: "Mixpanel, Inc.",
    category: "Analytics",
    description: "Product and behavioral analytics platform tracking distinct user actions and retention funnels.",
    websiteUrl: "https://mixpanel.com",
    riskLevel: "medium",
  },
  {
    name: "Amplitude",
    domain: "amplitude.com",
    company: "Amplitude, Inc.",
    category: "Analytics",
    description: "Digital product intelligence and cross-platform behavioral event tracker.",
    websiteUrl: "https://amplitude.com",
    riskLevel: "medium",
  },
  {
    name: "Segment",
    domain: "segment.io",
    company: "Twilio, Inc.",
    category: "Analytics",
    description: "Customer data platform (CDP) capturing events and multiplexing them to downstream marketing services.",
    websiteUrl: "https://segment.com",
    riskLevel: "medium",
  },

  // Advertising & Retargeting Trackers
  {
    name: "Google DoubleClick",
    domain: "doubleclick.net",
    company: "Google LLC",
    category: "Advertising",
    description: "Real-time bidding ad server and programmatic exchange conducting cross-site user profiling.",
    websiteUrl: "https://marketingplatform.google.com",
    riskLevel: "high",
  },
  {
    name: "Google Ad Services",
    domain: "googleadservices.com",
    company: "Google LLC",
    category: "Advertising",
    description: "Conversion tracking, click attribution, and remarketing for Google Search and Display Ads.",
    websiteUrl: "https://ads.google.com",
    riskLevel: "high",
  },
  {
    name: "Meta Pixel",
    domain: "connect.facebook.net",
    company: "Meta Platforms, Inc.",
    category: "Advertising",
    description: "Tracks site conversions, page views, and button clicks to build targeted Facebook & Instagram custom audiences.",
    websiteUrl: "https://www.facebook.com/business/tools/meta-pixel",
    riskLevel: "high",
  },
  {
    name: "Criteo Retargeting",
    domain: "criteo.com",
    company: "Criteo SA",
    category: "Advertising",
    description: "Dynamic product retargeting network delivering personalized display ads to returning visitors.",
    websiteUrl: "https://www.criteo.com",
    riskLevel: "high",
  },
  {
    name: "TikTok Pixel",
    domain: "analytics.tiktok.com",
    company: "ByteDance Ltd.",
    category: "Advertising",
    description: "Tracks visitor conversion actions to optimize TikTok ad delivery and audience targeting.",
    websiteUrl: "https://ads.tiktok.com",
    riskLevel: "high",
  },
  {
    name: "Amazon Advertising",
    domain: "amazon-adsystem.com",
    company: "Amazon.com, Inc.",
    category: "Advertising",
    description: "Behavioral ad attribution and retargeting engine for the Amazon Advertising platform.",
    websiteUrl: "https://advertising.amazon.com",
    riskLevel: "high",
  },
  {
    name: "AppNexus / Xandr",
    domain: "adnxs.com",
    company: "Microsoft Corp",
    category: "Advertising",
    description: "Global programmatic marketplace for real-time digital advertising auctioning and audience matching.",
    websiteUrl: "https://www.xandr.com",
    riskLevel: "high",
  },

  // Fingerprinting & Session Replay
  {
    name: "Hotjar",
    domain: "hotjar.com",
    company: "Hotjar Ltd",
    category: "Fingerprinting",
    description: "Session recording tool capturing mouse movements, clicks, scrolling behavior, and user journey heatmaps.",
    websiteUrl: "https://www.hotjar.com",
    riskLevel: "critical",
  },
  {
    name: "Microsoft Clarity",
    domain: "clarity.ms",
    company: "Microsoft Corp",
    category: "Fingerprinting",
    description: "Behavioral analytics service recording visual click heatmaps and session playbacks.",
    websiteUrl: "https://clarity.microsoft.com",
    riskLevel: "critical",
  },
  {
    name: "FullStory",
    domain: "fullstory.com",
    company: "FullStory, Inc.",
    category: "Fingerprinting",
    description: "DOM-recording digital experience platform logging fine-grained user interactions and device telemetry.",
    websiteUrl: "https://www.fullstory.com",
    riskLevel: "critical",
  },

  // Social Trackers
  {
    name: "LinkedIn Insight Tag",
    domain: "licdn.com",
    company: "Microsoft Corp",
    category: "Social",
    description: "Conversion tracking and demographic profiling for B2B LinkedIn campaign targeting.",
    websiteUrl: "https://business.linkedin.com/marketing-solutions/insight-tag",
    riskLevel: "medium",
  },
  {
    name: "X (Twitter) Ads",
    domain: "ads-twitter.com",
    company: "X Corp.",
    category: "Social",
    description: "Conversion tracking pixel and audience matching tag for X advertising.",
    websiteUrl: "https://business.twitter.com",
    riskLevel: "medium",
  },

  // Essential / Content CDN
  {
    name: "Cloudflare CDN",
    domain: "cdnjs.cloudflare.com",
    company: "Cloudflare, Inc.",
    category: "Content/CDN",
    description: "Open-source asset delivery network for JavaScript libraries and web components.",
    websiteUrl: "https://cdnjs.com",
    riskLevel: "low",
  },
  {
    name: "Google Fonts",
    domain: "fonts.googleapis.com",
    company: "Google LLC",
    category: "Content/CDN",
    description: "Web font delivery API serving typographic stylesheets and static font files.",
    websiteUrl: "https://fonts.google.com",
    riskLevel: "low",
  },
];

async function seed() {
  console.log("Starting CyberSentry PostgreSQL database seeding...");

  try {
    // 1. Seed Tracker Knowledge Base
    console.log(`Seeding ${SEED_TRACKERS.length} trackers into knowledge base...`);
    let insertedTrackers = 0;

    for (const t of SEED_TRACKERS) {
      const existing = await db.select().from(trackers).where(eq(trackers.domain, t.domain)).limit(1);

      if (existing.length === 0) {
        await db.insert(trackers).values(t);
        insertedTrackers++;
      }
    }
    console.log(`Inserted ${insertedTrackers} new tracker records (${SEED_TRACKERS.length - insertedTrackers} already present).`);

    // 2. Seed Default User (For academic research / audit log)
    const demoEmail = "researcher@cybersentry.local";
    const existingUser = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
    let userId: string;

    if (existingUser.length === 0) {
      const inserted = await db
        .insert(users)
        .values({
          email: demoEmail,
          name: "Academic Researcher",
          role: "researcher",
        })
        .returning({ id: users.id });
      userId = inserted[0].id;
      console.log(`Created default user: ${demoEmail} (ID: ${userId})`);
    } else {
      userId = existingUser[0].id;
      console.log(`Default user exists: ${demoEmail}`);
    }

    // 3. Seed Sample Websites
    const sampleSites = [
      { url: "https://example.com", domain: "example.com" },
      { url: "https://wikipedia.org", domain: "wikipedia.org" },
    ];

    for (const s of sampleSites) {
      const existingSite = await db.select().from(websites).where(eq(websites.domain, s.domain)).limit(1);
      if (existingSite.length === 0) {
        await db.insert(websites).values({
          userId,
          url: s.url,
          domain: s.domain,
        });
        console.log(`Created sample website record: ${s.domain}`);
      }
    }

    console.log("Database seeding completed successfully.");
  } catch (error: any) {
    console.error("Database seeding failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end().catch(() => {});
    process.exit(0);
  }
}

seed();
