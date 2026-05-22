import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, ShieldCheck, ArrowDownToLine, ArrowUpFromLine,
  ClipboardList, Gift, ChevronRight, Eye, EyeOff, TrendingUp, Sparkles,
  Plus, Minus, AlertTriangle, Lock,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/mobile/Primitives";
import { transactions } from "@/lib/mock";
import { useProfile } from "@/lib/use-profile";
import avatarUser from "@/assets/avatar-user.jpg";

function useVerified(serverVerified: boolean) {
  const [v, setV] = useState(serverVerified);
  useEffect(() => {
    const read = () => setV(localStorage.getItem("nessVerified") === "1" || serverVerified);
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    window.addEventListener("ness:verified", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
      window.removeEventListener("ness:verified", read);
    };
  }, [serverVerified]);
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
  const { profile, loading: profileLoading } = useProfile();
  const verified = useVerified(!!profile?.is_verified);
  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "";
  const balance = Number(profile?.main_balance ?? 0);
  const showProfileSkeleton = profileLoading && !profile;

  return (
    <div className="pb-4">
      {/* Top bar — avatar + greeting + notification bell */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between gap-3">
        <Link to="/profile" className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-full overflow-hidden bg-muted ring-2 ring-background shadow-card">
              <img src={avatarUser} alt={displayName || "Profile"} width={44} height={44} className="h-full w-full object-cover" />
            </div>
            {verified && (
              <span className="absolute -bottom-0.5 -right-0.5 h-[16px] w-[16px] rounded-full bg-[color:var(--accent)] border-2 border-background flex items-center justify-center">
                <ShieldCheck className="h-2 w-2 text-accent-foreground" strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground leading-none" style={{ letterSpacing: "0.08em" }}>
              Good morning
            </span>
            {showProfileSkeleton ? (
              <div className="h-[18px] w-32 rounded bg-muted animate-pulse" />
            ) : (
              <h1 className="text-[15px] font-bold tracking-tight text-foreground leading-tight truncate">
                {displayName || "there"}
              </h1>
            )}
          </div>
        </Link>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative shrink-0 h-11 w-11 rounded-full bg-card border border-border/70 shadow-card flex items-center justify-center text-foreground active:scale-95 transition-transform"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Link>
      </header>

      {/* BALANCE HERO — the centerpiece */}
      <section className="px-4">
        <div className="relative overflow-hidden rounded-lg bg-gradient-card text-primary-foreground p-5 shadow-navy">
          {/* decorative orb */}
          <div
            aria-hidden
            className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase opacity-70 leading-none" style={{ letterSpacing: "0.12em" }}>
                Available balance
              </span>
              <button
                type="button"
                onClick={() => setHidden((h) => !h)}
                aria-label={hidden ? "Show balance" : "Hide balance"}
                className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
              >
                {hidden ? <EyeOff className="h-3 w-3" strokeWidth={2.4} /> : <Eye className="h-3 w-3" strokeWidth={2.4} />}
              </button>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase opacity-80" style={{ letterSpacing: "0.1em" }}>
              <Lock className="h-3 w-3" strokeWidth={2.5} />
              Secured
            </span>
          </div>

          <div className="relative mt-3">
            {showProfileSkeleton ? (
              <div className="h-10 w-48 rounded bg-white/10 animate-pulse" />
            ) : (
              <AnimatedBalance value={balance} hidden={hidden} />
            )}
          </div>

          {/* Primary actions inside the hero card */}
          <div className="relative mt-5 grid grid-cols-2 gap-2.5">
            <Link
              to="/deposit"
              className="text-button h-12 rounded-lg bg-white text-[color:var(--primary)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-card"
            >
              <Plus className="h-[18px] w-[18px]" strokeWidth={2.6} />
              Deposit
            </Link>
            <Link
              to="/withdraw"
              className="text-button h-12 rounded-lg bg-white/10 text-primary-foreground border border-white/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform backdrop-blur-sm"
            >
              <ArrowUpFromLine className="h-[18px] w-[18px]" strokeWidth={2.4} />
              Withdraw
            </Link>
          </div>
        </div>
      </section>

      {/* Verification — slim inline alert (only when needed) */}
      {!verified && (
        <div className="px-4 mt-3">
          <Link
            to="/verify"
            className="flex items-center gap-3 rounded-lg bg-[color:var(--warning)]/10 border border-[color:var(--warning)]/30 px-3.5 py-3 active:scale-[0.99] transition-transform"
          >
            <span className="h-8 w-8 rounded-lg bg-[color:var(--warning)]/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-[color:var(--warning)]" strokeWidth={2.4} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-tight">Verify your identity</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Required to withdraw earnings</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2.4} />
          </Link>
        </div>
      )}

      {/* Quick actions — brand-colored icons */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-lg shadow-card border border-border/60 px-2 py-4 grid grid-cols-4 gap-y-4">
          {[
            { to: "/withdraw", icon: Minus, label: "Withdraw" },
            { to: "/refer", icon: Gift, label: "Refer" },
            { to: "/tasks", icon: ClipboardList, label: "Task" },
            { to: "/transactions", icon: TrendingUp, label: "History" },
          ].map(({ to, icon: I, label }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-2 group">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center transition-all active:scale-95 bg-[color:var(--accent)]/10 text-[color:var(--accent)] ring-1 ring-[color:var(--accent)]/20">
                <I className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <span className="text-foreground font-medium text-[12px] leading-none">{label}</span>
            </Link>
          ))}
        </div>
      </div>

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

      {/* Intro video — demoted to a slim row below the fold */}
      <div className="px-4 mt-5">
        <IntroVideoStrip />
      </div>

      {/* Trust footer */}
      <div className="px-5 mt-5 flex items-center justify-center gap-2 text-muted-foreground">
        <Lock className="h-3 w-3" strokeWidth={2.4} />
        <span className="text-[11px] font-medium">Bank-grade encryption · Secure transactions</span>
      </div>
    </div>
  );
}

function AnimatedBalance({ value, hidden }: { value: number; hidden: boolean }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;
    const duration = 600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  if (hidden) {
    return <div className="text-[34px] font-bold leading-none tracking-tight tabular-nums">৳ ••••••</div>;
  }
  const [intPart, decPart] = display
    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(".");
  return (
    <div className="flex items-baseline gap-1 leading-none tracking-tight tabular-nums">
      <span className="text-[20px] font-semibold opacity-80">৳</span>
      <span className="text-[36px] font-bold">{intPart}</span>
      <span className="text-[20px] font-semibold opacity-70">.{decPart}</span>
    </div>
  );
}

const INTRO_VIDEO_ID = "OoSBR0Vm_uw";

function IntroVideoStrip() {
  const [open, setOpen] = useState(false);
  const videoId =
    (typeof window !== "undefined" && localStorage.getItem("nessIntroVideoId")) || INTRO_VIDEO_ID;
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-lg bg-card border border-border/60 shadow-card p-2.5 pr-4 active:scale-[0.99] transition-transform text-left"
      >
        <div className="relative h-14 w-20 rounded-lg overflow-hidden shrink-0 bg-muted">
          <img src={thumb} alt="পরিচিতি ভিডিও" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5 text-white fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
            কিভাবে কাজ করবেন
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-1 truncate">
            পরিচিতি ভিডিও — ট্যাপ করুন
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2.4} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden shadow-navy"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 z-10 h-9 w-9 rounded-full bg-white text-foreground flex items-center justify-center shadow-card"
              aria-label="বন্ধ করুন"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="পরিচিতি ভিডিও"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}

function RecentActivity() {
  const items = transactions.slice(0, 5);
  return (
    <div className="px-4">
      <div className="bg-card rounded-lg shadow-card border border-border/60 overflow-hidden">
        {items.map((t, i) => (
          <div key={t.id}>
            {i > 0 && <div className="ml-[60px] mr-4 h-px bg-border/70" />}
            <TxRow tx={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Tx } from "@/lib/mock";
function TxRow({ tx }: { tx: Tx }) {
  const iconTone: Record<Tx["category"], string> = {
    earn: "text-[color:var(--accent)] bg-[color:var(--accent)]/10",
    deposit: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    withdraw: "text-destructive bg-destructive/10",
    task: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    referral: "text-[color:var(--accent)] bg-[color:var(--accent)]/10",
  };
  const Icons: Record<Tx["category"], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    earn: Sparkles, deposit: ArrowDownToLine, withdraw: ArrowUpFromLine, task: ClipboardList, referral: Gift,
  };
  const Icon = Icons[tx.category];
  const positive = tx.amount >= 0;

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${iconTone[tx.category]}`}>
        <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-foreground truncate leading-tight">{tx.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{tx.date}</p>
      </div>
      <p className={`text-[14px] font-bold tabular-nums shrink-0 tracking-tight ${positive ? "text-[color:var(--success)]" : "text-destructive"}`}>
        {positive ? "+" : "−"}৳{Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
