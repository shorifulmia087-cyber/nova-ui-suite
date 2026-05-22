import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, Sprout,
  ClipboardList, Gift, ChevronRight, ChevronDown, Eye, EyeOff, TrendingUp, Sparkles,
  PlusCircle, ArrowUpRight, Plus, Minus, ArrowRight, MoreHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, SectionLabel } from "@/components/mobile/Primitives";
import { transactions, cards } from "@/lib/mock";
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
    <div>
      {/* Top bar */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between gap-3">
        <Link to="/profile" className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-muted shadow-card ring-2 ring-background">
              <img src={avatarUser} alt={displayName || "Profile"} width={48} height={48} className="h-full w-full object-cover" />
            </div>
            {verified && (
              <span className="absolute -bottom-0.5 -right-0.5 h-[16px] w-[16px] rounded-full bg-[color:var(--accent)] border-[2px] border-background flex items-center justify-center">
                <ShieldCheck className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3.5} />
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 gap-1">
            <span
              className="text-[10.5px] font-medium uppercase text-muted-foreground leading-none"
              style={{ letterSpacing: "0.04em" }}
            >
              Good morning
            </span>
            {showProfileSkeleton ? (
              <div className="h-[18px] w-32 rounded bg-muted animate-pulse" />
            ) : (
              <h1 className="text-[16px] font-semibold tracking-tight text-foreground leading-tight truncate">
                {displayName || "Welcome"}
              </h1>
            )}
          </div>
        </Link>
        {showProfileSkeleton ? (
          <div className="shrink-0 h-11 w-28 rounded-2xl bg-muted animate-pulse" />
        ) : (
          <BalancePill value={balance} hidden={hidden} />
        )}
      </header>



      {/* Info banner — intro video */}
      <IntroVideoBanner />


      {/* Quick actions — refined card */}
      <div className="px-4 mt-5">
        <div className="bg-card rounded-lg shadow-card border border-border/50 px-3 py-5 grid grid-cols-4 gap-y-5">
          {[
            { to: "/withdraw", icon: Minus, label: "Withdraw" },
            { to: "/tasks", icon: ClipboardList, label: "Task" },
            { to: "/refer", icon: Gift, label: "Refer" },
            { to: "/farm", icon: Sprout, label: "Farm" },
            { to: "/transactions", icon: TrendingUp, label: "History" },
            { to: "/verify", icon: ShieldCheck, label: "Verify" },
            { to: "/notifications", icon: Sparkles, label: "Rewards" },
          ].map(({ to, icon: I, label }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-1.5 group">
              <div className="h-[52px] w-[52px] rounded-lg flex items-center justify-center transition-all active:scale-95 bg-muted text-foreground group-active:bg-muted/80">
                <I className="h-[20px] w-[20px]" strokeWidth={1.8} />
              </div>
              <span className="text-foreground font-medium text-[12px] leading-none tracking-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Verification — dark card with submit */}
      {!verified && (

        <div className="px-5 mt-6">
          <div className="rounded-lg bg-primary text-primary-foreground p-4 shadow-navy">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-11 w-11 rounded-lg bg-warning/15 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-warning" strokeWidth={2.4} />
              </div>
              <p className="flex-1 text-label pt-0.5">
                Verification required. Please verify your identity.
              </p>
            </div>
            <Link
              to="/verify"
              className="text-button mt-4 flex items-center justify-center h-12 rounded-lg bg-background text-foreground active:scale-[0.98] transition-transform"
            >
              Submit
            </Link>
          </div>
        </div>
      )}





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

function BalancePill({ value, hidden }: { value: number; hidden: boolean }) {
  const [display, setDisplay] = useState(value);
  const [pulse, setPulse] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;
    setPulse(true);
    const duration = 600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setPulse(false), 200);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const text = hidden
    ? "••••••"
    : `৳${display.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      className={`shrink-0 inline-flex flex-col items-end justify-center h-12 px-4 rounded-lg bg-card border border-border/50 shadow-card transition-all duration-300 ${
        pulse ? "scale-105 ring-2 ring-[color:var(--accent)]/40" : "scale-100"
      }`}
    >
      <span className="text-[9px] font-medium uppercase text-muted-foreground/80 leading-none" style={{ letterSpacing: "0.05em" }}>
        Balance
      </span>
      <span className="mt-1.5 text-[16px] font-bold text-foreground tabular-nums leading-none tracking-tight">
        {text}
      </span>
    </div>
  );
}

const INTRO_VIDEO_ID = "OoSBR0Vm_uw";

function IntroVideoBanner() {
  const [open, setOpen] = useState(false);
  const videoId =
    (typeof window !== "undefined" && localStorage.getItem("nessIntroVideoId")) || INTRO_VIDEO_ID;
  const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

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
      <div className="px-4 mt-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full relative overflow-hidden rounded-lg shadow-card border border-border/50 active:scale-[0.99] transition-transform"
          style={{ aspectRatio: "16 / 10" }}
        >
          <img src={thumb} alt="ওয়েবসাইটের পরিচিতি ভিডিও" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.45) 55%, rgba(15,23,42,0.88) 100%)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-11 w-11 rounded-full bg-white/95 flex items-center justify-center shadow-card">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] ml-[2px] text-[color:var(--primary)] fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute left-0 right-0 bottom-0 p-4 text-left text-white">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/15 backdrop-blur-sm" style={{ letterSpacing: "0.08em" }}>
              পরিচিতি ভিডিও
            </span>
            <p className="text-[14px] font-semibold text-white leading-snug mt-2 tracking-tight">
              এই ওয়েবসাইটে কিভাবে কাজ করবেন
            </p>
            <p className="text-[11px] text-white/80 mt-0.5 font-medium">
              বিস্তারিত গাইড — ভিডিও দেখতে ট্যাপ করুন
            </p>
          </div>
        </button>
      </div>

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
    <div className="px-5">
      <div className="bg-card rounded-2xl shadow-card border border-border/60 overflow-hidden">
        {items.map((t, i) => (
          <div key={t.id}>
            {i > 0 && <div className="ml-[68px] mr-4 h-px bg-border/70" />}
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
    deposit: "text-[color:var(--accent)] bg-[color:var(--accent)]/10",
    withdraw: "text-foreground bg-muted",
    task: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    referral: "text-[color:var(--accent)] bg-[color:var(--accent)]/10",
  };
  const Icons: Record<Tx["category"], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    earn: Sparkles, deposit: ArrowDownToLine, withdraw: ArrowUpFromLine, task: ClipboardList, referral: Gift,
  };
  const Icon = Icons[tx.category];
  const positive = tx.amount >= 0;

  return (
    <div className="px-4 py-4 flex items-center gap-3">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${iconTone[tx.category]}`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-foreground truncate leading-tight">{tx.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-1 font-medium">{tx.date}</p>
      </div>
      <p className={`text-[15px] font-bold tabular-nums shrink-0 tracking-tight ${positive ? "text-[color:var(--success)]" : "text-foreground"}`}>
        {positive ? "+" : "−"}৳{Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

