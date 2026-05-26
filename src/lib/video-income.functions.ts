import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// --- Validation schemas ---
const sanitizeText = (s: string) =>
  s.replace(/[\u0000-\u001F\u007F<>]/g, "").trim();

const youtubeUrl = z
  .string()
  .url()
  .max(500)
  .refine(
    (u) => /(?:youtube\.com|youtu\.be)/i.test(u),
    "YouTube লিঙ্ক দিন",
  );

// Storage path inside the `video-uploads` bucket. Must start with the user id
// folder so storage RLS policy allows it. We re-validate the user id match on
// the server below.
const storagePath = z
  .string()
  .min(1)
  .max(500)
  .regex(/^[a-zA-Z0-9._\-\/]+$/, "Invalid file path");

export const submitVideoSchema = z.object({
  tier_id: z.string().uuid(),
  video_url: youtubeUrl,
  channel_name: z.string().min(1).max(120).transform(sanitizeText),
  channel_link: youtubeUrl,
  channel_logo_path: storagePath,
  analytics_path: storagePath,
});

export type SubmitVideoInput = z.input<typeof submitVideoSchema>;

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
        "id, tier_id, video_url, channel_name, channel_link, channel_logo_url, analytics_url, status, reward_amount, admin_note, reviewed_at, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return { submissions: data ?? [] };
  });

export const submitVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => submitVideoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Guard: storage paths must belong to this user (matches storage RLS)
    const ownsPath = (p: string) => p.split("/")[0] === userId;
    if (!ownsPath(data.channel_logo_path) || !ownsPath(data.analytics_path)) {
      throw new Error("Invalid upload path");
    }

    // Block creating a new submission while one is still pending
    const { data: pending, error: pendingErr } = await supabase
      .from("video_submissions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .limit(1);
    if (pendingErr) throw new Error(pendingErr.message);
    if (pending && pending.length > 0) {
      throw new Error("ইতিমধ্যে একটি সাবমিশন পেন্ডিং রয়েছে");
    }

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
        channel_link: data.channel_link,
        channel_logo_url: data.channel_logo_path,
        analytics_url: data.analytics_path,
      })
      .select("id, status, reward_amount, created_at")
      .single();
    if (error) throw new Error(error.message);

    return { submission: row };
  });
