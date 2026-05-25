import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  adminListTasks,
  adminCreateTask,
  adminUpdateTask,
  adminDeleteTask,
  isCurrentUserAdmin,
} from "@/lib/tasks.functions";
import { useAuth } from "@/lib/auth-context";
import { Trash2, Plus, Users } from "lucide-react";

export const Route = createFileRoute("/admin/tasks")({
  head: () => ({ meta: [{ title: "Admin · Tasks — Ness" }] }),
  component: AdminTasks,
});

type Row = {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  task_url: string | null;
  is_active: boolean;
  created_at: string;
  completions: number;
};

function AdminTasks() {
  const { user, loading: authLoading } = useAuth();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const fetchAll = useServerFn(adminListTasks);
  const createFn = useServerFn(adminCreateTask);
  const updateFn = useServerFn(adminUpdateTask);
  const deleteFn = useServerFn(adminDeleteTask);

  const [authorized, setAuthorized] = useState<"checking" | "yes" | "no">("checking");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("10");
  const [taskUrl, setTaskUrl] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAuthorized("no");
      return;
    }
    checkAdmin()
      .then((r) => setAuthorized(r.isAdmin ? "yes" : "no"))
      .catch(() => setAuthorized("no"));
  }, [authLoading, user?.id]);

  async function reload() {
    try {
      const data = await fetchAll();
      setRows(data as Row[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authorized === "yes") reload();
  }, [authorized]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const r = parseFloat(reward);
    if (!title.trim()) return toast.error("Title required");
    if (!isFinite(r) || r < 0) return toast.error("Reward must be ≥ 0");
    setCreating(true);
    try {
      await createFn({
        data: {
          title: title.trim(),
          description: description.trim() || null,
          reward: r,
          task_url: taskUrl.trim() || null,
          is_active: true,
        },
      });
      toast.success("Task created");
      setTitle("");
      setDescription("");
      setReward("10");
      setTaskUrl("");
      await reload();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(row: Row) {
    try {
      await updateFn({ data: { id: row.id, is_active: !row.is_active } });
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  }

  async function remove(row: Row) {
    if (!confirm(`Delete task "${row.title}"? Completions will also be removed.`)) return;
    try {
      await deleteFn({ data: { id: row.id } });
      toast.success("Deleted");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  if (authorized === "checking" || authLoading) {
    return (
      <div>
        <ScreenHeader title="Admin · Tasks" />
        <div className="px-4"><Card className="p-card text-center text-caption text-muted-foreground">Checking access…</Card></div>
      </div>
    );
  }

  if (authorized === "no") {
    return (
      <div>
        <ScreenHeader title="Admin · Tasks" />
        <div className="px-4">
          <Card className="p-card text-center">
            <p className="text-label mb-3">Admin access required.</p>
            <Link to="/"><ActionButton variant="outline">Go home</ActionButton></Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="Admin · Tasks" />

      <div className="px-4">
        <Card className="p-card">
          <h2 className="text-section-title mb-3 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New task
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Watch intro video" maxLength={200} />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={2000} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Reward (৳)</Label>
                <Input type="number" min="0" step="0.01" value={reward} onChange={(e) => setReward(e.target.value)} />
              </div>
              <div>
                <Label>Link URL (optional)</Label>
                <Input type="url" value={taskUrl} onChange={(e) => setTaskUrl(e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <ActionButton variant="brand" disabled={creating}>{creating ? "Creating…" : "Create task"}</ActionButton>
          </form>
        </Card>
      </div>

      <div className="px-4 mt-5 space-y-2">
        <h2 className="text-section-title">All tasks</h2>
        {loading ? (
          <Card className="p-card text-center text-caption text-muted-foreground">Loading…</Card>
        ) : rows.length === 0 ? (
          <Card className="p-card text-center text-caption text-muted-foreground">No tasks yet.</Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id} className="p-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-label truncate">{r.title}</p>
                  {r.description && <p className="text-caption text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-caption text-muted-foreground">
                    <span className="text-[color:var(--success)]">৳{r.reward.toFixed(2)}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {r.completions} done</span>
                    {r.task_url && <a className="text-primary truncate max-w-[140px]" href={r.task_url} target="_blank" rel="noreferrer">link</a>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Label className="text-caption">{r.is_active ? "Active" : "Off"}</Label>
                    <Switch checked={r.is_active} onCheckedChange={() => toggleActive(r)} />
                  </div>
                  <button
                    onClick={() => remove(r)}
                    className="text-destructive hover:bg-destructive/10 p-1.5 rounded"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
