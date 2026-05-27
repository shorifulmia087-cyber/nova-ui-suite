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

const upsertSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  logo_url: z.string().url("Logo URL is required").max(1000),
  address: z.string().trim().min(1, "Address/number is required").max(200),
  min_amount: z.number().min(0).max(10_000_000),
  max_amount: z.number().min(0).max(10_000_000),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(10_000).optional(),
}).refine((d) => d.max_amount >= d.min_amount, {
  message: "Maximum must be ≥ minimum",
  path: ["max_amount"],
});

// USER: list active methods (for verify screen)
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

// ADMIN
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

export const adminCreatePaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("payment_methods")
      .insert({
        name: data.name,
        logo_url: data.logo_url,
        address: data.address,
        min_amount: data.min_amount,
        max_amount: data.max_amount,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
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
