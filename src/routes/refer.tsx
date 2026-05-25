import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton, StatPill } from "@/components/mobile/Primitives";
import { Copy, Share2, Users, Sparkles, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/refer")({
  head: () => ({ meta: [{ title: "Refer & Earn — Ness" }, { name: "description", content: "Invite friends and earn ৳25 each." }] }),
  component: Refer,
});

function Refer() {
  const [copied, setCopied] = useState(false);
  const { profile, loading: profileLoading } = useProfile();
  const [referralsCount, setReferralsCount] = useState(0);
  const code = profile?.referral_code || "";
  const codeLoading = profileLoading && !profile?.referral_code;


  useEffect(() => {
    if (!profile?.referral_code) return;
    import("@/integrations/supabase/client").then(({ supabase }) =>
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", profile.referral_code!)
        .then(({ count }) => setReferralsCount(count ?? 0))
    );
  }, [profile?.referral_code]);

  const copy = async () => {
    if (!profile?.referral_code) return;
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <ScreenHeader title="Refer & Earn" subtitle="Grow together" back={false} />

      <div className="px-4">
        <Card className="relative overflow-hidden p-card bg-gradient-brand text-white border-0 text-center">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[color:var(--accent)]/30 blur-3xl" />
          <div className="relative">
            <div className="mx-auto h-14 w-14 rounded-lg bg-white/15 flex items-center justify-center">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="mt-4 text-screen-title">Earn ৳25<br />for every friend</p>
            <p className="mt-2 text-body-secondary text-white/75">Your friend gets ৳10 when they sign up with your code.</p>

            <div className="mt-5 rounded-lg bg-white/10 border border-white/20 p-3 flex items-center justify-between">
              <div className="text-left pl-2">
                <p className="text-caption text-white/70 uppercase tracking-widest">Your code</p>
                {codeLoading ? (
                  <div className="mt-1 h-5 w-28 rounded bg-white/20 animate-pulse" />
                ) : (
                  <p className="text-card-title tracking-wider">{code || "—"}</p>
                )}
              </div>
              <button
                onClick={copy}
                disabled={codeLoading || !code}
                className="text-label h-10 px-3 rounded-lg bg-white text-primary inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>


            <ActionButton variant="mint" className="!text-primary mt-4 w-full">
              <Share2 className="h-4 w-4" /> Share invite
            </ActionButton>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-4 flex gap-3">
        <StatPill icon={<Users className="h-3.5 w-3.5" />} label="Friends joined" value={String(referralsCount)} />
        <StatPill icon={<Sparkles className="h-3.5 w-3.5" />} label="Earned" value={`৳${(referralsCount * 25).toFixed(0)}`} tone="success" />
      </div>

      <h2 className="text-section-title px-4 pt-6 pb-3">How it works</h2>
      <div className="px-4 space-y-2">
        {[
          { n: 1, t: "Share your code", d: "Send it to friends via any app." },
          { n: 2, t: "Friend signs up", d: "They enter your code at registration." },
          { n: 3, t: "Both earn rewards", d: "You get ৳25, they get ৳10 instantly." },
        ].map((s) => (
          <Card key={s.n} className="p-card flex items-center gap-3">
            <div className="text-card-title h-10 w-10 rounded-full bg-gradient-mint flex items-center justify-center text-white shadow-glow">
              {s.n}
            </div>
            <div>
              <p className="text-label">{s.t}</p>
              <p className="text-body-secondary">{s.d}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
