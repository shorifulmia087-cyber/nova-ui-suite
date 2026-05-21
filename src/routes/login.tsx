import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/auth-schemas";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Ness" },
      { name: "description", content: "Sign in to your Ness account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    setSubmitting(true);
    try {
      const parsed = loginSchema.parse(values);
      const { error } = await supabase.auth.signInWithPassword(parsed);
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-8">
      <h1 className="text-display mb-1">Welcome back</h1>
      <p className="text-body-secondary mb-6">Sign in to your account.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="text-label text-foreground block mb-1.5">Email</span>
          <Input {...form.register("email")} type="email" autoComplete="email" />
          {form.formState.errors.email && (
            <span className="text-caption text-destructive block mt-1">
              {form.formState.errors.email.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-label text-foreground block mb-1.5">Password</span>
          <Input {...form.register("password")} type="password" autoComplete="current-password" />
          {form.formState.errors.password && (
            <span className="text-caption text-destructive block mt-1">
              {form.formState.errors.password.message}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-full bg-foreground text-background text-button active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-label mt-6 text-center text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-foreground font-medium underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
