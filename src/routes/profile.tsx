import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card } from "@/components/mobile/Primitives";
import {
  ShieldCheck, ChevronRight, CreditCard, Lock, Bell,
  HelpCircle, FileText, LogOut, Moon, Globe, Wallet,
} from "lucide-react";
import { user } from "@/lib/mock";
import avatarUser from "@/assets/avatar-user.jpg";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Ness" }, { name: "description", content: "Manage your account, security, and preferences." }] }),
  component: Profile,
});

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

function Profile() {
  const verified = useVerified();
  return (
    <div>
      <ScreenHeader title="Profile" back={false} />

      <div className="px-5">
        <Card className="p-5 bg-gradient-soft border-0">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shadow-glow">
              <img src={avatarUser} alt={user.name} width={64} height={64} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold flex items-center gap-1.5">
                {user.name}
                {verified && <ShieldCheck className="h-4 w-4 text-[color:var(--accent)]" />}
              </p>
              <p className="text-xs text-muted-foreground">{user.handle}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--warning)]/15 text-[color:var(--warning)]">
                {user.level}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Section title="Account">
        <Row to="/verify" icon={ShieldCheck} label="Verify identity" hint={verified ? "Verified" : "Required"} tone={verified ? "success" : "default"} />
        <Row to="/deposit" icon={Wallet} label="Payment methods" hint="3 cards" />
        <Row to="/transactions" icon={FileText} label="Transaction history" />
      </Section>

      <Section title="Preferences">
        <Row to="/notifications" icon={Bell} label="Notifications" hint="On" />
        <Row icon={Moon} label="Appearance" hint="System" />
        <Row icon={Globe} label="Language" hint="English" />
      </Section>

      <Section title="Security">
        <Row icon={Lock} label="Change passcode" />
        <Row icon={CreditCard} label="Connected cards" />
      </Section>

      <Section title="Support">
        <Row icon={HelpCircle} label="Help center" />
        <Row icon={FileText} label="Terms & privacy" />
      </Section>

      <div className="px-5 mt-4 mb-2">
        <button className="w-full h-12 rounded-md bg-destructive/10 text-destructive font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground pb-2">Ness · v1.0.0</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="text-eyebrow px-5 pb-2">{title}</h2>
      <div className="px-5"><Card className="overflow-hidden divide-y divide-border border-0">{children}</Card></div>
    </div>
  );
}

function Row({
  to, icon: Icon, label, hint, tone = "default",
}: {
  to?: string; icon: React.ComponentType<{ className?: string }>;
  label: string; hint?: string; tone?: "default" | "success";
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition">
      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-foreground">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {hint && (
        <span className={`text-xs font-semibold ${tone === "success" ? "text-[color:var(--success)]" : "text-muted-foreground"}`}>
          {hint}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <button className="w-full text-left">{inner}</button>;
}
