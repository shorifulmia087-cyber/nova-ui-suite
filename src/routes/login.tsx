import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/auth-schemas";
import { supabase } from "@/integrations/supabase/client";
import { PremiumField } from "@/components/mobile/PremiumField";

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
    <div className="min-h-screen px-6 pt-12 pb-10 flex flex-col">
      <div className="mb-10">
        <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-card mb-5">
          <ShieldCheck className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-display mb-2">Welcome back</h1>
        <p className="text-body-secondary">Sign in to continue to your account.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1">
        <PremiumField
          {...form.register("email")}
          label="Email address"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-[18px] w-[18px]" />}
          error={form.formState.errors.email?.message}
        />

        <PremiumField
          {...form.register("password")}
          label="Password"
          type="password"
          autoComplete="current-password"
          icon={<Lock className="h-[18px] w-[18px]" />}
          error={form.formState.errors.password?.message}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-13 mt-2 rounded-lg bg-primary text-primary-foreground text-button shadow-card hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60"
          style={{ height: 52 }}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-label mt-8 text-center text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" preload="render" className="text-primary font-semibold">
          Create one
        </Link>
      </p>
    </div>
  );
}
