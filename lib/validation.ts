import { z } from "zod";

const clean = (s: string) => s.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
const cleanMultiline = (s: string) => s.replace(/[<>]/g, "").trim();

const optionalText = (max: number, multiline = false) =>
  z
    .string()
    .max(max * 2)
    .optional()
    .nullable()
    .transform((v) => {
      if (!v) return null;
      const out = (multiline ? cleanMultiline(v) : clean(v)).slice(0, max);
      return out.length ? out : null;
    });

const dateStr = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null));

export const leadSchema = z
  .object({
    full_name: z
      .string()
      .transform(clean)
      .pipe(z.string().min(2, "Enter your full name").max(120, "Name is too long")),
    phone: z
      .string()
      .transform((v) => v.replace(/[^\d+]/g, ""))
      .pipe(
        z
          .string()
          .regex(/^(\+?91)?[6-9]\d{9}$|^\+?\d{10,15}$/, "Enter a valid mobile number"),
      ),
    email: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v ? v.trim().toLowerCase() : null))
      .refine((v) => v === null || z.string().email().max(160).safeParse(v).success, "Enter a valid email address"),
    check_in: dateStr,
    check_out: dateStr,
    guests: z.coerce.number().int().min(1).max(50).optional().nullable().catch(null),
    preference: optionalText(80),
    message: optionalText(2000, true),
    source: optionalText(60),
    page: optionalText(200),
    utm: z.record(z.string().max(220)).optional().nullable().catch(null),
    // Anti-spam
    company: z.string().optional(), // honeypot — must stay empty
    started_at: z.coerce.number().optional(),
  })
  .refine((d) => !d.check_in || !d.check_out || d.check_out >= d.check_in, {
    message: "Check-out must be on or after check-in",
    path: ["check_out"],
  });

export type LeadInput = z.input<typeof leadSchema>;
export type LeadParsed = z.output<typeof leadSchema>;
