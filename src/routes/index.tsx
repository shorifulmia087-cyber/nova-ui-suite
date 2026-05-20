import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, Sprout,
  ClipboardList, Gift, ChevronRight, ChevronDown, Eye, EyeOff, TrendingUp, Sparkles,
  PlusCircle, ArrowUpRight, Plus, Minus, ArrowRight, MoreHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, SectionLabel } from "@/components/mobile/Primitives";
import { user, transactions, cards } from "@/lib/mock";
import avatarUser from "@/assets/avatar-user.jpg";

function useVerified() {
  const [v, setV] = useState(user.verified);
  useEffect(() => {
    const read = () => setV(localStorage.getItem("nessVerified") === "1" || user.verified);
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    window.addEventListener("ness:verified", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
      window.removeEventListener("ness:verified", read);
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
  const verified = useVerified();
  const fmt = (n: number) =>
    hidden ? "••••••" : `৳${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      {/* Top bar */}
      <header className="px-5 pt-5 pb-1 flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-full overflow-hidden bg-muted shadow-card ring-2 ring-background">
              <img src={avatarUser} alt={user.name} width={44} height={44} className="h-full w-full object-cover" />
            </div>
            {verified && (
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[color:var(--accent)] border-2 border-background flex items-center justify-center">
                <ShieldCheck className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-eyebrow leading-none">
              Good morning
            </span>
            <h1 className="mt-1.5 text-card-title text-foreground leading-none truncate">
              {user.name}
            </h1>
          </div>
        </Link>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative h-11 w-11 rounded-full bg-card border border-border shadow-card flex items-center justify-center hover:bg-muted transition-colors active:scale-95 shrink-0"
        >
          <Bell className="h-[18px] w-[18px] text-foreground" strokeWidth={2.2} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Link>
      </header>


      {/* Quick actions — circular icon buttons */}
      <div className="px-4 mt-5">
        <div className="bg-card rounded-sm shadow-card px-0 py-5 grid grid-cols-4 gap-y-5">
          {[
            { to: "/deposit", icon: Plus, label: "Add money", primary: true },
            { to: "/withdraw", icon: Minus, label: "Withdraw" },
            { to: "/tasks", icon: ClipboardList, label: "Task" },
            { to: "/refer", icon: Gift, label: "Refer" },
            { to: "/farm", icon: Sprout, label: "Farm" },
            { to: "/transactions", icon: TrendingUp, label: "History" },
            { to: "/verify", icon: ShieldCheck, label: "Verify" },
            { to: "/notifications", icon: Sparkles, label: "Rewards" },
          ].map(({ to, icon: I, label, primary }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-2 group">
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                  primary
                    ? "bg-foreground text-background shadow-navy"
                    : "bg-muted text-foreground"
                }`}
              >
                <I className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <span className="text-tab text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Verification — dark card with submit */}
      {!verified && (

        <div className="px-5 mt-6">
          <div className="rounded-2xl bg-primary text-primary-foreground p-4 shadow-navy">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-warning/15 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-warning" strokeWidth={2.4} />
              </div>
              <p className="flex-1 text-label pt-0.5">
                Verification required. Please verify your identity.
              </p>
            </div>
            <Link
              to="/verify"
              className="text-button mt-4 flex items-center justify-center h-12 rounded-full bg-background text-foreground active:scale-[0.98] transition-transform"
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
        action={
          <Link to="/transactions" className="text-label inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
            View all
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </Link>
        }
      >
        Recent activity
      </SectionLabel>
      <RecentActivity />
    </div>
  );
}

function RecentActivity() {
  const items = transactions.slice(0, 5);
  return (
    <div className="px-5">
      <div className="bg-card rounded-3xl overflow-hidden">
        {items.map((t, i) => (
          <div key={t.id}>
            {i > 0 && <div className="mx-4 h-px bg-border" />}
            <TxRow tx={t} />
          </div>
        ))}
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
              <span className="text-caption text-white self-start inline-flex items-center px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/15 backdrop-blur-sm">
                {b.eyebrow}
              </span>
              <div>
                <p className="text-card-title text-white max-w-[70%]">
                  {b.title}
                </p>
                <div className="text-label mt-2 inline-flex items-center gap-1.5" style={{ color: b.accent }}>
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
  const iconTone: Record<Tx["category"], string> = {
    earn: "text-[color:var(--accent)] bg-[color:var(--accent)]/10",
    deposit: "text-[color:var(--accent)] bg-[color:var(--accent)]/10",
    withdraw: "text-foreground bg-foreground/5",
    task: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    referral: "text-[color:var(--accent)] bg-[color:var(--accent)]/10",
  };
  const Icons: Record<Tx["category"], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    earn: Sparkles, deposit: ArrowDownToLine, withdraw: ArrowUpFromLine, task: ClipboardList, referral: Gift,
  };
  const subtitle: Record<Tx["category"], string> = {
    earn: "Yield", deposit: "Deposit", withdraw: "Withdrawal", task: "Task reward", referral: "Referral",
  };
  const Icon = Icons[tx.category];
  const time = tx.date.includes(" · ") ? tx.date.split(" · ")[1] : tx.date;
  const positive = tx.amount >= 0;

  return (
    <div className="px-4 py-4 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${iconTone[tx.category]}`}>
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-label text-foreground truncate">{tx.title}</h3>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-body-secondary">
            {subtitle[tx.category]} • {time}
          </p>
          {tx.status !== "completed" && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-caption font-bold uppercase tracking-wider ${
                tx.status === "pending"
                  ? "bg-[color:var(--warning)]/10 text-[color:var(--warning)]"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {tx.status}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-button tabular-nums ${positive ? "text-[color:var(--success)]" : "text-foreground"}`}>
          {positive ? "+" : "−"}৳{Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

