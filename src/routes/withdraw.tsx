import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { Building2, Bitcoin, Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — Ness" }] }),
  component: Withdraw,
});

function Withdraw() {
  const { profile } = useProfile();
  const balance = Number(profile?.main_balance ?? 0);
  const [amt, setAmt] = useState(100);
  const fee = +(amt * 0.005).toFixed(2);
  const receive = (amt - fee).toFixed(2);

  return (
    <div>
      <ScreenHeader />

      <div className="px-4">
        <Card className="p-card text-center bg-gradient-soft">
          <p className="text-caption uppercase tracking-widest">You withdraw</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-stat text-muted-foreground">৳</span>
            <input
              type="number"
              value={amt}
              onChange={(e) => setAmt(Number(e.target.value || 0))}
              className="text-display w-40 text-center bg-transparent outline-none"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-caption">
            <span>Fee 0.5%</span><span>-৳{fee}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-label">
            <span>You receive</span><span className="text-[color:var(--success)]">৳{receive}</span>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-4 flex gap-2">
        {[25, 50, 100].map((p) => (
          <button
            key={p}
            onClick={() => setAmt(Math.round((balance * p) / 100))}
            className="text-label flex-1 h-10 rounded-lg bg-muted hover:bg-muted/70"
          >
            {p}%
          </button>
        ))}
      </div>

      <h2 className="text-section-title px-4 pt-6 pb-3">Withdraw to</h2>
      <div className="px-4 space-y-2">
        {[
          { Icon: Building2, t: "Bank ••4421", d: "Dhaka Bank · BDT", active: true },
          { Icon: Bitcoin, t: "bKash Wallet", d: "Mobile wallet" },
          { Icon: Wallet, t: "Add new method" },
        ].map((m, i) => (
          <Card key={i} className={`p-4 flex items-center gap-3 ৳{m.active ? "border-[color:var(--accent)]" : ""}`}>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ৳{m.active ? "bg-gradient-mint text-white shadow-glow" : "bg-muted"}`}>
              <m.Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-label">{m.t}</p>
              {m.d && <p className="text-caption">{m.d}</p>}
            </div>
          </Card>
        ))}
      </div>

      <div className="px-4 mt-5">
        <div className="rounded-lg bg-[color:var(--warning)]/10 border border-[color:var(--warning)]/30 p-3 flex items-start gap-2 text-caption text-[color:var(--warning)]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Withdrawals typically process within 1-2 business days.</p>
        </div>
      </div>

      <div className="px-4 mt-5">
        <ActionButton variant="brand" size="lg" className="w-full">
          Confirm withdrawal
        </ActionButton>
      </div>
    </div>
  );
}
