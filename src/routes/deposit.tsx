import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { CreditCard, Building2, Bitcoin, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/deposit")({
  head: () => ({ meta: [{ title: "Add money — Ness" }] }),
  component: Deposit,
});

const presets = [50, 100, 250, 500, 1000, 2500];

function Deposit() {
  const [amt, setAmt] = useState(250);
  const [method, setMethod] = useState("card");

  return (
    <div>
      <ScreenHeader title="Add money" subtitle="Top up your balance" />

      <div className="px-5">
        <Card className="p-card text-center bg-gradient-soft">
          <p className="text-caption uppercase tracking-widest">Amount</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-stat text-muted-foreground">৳</span>
            <input
              type="number"
              value={amt}
              onChange={(e) => setAmt(Number(e.target.value || 0))}
              className="text-display w-40 text-center bg-transparent outline-none"
            />
          </div>
          <p className="text-caption mt-1">No fees · instant</p>
        </Card>
      </div>

      <div className="px-5 mt-4 grid grid-cols-3 gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setAmt(p)}
            className={`text-label h-11 rounded-lg transition border ৳{amt === p ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow" : "bg-card border-border text-foreground hover:bg-muted"}`}
          >
            ৳{p}
          </button>
        ))}
      </div>

      <h2 className="text-section-title px-5 pt-6 pb-3">Payment method</h2>
      <div className="px-5 space-y-2">
        {[
          { id: "card", Icon: CreditCard, t: "Visa ••8821", d: "Instant · no fee" },
          { id: "bank", Icon: Building2, t: "Bank transfer", d: "1-2 business days" },
          { id: "crypto", Icon: Bitcoin, t: "bKash / Nagad", d: "Mobile wallet" },
        ].map((m) => {
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`w-full text-left rounded-lg border p-4 flex items-center gap-3 transition ৳{active ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5 shadow-card" : "border-border bg-card"}`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ৳{active ? "bg-gradient-mint text-white shadow-glow" : "bg-muted text-foreground"}`}>
                <m.Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-label">{m.t}</p>
                <p className="text-caption">{m.d}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-6">
        <ActionButton variant="brand" size="lg" className="w-full">
          Add ৳{amt.toLocaleString()}
        </ActionButton>
      </div>
    </div>
  );
}
