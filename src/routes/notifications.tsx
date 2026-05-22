import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card } from "@/components/mobile/Primitives";
import { notifications } from "@/lib/mock";
import { Sparkles, ArrowUpFromLine, ListChecks, Gift, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Ness" }] }),
  component: Notifs,
});

const map = {
  earn: { Icon: Sparkles, c: "bg-[color:var(--success)]/15 text-[color:var(--success)]" },
  withdraw: { Icon: ArrowUpFromLine, c: "bg-destructive/12 text-destructive" },
  task: { Icon: ListChecks, c: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" },
  referral: { Icon: Gift, c: "bg-primary/10 text-primary" },
  system: { Icon: ShieldCheck, c: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]" },
} as const;

function Notifs() {
  return (
    <div>
      <ScreenHeader title="Notifications" subtitle={`${notifications.length} updates`} />
      <div className="px-5 space-y-2">
        {notifications.map((n) => {
          const { Icon, c } = map[n.type as keyof typeof map];
          return (
            <Card key={n.id} className="p-3 flex items-start gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-label truncate">{n.title}</p>
                  <span className="text-caption shrink-0">{n.time}</span>
                </div>
                <p className="text-body-secondary mt-0.5">{n.body}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
