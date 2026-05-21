import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@/lib/auth-schemas";
import { signupUser } from "@/lib/auth.functions";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Ness" },
      { name: "description", content: "Create your Ness account to start earning." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const signup = useServerFn(signupUser);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      mobile_number: "",
      email: "",
      referral_code: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupInput) => {
    setSubmitting(true);
    try {
      const res = await signup({ data: values });
      toast.success(`Account created! Your referral code: ${res.referralCode}`);

      // Immediately sign in (email confirmation off by default for cloud test).
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (signInErr) {
        toast.info("Please confirm your email, then sign in.");
        navigate({ to: "/login" });
      } else {
        navigate({ to: "/" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Signup failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-8">
      <h1 className="text-display mb-1">Create account</h1>
      <p className="text-body-secondary mb-6">Join Ness and start earning today.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={form.formState.errors.full_name?.message}>
          <Input {...form.register("full_name")} placeholder="Your name" autoComplete="name" />
        </Field>

        <Field label="Mobile number" error={form.formState.errors.mobile_number?.message}>
          <Input {...form.register("mobile_number")} inputMode="numeric" placeholder="017XXXXXXXX" autoComplete="tel" />
        </Field>

        <Field label="Email address" error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} type="email" placeholder="you@example.com" autoComplete="email" />
        </Field>

        <Field label="Referral code (optional)" error={form.formState.errors.referral_code?.message}>
          <Input {...form.register("referral_code")} placeholder="e.g. AB12CD34" autoCapitalize="characters" />
        </Field>

        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input {...form.register("password")} type="password" placeholder="Min 8 chars, upper/lower/number" autoComplete="new-password" />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-full bg-foreground text-background text-button active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-label mt-6 text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground font-medium underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-label text-foreground block mb-1.5">{label}</span>
      {children}
      {error && <span className="text-caption text-destructive block mt-1">{error}</span>}
    </label>
  );
}
