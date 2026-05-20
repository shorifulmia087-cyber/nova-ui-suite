import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, Sprout,
  ClipboardList, Gift, ChevronRight, ChevronDown, Eye, EyeOff, TrendingUp, Sparkles,
  PlusCircle, ArrowUpRight, Plus, Minus, ArrowRight, MoreHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, SectionLabel } from "@/components/mobile/Primitives";
import { user, transactions, cards } from "@/lib/mock";

function useVerified() {
  const [v, setV] = useState(user.verified);
  useEffect(() => {
    const read = () => setV(localStorage.getItem("nessVerified") === "1" || user.verified);
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, []);
  return v;
}

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
    hidden ? "••••••" : `৳${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      {/* Top bar */}
      <div className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[color:var(--accent)] blur-md opacity-20 rounded-full" />
            <div className="relative h-14 w-14 rounded-full bg-[color:var(--accent)] text-accent-foreground flex items-center justify-center font-bold text-lg tracking-tight border-2 border-background shadow-card">
              {user.avatar}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground/60 leading-none mb-1">Good morning</span>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {user.name}
              </h1>
              {user.verified && <ShieldCheck className="h-5 w-5 text-[color:var(--accent)]" />}
            </div>
          </div>
        </div>
        <Link
          to="/notifications"
          className="relative h-12 w-12 rounded-2xl bg-card border border-border shadow-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Bell className="h-6 w-6 text-foreground" />
          <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-destructive border-2 border-background" />
        </Link>
      </div>



      {/* Quick actions — circular icon buttons */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[
          { to: "/deposit", icon: Plus, label: "Add money", primary: true },
          { to: "/withdraw", icon: Minus, label: "Withdraw" },
          { to: "/tasks", icon: ClipboardList, label: "Task" },
          { to: "/refer", icon: Gift, label: "Refer" },
        ].map(({ to, icon: I, label, primary }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2 group">
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                primary
                  ? "bg-foreground text-background shadow-navy"
                  : "bg-muted text-foreground"
              }`}
            >
              <I className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <span className="text-[12px] font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      {/* Verification — dark card with submit */}
      {/* Verification — dark card with submit */}
      {(

        <div className="px-5 mt-6">
          <div className="rounded-2xl bg-primary text-primary-foreground p-4 shadow-navy">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-warning/15 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-warning" strokeWidth={2.4} />
              </div>
              <p className="flex-1 text-[15px] font-semibold leading-snug pt-0.5">
                Verification required. Please verify your identity.
              </p>
            </div>
            <Link
              to="/verify"
              className="mt-4 flex items-center justify-center h-12 rounded-full bg-background text-foreground text-base font-bold active:scale-[0.98] transition-transform"
            >
              Submit
            </Link>
          </div>
        </div>
      )}

      {/* Promo banner carousel */}
      <PromoBanners />




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

import bannerFarm from "@/assets/banner-farm.jpg";
import bannerRefer from "@/assets/banner-refer.jpg";
import bannerTasks from "@/assets/banner-tasks.jpg";

const banners = [
  {
    id: "b1",
    eyebrow: "Limited offer",
    title: "Earn 18% APR on Farm Plots",
    cta: "Start farming",
    to: "/farm",
    image: bannerFarm,
    overlay: "linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.1) 100%)",
    accent: "#5EEAD4",
  },
  {
    id: "b2",
    eyebrow: "Bonus",
    title: "Refer a friend & get ৳2,500",
    cta: "Invite now",
    to: "/refer",
    image: bannerRefer,
    overlay: "linear-gradient(90deg, rgba(30,27,75,0.92) 0%, rgba(30,27,75,0.55) 55%, rgba(30,27,75,0.1) 100%)",
    accent: "#C7D2FE",
  },
  {
    id: "b3",
    eyebrow: "New tasks",
    title: "Complete tasks. Earn daily.",
    cta: "View tasks",
    to: "/tasks",
    image: bannerTasks,
    overlay: "linear-gradient(90deg, rgba(67,20,7,0.92) 0%, rgba(67,20,7,0.5) 55%, rgba(67,20,7,0.1) 100%)",
    accent: "#FED7AA",
  },
];

function PromoBanners() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <div className="mt-4">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth px-5 gap-3"
      >
        {banners.map((b) => (
          <Link
            key={b.id}
            to={b.to}
            className="snap-center shrink-0 w-full relative overflow-hidden rounded-md text-white shadow-navy h-[128px]"
          >
            <img
              src={b.image}
              alt=""
              loading="lazy"
              width={800}
              height={512}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: b.overlay }} />
            <div className="relative p-5 h-full flex flex-col justify-between">
              <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/15 backdrop-blur-sm">
                {b.eyebrow}
              </span>
              <div>
                <p className="text-base font-bold leading-tight tracking-tight max-w-[70%]">
                  {b.title}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: b.accent }}>
                  {b.cta}
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-[color:var(--accent)]" : "w-1.5 bg-border"}`}
          />
        ))}
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
    earn: Sparkles, deposit: ArrowDownToLine, withdraw: ArrowUpFromLine, task: ClipboardList, referral: Gift,
  };
  const Icon = Icons[tx.category];
  return (
    <Card className="p-3 flex items-center gap-3 border-0">
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
