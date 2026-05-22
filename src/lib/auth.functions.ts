import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { signupSchema } from "./auth-schemas";

// Generate a unique referral code for a new user
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 8; i++) out += chars[bytes[i] % chars.length];
  return out;
}

export const signupUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // ---- Rate limiting by IP (max 5 signups / hour) ----
    const ip =
      getRequestIP({ xForwardedFor: true }) ||
      getRequestHeader("x-real-ip") ||
      "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("signup_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= 5) {
      throw new Error("Too many signup attempts. Please try again in an hour.");
    }

    await supabaseAdmin.from("signup_attempts").insert({ ip, email: data.email });

    // ---- Validate referral code (if provided) ----
    const referredByRaw = data.referral_code?.trim();
    let referredBy: string | null = null;
    if (referredByRaw) {
      const { data: refRow, error: refErr } = await supabaseAdmin
        .from("profiles")
        .select("referral_code")
        .eq("referral_code", referredByRaw)
        .eq("is_deleted", false)
        .maybeSingle();
      if (refErr) throw new Error("Referral code lookup failed");
      if (!refRow) throw new Error("Invalid referral code");
      referredBy = refRow.referral_code;
    }

    // ---- Ensure unique mobile number ----
    const { data: existingMobile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("mobile_number", data.mobile_number)
      .maybeSingle();
    if (existingMobile) throw new Error("Mobile number is already registered");

    // ---- Generate unique user referral code ----
    let myReferral = generateReferralCode();
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabaseAdmin
        .from("profiles")
        .select("referral_code")
        .eq("referral_code", myReferral)
        .maybeSingle();
      if (!exists) break;
      myReferral = generateReferralCode();
    }

    // ---- Create auth user ----
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        referral_code: myReferral,
        referred_by: referredBy ?? "",
      },
    });

    if (createErr || !created.user) {
      const msg = createErr?.message ?? "Failed to create account";
      if (/already registered|exists/i.test(msg)) {
        throw new Error("This email is already registered");
      }
      throw new Error(msg);
    }

    return { success: true, referralCode: myReferral, email: data.email };
  });
