import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Phone, Mail, Gift, Lock, Sparkles } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/auth-schemas";
import { signupUser } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { PremiumField } from "@/components/mobile/PremiumField";

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
    <div className="min-h-screen px-6 pt-10 pb-10 flex flex-col">
      <div className="mb-8">
        <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-card mb-5">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-display mb-2">Create account</h1>
        <p className="text-body-secondary">Join Ness and start earning today.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1">
        <PremiumField
          {...form.register("full_name")}
          label="Full name"
          autoComplete="name"
          icon={<User className="h-[18px] w-[18px]" />}
          error={form.formState.errors.full_name?.message}
        />

        <PremiumField
          {...form.register("mobile_number")}
          label="Mobile number"
          inputMode="numeric"
          autoComplete="tel"
          icon={<Phone className="h-[18px] w-[18px]" />}
          error={form.formState.errors.mobile_number?.message}
        />

        <PremiumField
          {...form.register("email")}
          label="Email address"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-[18px] w-[18px]" />}
          error={form.formState.errors.email?.message}
        />

        <PremiumField
          {...form.register("referral_code")}
          label="Referral code (optional)"
          autoCapitalize="characters"
          icon={<Gift className="h-[18px] w-[18px]" />}
          error={form.formState.errors.referral_code?.message}
        />

        <PremiumField
          {...form.register("password")}
          label="Password"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="h-[18px] w-[18px]" />}
          hint="Min 8 chars · upper, lower & number"
          error={form.formState.errors.password?.message}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary text-primary-foreground text-button shadow-card hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60"
          style={{ height: 52 }}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-label mt-8 text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
