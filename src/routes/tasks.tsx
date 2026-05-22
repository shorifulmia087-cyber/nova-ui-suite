import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { listTasks, completeTask, isCurrentUserAdmin } from "@/lib/tasks.functions";
import { invalidateProfile } from "@/lib/use-profile";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, Circle, Sparkles, ExternalLink, Settings } from "lucide-react";

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

      <div className="px-5">
        <Card className="rounded-lg bg-card border-border shadow-card p-6 text-center text-muted-foreground border-0 shadow-sm text-white">
          <p className="text-caption text-white/70 uppercase tracking-widest">Available rewards</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-stat">৳{totalReward.toFixed(2)}</p>
            <div className="text-right">
              <p className="text-caption text-white/70">Completed</p>
              <p className="text-label">{completedCount} / {total}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full bg-[color:var(--accent)] rounded-full transition-all"
              style={{ width: total ? `${(completedCount / total) * 100}%` : "0%" }}
            />
          </div>
          <p className="text-caption text-white/70 mt-2">Total earned: ৳{totalEarned.toFixed(2)}</p>
        </Card>
      </div>

      <div className="flex-1 pb-28 opacity-100 mt-5 space-y-2">
        {loading ? (
          <Card className="p-6 text-center text-caption text-muted-foreground">Loading tasks…</Card>
        ) : total === 0 ? (
          <Card className="p-6 text-center text-caption text-muted-foreground">
            No tasks available right now. Check back later.
          </Card>
        ) : remaining === 0 ? (
          <Card className="p-6 text-center text-caption text-muted-foreground">
            🎉 You've completed all available tasks!
          </Card>
        ) : null}

        {tasks.map((t) => {
          const done = t.completed;
          const submitting = submittingId === t.id;
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                    done
                      ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-label truncate">{t.title}</p>
                    <span className="text-label text-[color:var(--success)] inline-flex items-center gap-1 shrink-0">
                      <Sparkles className="h-3 w-3" /> ৳{t.reward.toFixed(2)}
                    </span>
                  </div>
                  {t.description && (
                    <p className="text-caption mt-0.5 text-muted-foreground line-clamp-2">{t.description}</p>
                  )}
                  {t.task_url && !done && (
                    <a
                      href={t.task_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-caption text-primary inline-flex items-center gap-1 mt-1"
                    >
                      Open link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <ActionButton
                  size="sm"
                  variant={done ? "ghost" : "brand"}
                  disabled={done || submitting}
                  onClick={() => handleComplete(t)}
                >
                  {done ? "Completed" : submitting ? "Submitting…" : "Complete task"}
                </ActionButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
