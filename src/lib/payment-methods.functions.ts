import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type PaymentMethodRow = {
  id: string;
  name: string;
  logo_url: string;
  address: string;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

async function ensureAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

// ----- Shared image validation (magic-byte sniffing) -----
const IMG_MAX_BYTES = 2 * 1024 * 1024; // 2MB
const IMG_ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

function sniffImageMime(buf: Uint8Array): string | null {
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "image/png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "image/jpeg";
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  return null;
}

// ----- Field-level validation schema -----
const baseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Max 80 characters"),
  logo_url: z.string().url("Logo URL is required").max(1000),
  address: z.string().trim().min(1, "Address/number is required").max(200, "Max 200 characters"),
  min_amount: z.number({ invalid_type_error: "Enter a valid minimum" }).min(0, "Must be ≥ 0").max(10_000_000),
  max_amount: z.number({ invalid_type_error: "Enter a valid maximum" }).min(0, "Must be ≥ 0").max(10_000_000),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(10_000).optional(),
});

const upsertSchema = baseSchema.refine((d) => d.max_amount >= d.min_amount, {
  message: "Max must be ≥ min",
  path: ["max_amount"],
});

export type PaymentMethodFieldErrors = Partial<
  Record<"name" | "logo_url" | "address" | "min_amount" | "max_amount", string>
>;

function flattenFieldErrors(err: z.ZodError): PaymentMethodFieldErrors {
  const out: PaymentMethodFieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      (out as Record<string, string>)[key] = issue.message;
    }
  }
  return out;
}

// ----- USER: list active methods -----
export const listActivePaymentMethods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("payment_methods")
      .select("id,name,logo_url,address,min_amount,max_amount,is_active,sort_order,created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => ({
      ...m,
      min_amount: Number(m.min_amount),
      max_amount: Number(m.max_amount),
    })) as PaymentMethodRow[];
  });

// ----- ADMIN list -----
export const adminListPaymentMethods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("payment_methods")
      .select("id,name,logo_url,address,min_amount,max_amount,is_active,sort_order,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => ({
      ...m,
      min_amount: Number(m.min_amount),
      max_amount: Number(m.max_amount),
    })) as PaymentMethodRow[];
  });

// ----- ADMIN: upload logo (FormData) with server-side image validation -----
export const adminUploadPaymentLogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    const file = input.get("file");
    if (!(file instanceof File)) {
      throw new Error("No file provided");
    }
    return { file };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const file = data.file;

    // Size check (pre-read)
    if (file.size === 0) {
      return { success: false as const, error: "File is empty" };
    }
    if (file.size > IMG_MAX_BYTES) {
      return { success: false as const, error: "Max file size is 2MB" };
    }

    // Read bytes once and sniff magic bytes — never trust the client-reported
    // content type. Reject anything that isn't a true PNG / JPEG / WEBP.
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length !== file.size || bytes.length > IMG_MAX_BYTES) {
      return { success: false as const, error: "Invalid file" };
    }
    const sniffed = sniffImageMime(bytes.subarray(0, 16));
    if (!sniffed || !IMG_ALLOWED.has(sniffed)) {
      return {
        success: false as const,
        error: "Only PNG, JPG, or WEBP images are allowed",
      };
    }

    // Upload via admin client (RLS bypass — already authorised above)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = sniffed === "image/png" ? "png" : sniffed === "image/jpeg" ? "jpg" : "webp";
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("payment-method-logos")
      .upload(path, bytes, {
        contentType: sniffed,
        upsert: false,
      });
    if (upErr) {
      return { success: false as const, error: upErr.message };
    }

    const { data: pub } = supabaseAdmin.storage
      .from("payment-method-logos")
      .getPublicUrl(path);

    return { success: true as const, url: pub.publicUrl, path };
  });

// ----- ADMIN: create method (returns structured field errors on validation fail) -----
export const adminCreatePaymentMethod = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const parsed = upsertSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        fieldErrors: flattenFieldErrors(parsed.error),
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("payment_methods")
      .insert({
        name: parsed.data.name,
        logo_url: parsed.data.logo_url,
        address: parsed.data.address,
        min_amount: parsed.data.min_amount,
        max_amount: parsed.data.max_amount,
        is_active: parsed.data.is_active ?? true,
        sort_order: parsed.data.sort_order ?? 0,
        created_by: userId,
      })
      .select()
      .single();
    if (error) {
      return { success: false as const, error: error.message };
    }
    return { success: true as const, row };
  });

export const adminUpdatePaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(80).optional(),
      logo_url: z.string().url().max(1000).optional(),
      address: z.string().trim().min(1).max(200).optional(),
      min_amount: z.number().min(0).max(10_000_000).optional(),
      max_amount: z.number().min(0).max(10_000_000).optional(),
      is_active: z.boolean().optional(),
      sort_order: z.number().int().min(0).max(10_000).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("payment_methods").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminDeletePaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("payment_methods").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
