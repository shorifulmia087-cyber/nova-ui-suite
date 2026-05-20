import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { CheckCircle2, Circle, ShieldCheck, IdCard, ScanFace, MapPin } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify account — Ness" }] }),
  component: Verify,
});

const steps = [
  { Icon: IdCard, title: "Personal information", desc: "Name, DOB, contact", done: true },
  { Icon: ScanFace, title: "ID document", desc: "Passport or driver's license", done: true },
  { Icon: MapPin, title: "Proof of address", desc: "Utility bill or statement", done: false },
  { Icon: ShieldCheck, title: "Selfie verification", desc: "Quick liveness check", done: false },
];

function Verify() {
  const completed = steps.filter((s) => s.done).length;
  const pct = (completed / steps.length) * 100;
  return (
    <div>
      <ScreenHeader title="Account verification" subtitle="Unlock higher limits" />

      <div className="px-5">
        <Card className="p-5 bg-gradient-card text-white border-0 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color:var(--accent)]/30 blur-2xl" />
          <p className="relative text-xs uppercase tracking-widest text-white/70">Verification level</p>
          <p className="relative mt-1 text-2xl font-extrabold">Level 2 of 3</p>
          <div className="relative mt-4 h-2 w-full rounded-full bg-white/15 overflow-hidden">
            <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="relative mt-2 text-xs text-white/75">{completed} of {steps.length} steps completed</p>
        </Card>
      </div>

      <div className="px-5 mt-5 space-y-2">
        {steps.map((s, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-md flex items-center justify-center ${s.done ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-muted text-muted-foreground"}`}>
              <s.Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            {s.done ? (
              <CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </Card>
        ))}
      </div>

      <div className="px-5 mt-6">
        <ActionButton variant="brand" size="lg" className="w-full">Continue verification</ActionButton>
      </div>
    </div>
  );
}
