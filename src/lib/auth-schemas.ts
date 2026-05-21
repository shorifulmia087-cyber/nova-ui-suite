import { z } from "zod";

// Sanitizers strip control chars & trim. Use in both client and server.
const sanitize = (s: string) => s.replace(/[\u0000-\u001F\u007F<>]/g, "").trim();

export const signupSchema = z.object({
  full_name: z
    .string()
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be under 100 characters")
        .regex(/^[\p{L}\p{M}\s.'-]+$/u, "Name contains invalid characters"),
    ),
  mobile_number: z
    .string()
    .transform((s) => sanitize(s).replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^[0-9]{10,15}$/, "Enter a valid mobile number (10-15 digits)"),
    ),
  email: z
    .string()
    .transform((s) => sanitize(s).toLowerCase())
    .pipe(z.string().email("Invalid email address").max(254)),
  referral_code: z
    .string()
    .transform((s) => sanitize(s).toUpperCase())
    .pipe(
      z
        .string()
        .regex(/^[A-Z0-9]{6,12}$/, "Referral code must be 6-12 letters/numbers")
        .optional()
        .or(z.literal("")),
    )
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
});

export type SignupInput = z.input<typeof signupSchema>;
export type SignupParsed = z.output<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .transform((s) => sanitize(s).toLowerCase())
    .pipe(z.string().email("Invalid email").max(254)),
  password: z.string().min(1, "Password is required").max(72),
});

export type LoginInput = z.input<typeof loginSchema>;
