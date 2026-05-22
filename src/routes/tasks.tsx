import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { listTasks, completeTask, isCurrentUserAdmin } from "@/lib/tasks.functions";
import { invalidateProfile } from "@/lib/use-profile";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, Sparkles, ExternalLink, Settings, Share2, Play, Gift, Target, Loader2 } from "lucide-react";

const ICON_PALETTE = [
  { bg: "bg-emerald-500/10", text: "text-emerald-400", Icon: Play },
  { bg: "bg-teal-500/10", text: "text-teal-400", Icon: Share2 },
  { bg: "bg-amber-500/10", text: "text-amber-400", Icon: Gift },
  { bg: "bg-sky-500/10", text: "text-sky-400", Icon: Target },
] as const;

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Ness" },
      { name: "description", content: "Complete tasks to earn instantly." },
    ],
  }),
  component: Tasks,
});

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  task_url: string | null;
  completed: boolean;
};

function Tasks() {
  const { user } = useAuth();
  const fetchTasks = useServerFn(listTasks);
  const submitComplete = useServerFn(completeTask);
  const checkAdmin = useServerFn(isCurrentUserAdmin);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function reload() {
    try {
      const res = await fetchTasks();
      setTasks(res.tasks);
      setCompletedCount(res.completedCount);
      setTotalEarned(res.totalEarned);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    reload();
    checkAdmin().then((r) => setIsAdmin(r.isAdmin)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleComplete(task: TaskItem) {
    if (task.completed || submittingId) return;
    setSubmittingId(task.id);
    try {
      const res = await submitComplete({ data: { taskId: task.id } });
      toast.success(`+৳${res.reward.toFixed(2)} added to your balance`);
      if (user) await invalidateProfile(user.id);
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not complete task");
    } finally {
      setSubmittingId(null);
    }
  }

  if (!user) {
    return (
      <div>
        <ScreenHeader title="Tasks" subtitle="Sign in to earn" back={false} />
        <div className="px-5">
          <Card className="p-6 text-center">
            <p className="text-label mb-3">Please sign in to view tasks.</p>
            <Link to="/login"><ActionButton variant="brand">Sign in</ActionButton></Link>
          </Card>
        </div>
      </div>
    );
  }

  const remaining = tasks.filter((t) => !t.completed).length;
  const total = tasks.length;
  const totalReward = tasks.reduce((s, t) => s + t.reward, 0);

  return (
    <div>
      <ScreenHeader
        title="Tasks"
        subtitle="Complete to earn instantly"
        back={false}
        right={
          isAdmin ? (
            <Link to="/admin/tasks" className="inline-flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" /> Admin
            </Link>
          ) : undefined
        }
      />

      {/* Earnings hero — light card, mint accents */}
      <div className="px-5">
        <div className="rounded-3xl bg-card border border-border shadow-card p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em] mb-1">
                Available rewards
              </p>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                ৳{totalReward.toFixed(2)}
              </p>
            </div>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
              {completedCount}/{total || 0} Completed
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: total ? `${(completedCount / total) * 100}%` : "0%" }}
              />
            </div>
            <div className="flex justify-between items-center text-caption">
              <span className="text-muted-foreground">Daily progress</span>
              <span className="font-semibold text-foreground">
                Total earned: ৳{totalEarned.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 pb-28 mt-6">
        <div className="px-5 mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
            Active tasks
          </h2>
          {!loading && total > 0 && (
            <span className="text-caption text-muted-foreground">
              {remaining} remaining
            </span>
          )}
        </div>

        <div className="px-5 space-y-3">
          {loading ? (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-muted/60 animate-pulse p-5 flex gap-4 items-center"
                >
                  <div className="w-12 h-12 bg-muted rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-2.5 bg-muted rounded w-full" />
                    <div className="h-9 bg-muted rounded-xl w-full mt-2" />
                  </div>
                </div>
              ))}
            </>
          ) : total === 0 ? (
            <div className="rounded-2xl bg-card border border-border shadow-card p-10 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Gift className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-label text-foreground">No tasks available</p>
              <p className="text-caption text-muted-foreground mt-1">
                Check back soon for new earning opportunities.
              </p>
            </div>
          ) : remaining === 0 ? (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-center text-white shadow-glow">
              <Sparkles className="h-7 w-7 mx-auto mb-2" />
              <p className="text-label font-bold">All tasks completed!</p>
              <p className="text-caption text-white/85 mt-1">
                You earned ৳{totalEarned.toFixed(2)} today. Come back tomorrow for more.
              </p>
            </div>
          ) : null}

          {tasks.map((t, idx) => {
            const done = t.completed;
            const submitting = submittingId === t.id;
            const palette = ICON_PALETTE[idx % ICON_PALETTE.length];
            const Icon = done ? CheckCircle2 : palette.Icon;
            return (
              <div
                key={t.id}
                className={`rounded-2xl p-5 shadow-xl transition-all ${
                  done
                    ? "bg-slate-900/70 opacity-75"
                    : "bg-slate-900 hover:shadow-2xl"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      done ? "bg-emerald-500/15 text-emerald-400" : `${palette.bg} ${palette.text}`
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-white font-bold text-base leading-tight truncate">
                        {t.title}
                      </h3>
                      <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded text-sm shrink-0">
                        ৳{t.reward.toFixed(2)}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-slate-400 text-caption mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={done || submitting}
                    onClick={() => handleComplete(t)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-colors disabled:cursor-not-allowed ${
                      done
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-70"
                    }`}
                  >
                    {done ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Completed
                      </>
                    ) : submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      "Complete task"
                    )}
                  </button>
                  {t.task_url && !done && (
                    <a
                      href={t.task_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 h-11 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 inline-flex items-center justify-center transition-colors"
                      aria-label="Open task link"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
