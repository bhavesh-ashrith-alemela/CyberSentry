import { z } from "zod";

export const CreateScanSchema = z.object({
  url: z
    .string({ required_error: "Website URL is required." })
    .trim()
    .min(1, "Website URL is required.")
    .max(2048, "URL is too long.")
    .superRefine((val, ctx) => {
      // Reject explicit unsupported protocols (e.g. ftp://, file://, gopher://)
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(val) && !/^https?:\/\//i.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only HTTP and HTTPS protocols are permitted.",
        });
        return;
      }

      try {
        const testUrl = /^https?:\/\//i.test(val) ? val : `https://${val}`;
        const parsed = new URL(testUrl);
        if (!parsed.hostname || !parsed.hostname.includes(".")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please provide a valid website address with a domain name.",
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please provide a valid website address.",
        });
      }
    }),
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
