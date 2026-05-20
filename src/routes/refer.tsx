import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton, StatPill } from "@/components/mobile/Primitives";
import { Copy, Share2, Users, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { user } from "@/lib/mock";

export const Route = createFileRoute("/refer")({
  head: () => ({ meta: [{ title: "Refer & Earn — Ness" }, { name: "description", content: "Invite friends and earn $25 each." }] }),
  component: Refer,
});

function Refer() {
  const [copied, setCopied] = useState(false);
  const code = "ALEX-25";
  const copy = async () => {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <ScreenHeader title="Refer & Earn" subtitle="Grow together" back={false} />

      <div className="px-5">
        <Card className="relative overflow-hidden p-6 bg-gradient-brand text-white border-0 text-center">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[color:var(--accent)]/30 blur-3xl" />
          <div className="relative">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="mt-4 text-2xl font-extrabold leading-tight">Earn $25<br />for every friend</p>
            <p className="mt-2 text-xs text-white/75">Your friend gets $10 when they sign up with your code.</p>

            <div className="mt-5 rounded-2xl bg-white/10 border border-white/20 p-3 flex items-center justify-between">
              <div className="text-left pl-2">
                <p className="text-[10px] uppercase tracking-widest text-white/70">Your code</p>
                <p className="font-extrabold text-lg tracking-wider">{code}</p>
              </div>
              <button
                onClick={copy}
                className="h-10 px-3 rounded-xl bg-white text-primary font-semibold text-xs inline-flex items-center gap-1.5"
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

      <div className="px-5 mt-4 flex gap-3">
        <StatPill icon={<Users className="h-3.5 w-3.5" />} label="Friends joined" value={String(user.referrals)} />
        <StatPill icon={<Sparkles className="h-3.5 w-3.5" />} label="Earned" value={`$${(user.referrals * 25).toFixed(0)}`} tone="success" />
      </div>

      <h3 className="px-5 pt-6 pb-3 text-sm font-bold">How it works</h3>
      <div className="px-5 space-y-2">
        {[
          { n: 1, t: "Share your code", d: "Send it to friends via any app." },
          { n: 2, t: "Friend signs up", d: "They enter your code at registration." },
          { n: 3, t: "Both earn rewards", d: "You get $25, they get $10 instantly." },
        ].map((s) => (
          <Card key={s.n} className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-mint flex items-center justify-center text-white font-bold shadow-glow">
              {s.n}
            </div>
            <div>
              <p className="text-sm font-bold">{s.t}</p>
              <p className="text-xs text-muted-foreground">{s.d}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
