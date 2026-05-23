import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// --- Validation schemas ---
const sanitizeText = (s: string) =>
  s.replace(/[\u0000-\u001F\u007F<>]/g, "").trim();

const submitSchema = z.object({
  tier_id: z.string().uuid(),
  video_url: z
    .string()
    .url()
    .max(500)
    .refine(
      (u) => /youtube\.com|youtu\.be/i.test(u),
      "YouTube ভিডিও URL দিন",
    ),
  channel_name: z.string().min(1).max(120).transform(sanitizeText),
  channel_logo_url: z.string().url().max(800),
  analytics_url: z.string().url().max(800),
});

export type SubmitVideoInput = z.input<typeof submitSchema>;

// --- Server fns ---
export const listVideoTiers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("video_tiers")
      .select("id, min_views, reward_amount, label, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { tiers: data ?? [] };
  });

export const listMyVideoSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("video_submissions")
      .select(
        "id, tier_id, video_url, channel_name, channel_logo_url, analytics_url, status, reward_amount, admin_note, reviewed_at, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return { submissions: data ?? [] };
  });

export const submitVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Re-fetch tier server-side so reward cannot be tampered with from client
    const { data: tier, error: tierErr } = await supabase
      .from("video_tiers")
      .select("id, reward_amount, is_active")
      .eq("id", data.tier_id)
      .maybeSingle();
    if (tierErr) throw new Error(tierErr.message);
    if (!tier || !tier.is_active) throw new Error("অবৈধ টিয়ার");

    const { data: row, error } = await supabase
      .from("video_submissions")
      .insert({
        user_id: userId,
        tier_id: tier.id,
        reward_amount: tier.reward_amount,
        video_url: data.video_url,
        channel_name: data.channel_name,
        channel_logo_url: data.channel_logo_url,
        analytics_url: data.analytics_url,
      })
      .select("id, status, reward_amount, created_at")
      .single();
    if (error) throw new Error(error.message);

    return { submission: row };
  });
