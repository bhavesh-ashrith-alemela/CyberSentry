import { z } from "zod";

export const CreateScanSchema = z.object({
  url: z
    .string({ required_error: "Website URL is required." })
    .min(3, "URL is too short.")
    .max(2048, "URL is too long.")
    .refine((val) => {
      try {
        const testUrl = /^https?:\/\//i.test(val) ? val : `https://${val}`;
        const parsed = new URL(testUrl);
        return parsed.hostname.length > 0;
      } catch {
        return false;
      }
    }, "Please provide a valid website address."),
});

export const ListScansQuerySchema = z.object({
  page: z.string().optional().default("1").transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z.string().optional().default("10").transform((v) => Math.min(50, Math.max(1, parseInt(v, 10) || 10))),
  domain: z.string().optional(),
  status: z.enum(["pending", "scanning", "analyzing", "completed", "failed"]).optional(),
});

export const CompareScansQuerySchema = z.object({
  scanA: z.string().uuid("scanA must be a valid UUID."),
  scanB: z.string().uuid("scanB must be a valid UUID."),
});

export const ScanIdParamSchema = z.object({
  id: z.string().uuid("Invalid scan ID format."),
});
