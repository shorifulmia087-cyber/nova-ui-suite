import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton, StatPill } from "@/components/mobile/Primitives";
import { farmPlots } from "@/lib/mock";
import { Sprout, TrendingUp, Wallet, Sparkles } from "lucide-react";

export const Route = createFileRoute("/farm")({
  head: () => ({ meta: [{ title: "My Farm — Ness" }, { name: "description", content: "Grow your assets across yield plots." }] }),
  component: Farm,
});

function Farm() {
  const totalStaked = farmPlots.reduce((s, p) => s + p.staked, 0);
  const dailyYield = farmPlots.reduce((s, p) => s + p.yieldDay, 0);

  return (
    <div>
      <ScreenHeader title="My Farm" subtitle="Yield-bearing plots" back={false} />

      <div className="px-5">
        <Card className="relative overflow-hidden p-5 bg-gradient-card text-white border-0">
          <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-[color:var(--accent)]/30 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Total staked</p>
              <p className="mt-1 text-3xl font-extrabold">${totalStaked.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-md bg-white/15 flex items-center justify-center">
              <Sprout className="h-6 w-6" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center justify-between text-sm">
            <div className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[color:var(--success)]" />
              <span className="font-bold">+${dailyYield.toFixed(2)}</span>
              <span className="text-white/70">/ day</span>
            </div>
            <ActionButton variant="mint" size="sm" className="!text-primary">Harvest all</ActionButton>
          </div>
        </Card>
      </div>

      <div className="px-5 mt-4 flex gap-3">
        <StatPill icon={<Wallet className="h-3.5 w-3.5" />} label="Plots" value={String(farmPlots.length)} />
        <StatPill icon={<Sparkles className="h-3.5 w-3.5" />} label="Avg APR" value={`${(farmPlots.reduce((s,p)=>s+p.apr,0)/farmPlots.length).toFixed(1)}%`} tone="success" />
      </div>

      <h3 className="px-5 pt-6 pb-3 text-sm font-bold">Your plots</h3>
      <div className="px-5 space-y-2">
        {farmPlots.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-md bg-gradient-mint flex items-center justify-center text-white shadow-glow">
                <Sprout className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{p.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === "Ready" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-muted text-muted-foreground"}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">${p.staked.toLocaleString()} staked · APR {p.apr}%</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Daily yield</p>
                <p className="text-sm font-bold text-[color:var(--success)]">+${p.yieldDay.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <ActionButton size="sm" variant="outline">Add</ActionButton>
                <ActionButton size="sm" variant={p.status === "Ready" ? "brand" : "ghost"}>
                  {p.status === "Ready" ? "Harvest" : "Manage"}
                </ActionButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
