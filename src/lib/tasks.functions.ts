import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  task_url: string | null;
  is_active: boolean;
  created_at: string;
};

// ----- USER: list active tasks with completion flag -----
export const listTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: tasks, error: tErr }, { data: comps, error: cErr }] = await Promise.all([
      supabase
        .from("tasks")
        .select("id,title,description,reward,task_url,is_active,created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase.from("task_completions").select("task_id,reward_amount,created_at").eq("user_id", userId),
    ]);
    if (tErr) throw new Error(tErr.message);
    if (cErr) throw new Error(cErr.message);
    const done = new Set((comps ?? []).map((c) => c.task_id));
    return {
      tasks: (tasks ?? []).map((t) => ({
        ...t,
        reward: Number(t.reward),
        completed: done.has(t.id),
      })),
      completedCount: done.size,
      totalEarned: (comps ?? []).reduce((s, c) => s + Number(c.reward_amount), 0),
    };
  });

// ----- USER: complete a task -----
export const completeTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ taskId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch task
    const { data: task, error: tErr } = await supabaseAdmin
      .from("tasks")
      .select("id,title,reward,is_active")
      .eq("id", data.taskId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!task || !task.is_active) throw new Error("Task not available");

    // Validate user
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id,main_balance,is_active,is_deleted")
      .eq("id", userId)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile || profile.is_deleted || !profile.is_active) throw new Error("Invalid user");

    // Insert completion (unique constraint blocks duplicates)
    const reward = Number(task.reward);
    const { error: insErr } = await supabaseAdmin.from("task_completions").insert({
      user_id: userId,
      task_id: task.id,
      reward_amount: reward,
    });
    if (insErr) {
      if (insErr.code === "23505") throw new Error("Task already completed");
      throw new Error(insErr.message);
    }

    // Credit balance (admin bypasses protect_profile_fields because auth.uid() is null)
    const newBalance = Number(profile.main_balance) + reward;
    const { error: updErr } = await supabaseAdmin
      .from("profiles")
      .update({ main_balance: newBalance })
      .eq("id", userId);
    if (updErr) throw new Error(updErr.message);

    return { success: true, reward, newBalance, taskTitle: task.title };
  });

// ----- ADMIN helpers -----
type SupaClient = { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> };
async function ensureAdmin(supabase: SupaClient, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminListTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("id,title,description,reward,task_url,is_active,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    // Completion counts
    const { data: comps } = await supabaseAdmin.from("task_completions").select("task_id");
    const counts = new Map<string, number>();
    (comps ?? []).forEach((c) => counts.set(c.task_id, (counts.get(c.task_id) ?? 0) + 1));

    return (data ?? []).map((t) => ({
      ...t,
      reward: Number(t.reward),
      completions: counts.get(t.id) ?? 0,
    }));
  });

export const adminCreateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional().nullable(),
        reward: z.number().min(0).max(100000),
        task_url: z.string().url().max(500).optional().nullable(),
        is_active: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        title: data.title,
        description: data.description ?? null,
        reward: data.reward,
        task_url: data.task_url ?? null,
        is_active: data.is_active ?? true,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(2000).optional().nullable(),
        reward: z.number().min(0).max(100000).optional(),
        task_url: z.string().url().max(500).optional().nullable(),
        is_active: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("tasks").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminDeleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ----- Check current user is admin -----
export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (error) throw new Error(error.message);
    return { isAdmin: !!data };
  });
