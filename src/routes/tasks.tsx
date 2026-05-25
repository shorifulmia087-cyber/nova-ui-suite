import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { Heading, Text } from "@/lib/typography";
import { listTasks, completeTask, isCurrentUserAdmin } from "@/lib/tasks.functions";
import { invalidateProfile } from "@/lib/use-profile";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, Sparkles, ExternalLink, Settings, Share2, Play, Gift, Target, Loader2 } from "lucide-react";

const ICON_TONES = [
  "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  "bg-[color:var(--secondary)]/15 text-[color:var(--secondary)]",
  "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  "bg-[color:var(--success)]/15 text-[color:var(--success)]",
] as const;
const ICONS = [Play, Share2, Gift, Target] as const;

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
  const queryClient = useQueryClient();

  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => fetchTasks(),
    enabled: !!user,
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const adminQuery = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => checkAdmin(),
    enabled: !!user,
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const tasks: TaskItem[] = tasksQuery.data?.tasks ?? [];
  const completedCount = tasksQuery.data?.completedCount ?? 0;
  const totalEarned = tasksQuery.data?.totalEarned ?? 0;
  const isAdmin = adminQuery.data?.isAdmin ?? false;
  const loading = tasksQuery.isLoading;

  async function handleComplete(task: TaskItem) {
    if (task.completed || submittingId) return;
    setSubmittingId(task.id);
    try {
      const res = await submitComplete({ data: { taskId: task.id } });
      toast.success(`+৳${res.reward.toFixed(2)} added to your balance`);
      if (user) await invalidateProfile(user.id);
      await queryClient.invalidateQueries({ queryKey: ["tasks", user?.id], refetchType: "active" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not complete task");
    } finally {
      setSubmittingId(null);
    }
  }



  if (!user) {
    return (
      <div>
        <ScreenHeader back={false} />
        <div className="px-4">
          <Card className="p-card text-center">
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
      <div className="px-4">
        <div className="rounded-lg bg-card border border-border shadow-card p-card">
          <div className="flex justify-between items-start mb-5">
            <div>
              <Text variant="caption" as="p" case="upper" className="text-muted-foreground font-semibold mb-1">
                Available rewards
              </Text>
              <Text variant="stat" as="p" className="text-foreground">
                ৳{totalReward.toFixed(2)}
              </Text>
            </div>
            <Text variant="caption" className="font-semibold bg-[color:var(--accent)]/10 text-[color:var(--accent)] px-3 py-1 rounded-pill">
              {completedCount}/{total || 0} Completed
            </Text>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--secondary)]"
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
        <div className="px-4 mb-3 flex items-center justify-between">
          <Text variant="caption" as="h2" case="upper" className="text-muted-foreground font-semibold">
            Active tasks
          </Text>
          {!loading && total > 0 && (
            <span className="text-caption text-muted-foreground">
              {remaining} remaining
            </span>
          )}
        </div>

        <div className="px-4 space-y-3">
          {loading ? (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-muted/60 animate-pulse p-card flex gap-4 items-center"
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
            <div className="rounded-lg bg-card border border-border shadow-card p-card text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Gift className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-label text-foreground">No tasks available</p>
              <p className="text-caption text-muted-foreground mt-1">
                Check back soon for new earning opportunities.
              </p>
            </div>
          ) : remaining === 0 ? (
            <div className="rounded-lg p-card text-center text-accent-foreground shadow-glow bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--secondary)]">
              <Sparkles className="h-7 w-7 mx-auto mb-2" />
              <p className="text-label font-bold">All tasks completed!</p>
              <p className="text-caption opacity-90 mt-1">
                You earned ৳{totalEarned.toFixed(2)} today. Come back tomorrow for more.
              </p>
            </div>
          ) : null}

          {tasks.map((t, idx) => {
            const done = t.completed;
            const submitting = submittingId === t.id;
            const Icon = done ? CheckCircle2 : ICONS[idx % ICONS.length];
            const iconTone = done
              ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
              : ICON_TONES[idx % ICON_TONES.length];
            return (
              <div
                key={t.id}
                className={`rounded-lg p-card bg-card transition-all ${
                  done ? "opacity-75" : "hover:shadow-glow"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconTone}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-card-foreground font-bold text-base leading-tight truncate">
                        {t.title}
                      </h3>
                      <span className="text-[color:var(--accent)] font-bold bg-[color:var(--accent)]/10 px-2 py-0.5 rounded text-sm shrink-0">
                        ৳{t.reward.toFixed(2)}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-muted-foreground text-caption mt-1 line-clamp-2">
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
                        ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                        : "bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-70"
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
                      className="px-4 h-11 rounded-xl inline-flex items-center justify-center transition-colors border border-border text-muted-foreground hover:bg-muted"
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
