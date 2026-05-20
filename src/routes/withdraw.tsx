import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { Building2, Bitcoin, Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";
import { user } from "@/lib/mock";

export const Route = createFileRoute("/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — Ness" }] }),
  component: Withdraw,
});

function Withdraw() {
  const [amt, setAmt] = useState(100);
  const fee = +(amt * 0.005).toFixed(2);
  const receive = (amt - fee).toFixed(2);

  return (
    <div>
      <ScreenHeader title="Withdraw" subtitle={`Available · $${user.balance.toLocaleString()}`} />

      <div className="px-5">
        <Card className="p-6 text-center bg-gradient-soft">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">You withdraw</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-3xl font-bold text-muted-foreground">$</span>
            <input
              type="number"
              value={amt}
              onChange={(e) => setAmt(Number(e.target.value || 0))}
              className="w-40 text-5xl font-extrabold text-center bg-transparent outline-none"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Fee 0.5%</span><span>-${fee}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm font-bold">
            <span>You receive</span><span className="text-[color:var(--success)]">${receive}</span>
          </div>
        </Card>
      </div>

      <div className="px-5 mt-4 flex gap-2">
        {[25, 50, 100].map((p) => (
          <button
            key={p}
            onClick={() => setAmt(Math.round((user.balance * p) / 100))}
            className="flex-1 h-10 rounded-md bg-muted text-sm font-bold hover:bg-muted/70"
          >
            {p}%
          </button>
        ))}
      </div>

      <h2 className="px-5 pt-6 pb-3 text-sm font-bold tracking-tight">Withdraw to</h2>
      <div className="px-5 space-y-2">
        {[
          { Icon: Building2, t: "Bank ••4421", d: "Wells Fargo · USD", active: true },
          { Icon: Bitcoin, t: "USDT Wallet", d: "TRC-20 network" },
          { Icon: Wallet, t: "Add new method" },
        ].map((m, i) => (
          <Card key={i} className={`p-4 flex items-center gap-3 ${m.active ? "border-[color:var(--accent)]" : ""}`}>
            <div className={`h-10 w-10 rounded-md flex items-center justify-center ${m.active ? "bg-gradient-mint text-white shadow-glow" : "bg-muted"}`}>
              <m.Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{m.t}</p>
              {m.d && <p className="text-xs text-muted-foreground">{m.d}</p>}
            </div>
          </Card>
        ))}
      </div>

      <div className="px-5 mt-5">
        <div className="rounded-md bg-[color:var(--warning)]/10 border border-[color:var(--warning)]/30 p-3 flex items-start gap-2 text-xs text-[color:var(--warning)]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Withdrawals typically process within 1-2 business days.</p>
        </div>
      </div>

      <div className="px-5 mt-5">
        <ActionButton variant="brand" size="lg" className="w-full">
          Confirm withdrawal
        </ActionButton>
      </div>
    </div>
  );
}
