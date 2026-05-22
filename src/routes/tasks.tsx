import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { tasks } from "@/lib/mock";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Ness" }, { name: "description", content: "Complete tasks to earn instantly." }] }),
  component: Tasks,
});

function Tasks() {
  const completed = tasks.filter((t) => t.progress >= t.total).length;
  const totalReward = tasks.reduce((s, t) => s + t.reward, 0);

  return (
    <div>
      <ScreenHeader title="Tasks" subtitle="Complete to earn instantly" back={false} />

      <div className="px-5">
        <Card className="p-4 bg-gradient-brand text-white border-0 shadow-glow">
          <p className="text-caption text-white/70 uppercase tracking-widest">Available rewards</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-stat">৳{totalReward.toFixed(2)}</p>
            <div className="text-right">
              <p className="text-caption text-white/70">Completed</p>
              <p className="text-label">{completed} / {tasks.length}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full bg-[color:var(--accent)] rounded-full transition-all"
              style={{ width: `${(completed / tasks.length) * 100}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="px-5 mt-5 space-y-2">
        {tasks.map((t) => {
          const done = t.progress >= t.total;
          const pct = (t.progress / t.total) * 100;
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ৳{done ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-muted text-muted-foreground"}`}>
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-label truncate">{t.title}</p>
                    <span className="text-label text-[color:var(--success)] inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> ৳{t.reward.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-caption mt-0.5">{t.type} · {t.progress}/{t.total}</p>
                  <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-mint" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <ActionButton size="sm" variant={done ? "ghost" : "brand"} disabled={done}>
                  {done ? "Claimed" : "Start task"}
                </ActionButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
