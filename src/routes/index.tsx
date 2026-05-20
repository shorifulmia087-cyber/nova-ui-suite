import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, Sprout,
  ClipboardList, Gift, ChevronRight, Eye, EyeOff, TrendingUp, Sparkles,
  PlusCircle, ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import { Card, SectionLabel } from "@/components/mobile/Primitives";
import { user, transactions, cards } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Ness" },
      { name: "description", content: "Your earning dashboard, cards, and recent activity at a glance." },
      { property: "og:title", content: "Home — Ness" },
    ],
  }),
  component: Home,
});

function Home() {
  const [hidden, setHidden] = useState(false);
  const fmt = (n: number) =>
    hidden ? "••••••" : n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div>
      {/* Top bar */}
      <div className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold shadow-glow">
            {user.avatar}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Good morning</p>
            <p className="text-sm font-bold flex items-center gap-1">
              {user.name}
              {user.verified && <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--accent)]" />}
            </p>
          </div>
        </div>
        <Link
          to="/notifications"
          className="relative h-10 w-10 rounded-full bg-card border border-border shadow-card flex items-center justify-center"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
        </Link>
      </div>

      {/* Balance hero — gradient */}
      <div className="px-5 mt-5 animate-slide-up">
        <Card className="relative overflow-hidden p-5 bg-gradient-card text-white border-0 shadow-navy">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-20 bottom-0 h-32 w-32 rounded-full bg-[color:var(--accent)]/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-widest text-white/70">Total balance</p>
              <button
                onClick={() => setHidden((v) => !v)}
                className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="Toggle balance"
              >
                {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-4xl font-extrabold tracking-tight">{fmt(user.balance)}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-[color:var(--success)]" />
              <span className="font-semibold">+{fmt(user.earnings)}</span>
              <span className="text-white/70">this month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions — separate sections */}
      <div className="px-5 mt-4 grid grid-cols-4 gap-3 animate-slide-up">
        {[
          { to: "/tasks", icon: ListChecks, label: "Tasks", tone: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" },
          { to: "/deposit", icon: ArrowDownToLine, label: "Add", tone: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]" },
          { to: "/withdraw", icon: ArrowUpFromLine, label: "Withdraw", tone: "bg-destructive/12 text-destructive" },
          { to: "/farm", icon: Sprout, label: "Farm", tone: "bg-[color:var(--success)]/15 text-[color:var(--success)]" },
        ].map(({ to, icon: I, label, tone }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-md bg-card border border-border shadow-card p-3 hover:bg-muted/40 transition active:scale-[0.97]"
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tone}`}>
              <I className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Verify banner */}
      {!user.verified ? null : (
        <Link to="/verify" className="block px-5 mt-4">
          <Card className="p-4 flex items-center gap-3 bg-gradient-soft">
            <div className="h-10 w-10 rounded-md bg-gradient-mint flex items-center justify-center text-white shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Boost your limits</p>
              <p className="text-xs text-muted-foreground">Verify your account to unlock $10k/day withdrawals.</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        </Link>
      )}

      {/* My Cards */}
      <SectionLabel
        action={<Link to="/transactions" className="text-xs font-semibold text-[color:var(--accent)]">See all</Link>}
      >
        My cards
      </SectionLabel>
      <div className="px-5 flex gap-3 overflow-x-auto no-scrollbar -mx-1 pb-1">
        {cards.map((c) => (
          <div
            key={c.id}
            className={`relative shrink-0 w-[230px] h-[140px] rounded-md p-4 text-white overflow-hidden shadow-navy ${c.gradient}`}
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-xl" />
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">{c.label}</span>
              <span className="font-bold tracking-wide">NESS</span>
            </div>
            <p className="mt-6 text-xs text-white/70">Balance</p>
            <p className="text-xl font-extrabold">${c.balance.toLocaleString()}</p>
            <p className="mt-1 text-xs tracking-widest text-white/80">{c.number}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <SectionLabel
        action={<Link to="/transactions" className="text-xs font-semibold text-[color:var(--accent)]">View all</Link>}
      >
        Recent activity
      </SectionLabel>
      <div className="px-5 space-y-2">
        {transactions.slice(0, 4).map((t) => (
          <TxRow key={t.id} tx={t} />
        ))}
      </div>

      {/* Refer */}
      <div className="px-5 mt-6">
        <Link to="/refer">
          <Card className="p-4 flex items-center gap-3 bg-gradient-brand text-white border-0 shadow-glow">
            <div className="h-11 w-11 rounded-md bg-white/15 flex items-center justify-center">
              <Gift className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Earn $25 per friend</p>
              <p className="text-xs text-white/75">Share your code and grow together.</p>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Card>
        </Link>
      </div>
    </div>
  );
}

import type { Tx } from "@/lib/mock";
function TxRow({ tx }: { tx: Tx }) {
  const colors: Record<Tx["category"], string> = {
    earn: "bg-[color:var(--success)]/12 text-[color:var(--success)]",
    deposit: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
    withdraw: "bg-destructive/12 text-destructive",
    task: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    referral: "bg-primary/10 text-primary",
  };
  const Icons: Record<Tx["category"], React.ComponentType<{ className?: string }>> = {
    earn: Sparkles, deposit: ArrowDownToLine, withdraw: ArrowUpFromLine, task: ListChecks, referral: Gift,
  };
  const Icon = Icons[tx.category];
  return (
    <Card className="p-3 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md flex items-center justify-center ${colors[tx.category]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{tx.title}</p>
        <p className="text-[11px] text-muted-foreground">{tx.date} · {tx.status}</p>
      </div>
      <p className={`text-sm font-bold ${tx.amount >= 0 ? "text-[color:var(--success)]" : "text-destructive"}`}>
        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
      </p>
    </Card>
  );
}
