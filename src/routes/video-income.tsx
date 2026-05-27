import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useMemo, type ChangeEvent, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  Sparkles,
  PlayCircle,
  Upload,
  Flame,
  ArrowRight,
  Eye,
  Link2,
  Youtube,
  Image as ImageIcon,
  BarChart3,
  Clock,
  ShieldCheck,
  Wallet,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Heading, Text } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  listVideoTiers,
  listMyVideoSubmissions,
  submitVideo,
} from "@/lib/video-income.functions";

export const Route = createFileRoute("/video-income")({
  head: () => ({
    meta: [
      { title: "Earn from Videos — Ness" },
      {
        name: "description",
        content:
          "Earn verified rewards based on your YouTube video views. Submit once, get paid after verification.",
      },
    ],
  }),
  component: VideoIncomePage,
});

// Map tier sort_order -> icon + label
const tierIcons = [Eye, PlayCircle, Sparkles, BarChart3, Flame];
const tierLabels = ["Entry", "Popular", "Advanced", "Pro", "Expert"];

const timeline = [
  { icon: Upload,      title: "Submitted",        sub: "Your video has been received",                 eta: "Just now",  offsetH: 0 },
  { icon: Clock,       title: "Under review",     sub: "Our team is verifying views and content",      eta: "12–24 h",   offsetH: 18 },
  { icon: ShieldCheck, title: "Approval",         sub: "Approved after successful verification",       eta: "24–48 h",   offsetH: 36 },
  { icon: Wallet,      title: "Added to balance", sub: "Reward credited to your main wallet balance",  eta: "48–72 h",   offsetH: 60 },
];

function formatStepTime(offsetH: number) {
  const d = new Date(Date.now() + offsetH * 60 * 60 * 1000);
  const day = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

// --- Client-side validation (mirrors server) ---
const youtubeUrl = z
  .string()
  .url("সঠিক URL দিন")
  .max(500)
  .refine((u) => /(?:youtube\.com|youtu\.be)/i.test(u), "YouTube লিঙ্ক দিন");

const formSchema = z.object({
  tier_id: z.string().uuid("Tier নির্বাচন করুন"),
  video_url: youtubeUrl,
  channel_name: z.string().trim().min(1, "Channel name দিন").max(120),
  channel_link: youtubeUrl,
});

const MAX_FILE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function validateFile(f: File | null, label: string): string | null {
  if (!f) return `${label} আপলোড করুন`;
  if (!ALLOWED_TYPES.includes(f.type)) return `${label}: PNG / JPG / WEBP দিন`;
  if (f.size > MAX_FILE) return `${label}: 5MB-এর কম রাখুন`;
  return null;
}

function VideoIncomePage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const tiersFn = useServerFn(listVideoTiers);
  const subsFn = useServerFn(listMyVideoSubmissions);
  const submitFn = useServerFn(submitVideo);

  const tiersQ = useQuery({
    queryKey: ["video-tiers"],
    queryFn: () => tiersFn(),
    enabled: !!user,
  });
  const subsQ = useQuery({
    queryKey: ["my-video-submissions"],
    queryFn: () => subsFn(),
    enabled: !!user,
  });

  const tiers = tiersQ.data?.tiers ?? [];
  const submissions = subsQ.data?.submissions ?? [];
  const pendingSubmission = submissions.find((s) => s.status === "pending");
  const hasPending = !!pendingSubmission;

  const [selectedTier, setSelectedTier] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [analyticsFile, setAnalyticsFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  type FieldKey =
    | "tier_id"
    | "video_url"
    | "channel_name"
    | "channel_link"
    | "channel_logo"
    | "analytics";
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const clearError = (k: FieldKey) =>
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });

  // Default tier = first one once loaded (or pending tier)
  const effectiveTier = useMemo(() => {
    if (selectedTier) return selectedTier;
    if (pendingSubmission) return pendingSubmission.tier_id;
    return tiers[0]?.id ?? "";
  }, [selectedTier, pendingSubmission, tiers]);

  const currentTier = tiers.find((t) => t.id === effectiveTier);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");

      // 3. Upload images to storage under {userId}/...
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const ext = (f: File) =>
        f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
      const logoPath = `${user.id}/video/${ts}-${rand}-logo.${ext(logoFile!)}`;
      const analyticsPath = `${user.id}/video/${ts}-${rand}-analytics.${ext(analyticsFile!)}`;

      const up1 = await supabase.storage
        .from("video-uploads")
        .upload(logoPath, logoFile!, { contentType: logoFile!.type, upsert: false });
      if (up1.error) throw new Error(`Logo upload: ${up1.error.message}`);

      const up2 = await supabase.storage
        .from("video-uploads")
        .upload(analyticsPath, analyticsFile!, {
          contentType: analyticsFile!.type,
          upsert: false,
        });
      if (up2.error) {
        await supabase.storage.from("video-uploads").remove([logoPath]);
        throw new Error(`Analytics upload: ${up2.error.message}`);
      }

      // Server fn (server re-validates with zod + auth + file sniffing)
      return submitFn({
        data: {
          tier_id: effectiveTier,
          video_url: videoUrl,
          channel_name: channelName,
          channel_link: channelLink,
          channel_logo_path: logoPath,
          analytics_path: analyticsPath,
        },
      });
    },
    onSuccess: () => {
      toast.success("সাবমিট হয়েছে · রিভিউ অপেক্ষমান");
      qc.invalidateQueries({ queryKey: ["my-video-submissions"] });
      setVideoUrl("");
      setChannelName("");
      setChannelLink("");
      setLogoFile(null);
      setAnalyticsFile(null);
      setErrors({});
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: Error) => {
      const msg = err.message || "সাবমিট করা যায়নি";
      // Try to route server-side file errors back to the right field
      if (/Channel logo/i.test(msg)) setErrors((p) => ({ ...p, channel_logo: msg }));
      else if (/Analytics/i.test(msg)) setErrors((p) => ({ ...p, analytics: msg }));
      toast.error(msg);
    },
  });

  const canSubmit =
    !!effectiveTier &&
    videoUrl.trim().length > 5 &&
    channelName.trim().length > 0 &&
    channelLink.trim().length > 5 &&
    logoFile !== null &&
    analyticsFile !== null &&
    !mutation.isPending;

  const handleSubmit = () => {
    if (hasPending) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Client-side zod validation -> per-field error map
    const parsed = formSchema.safeParse({
      tier_id: effectiveTier,
      video_url: videoUrl,
      channel_name: channelName,
      channel_link: channelLink,
    });
    const next: Partial<Record<FieldKey, string>> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as FieldKey | undefined;
        if (path && !next[path]) next[path] = issue.message;
      }
    }
    const e1 = validateFile(logoFile, "Channel logo");
    if (e1) next.channel_logo = e1;
    const e2 = validateFile(analyticsFile, "Analytics screenshot");
    if (e2) next.analytics = e2;

    if (Object.keys(next).length > 0) {
      setErrors(next);
      toast.error("ফর্মের ত্রুটি সংশোধন করুন");
      return;
    }
    setErrors({});
    mutation.mutate();
  };


  /* -------------------------- SUCCESS / STATUS VIEW -------------------------- */
  if (submitted && (hasPending || submissions[0])) {
    const sub = pendingSubmission ?? submissions[0];
    const status = sub.status as "pending" | "approved" | "rejected";
    const currentStep =
      status === "approved" ? timeline.length - 1 : status === "rejected" ? 1 : 1;
    const totalSteps = timeline.length;
    const progressPct = Math.round((currentStep / (totalSteps - 1)) * 100);
    const statusLabel =
      status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "In review";

    return (
      <div className="pb-40">
        <ScreenHeader />

        {/* Clean hero */}
        <section className="px-4">
          <div className="relative rounded-xl bg-card ring-1 ring-border elevation-2 p-card">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <span aria-hidden className="absolute inset-0 rounded-pill bg-accent/20 animate-ping" />
                <div className="relative h-14 w-14 rounded-pill bg-accent text-accent-foreground flex items-center justify-center">
                  <Check className="h-7 w-7" strokeWidth={2} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-accent/10 ring-1 ring-accent/20">
                  <span className="h-1.5 w-1.5 rounded-pill bg-accent animate-pulse" />
                  <Text variant="caption" className="text-accent">
                    {statusLabel}
                  </Text>
                </span>
                <Heading variant="cardTitle" case="sentence" className="text-foreground mt-2">
                  Submission received
                </Heading>
                <Text variant="caption" className="text-muted-foreground mt-1 block">
                  ID · {sub.id.slice(0, 8).toUpperCase()}
                </Text>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <Text variant="caption" className="text-muted-foreground">
                  Progress
                </Text>
                <Text variant="caption" className="text-foreground tabular-nums">
                  {progressPct}%
                </Text>
              </div>
              <div className="h-1.5 w-full rounded-pill bg-muted overflow-hidden">
                <div
                  className="h-full rounded-pill bg-accent transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-4 mt-8">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <SectionEyebrow>Review process</SectionEyebrow>
              <Heading variant="sectionTitle" case="sentence" className="text-foreground mt-1">
                Live status
              </Heading>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-accent/10 ring-1 ring-accent/20 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-pill bg-accent/60 animate-ping" />
                <span className="relative h-2 w-2 rounded-pill bg-accent" />
              </span>
              <Text variant="caption" className="text-accent">Live</Text>
            </span>
          </div>

          <ol className="relative mt-5 pl-16">
            <span aria-hidden className="absolute left-[23px] top-3 bottom-3 w-px bg-border" />
            <span
              aria-hidden
              className="absolute left-[23px] top-3 w-px bg-gradient-to-b from-accent to-accent/30 transition-all duration-700"
              style={{ height: `calc((100% - 24px) * ${currentStep / (totalSteps - 1)})` }}
            />

            {timeline.map(({ icon: I, title, sub: stepSub, eta, offsetH }, idx) => {
              const done = idx < currentStep;
              const active = idx === currentStep;
              const pending = !done && !active;
              const isLast = idx === timeline.length - 1;

              return (
                <li key={title} className={cn("relative", isLast ? "" : "pb-5")}>
                  <div className="absolute -left-16 top-1">
                    <div className="relative h-12 w-12">
                      {active && (
                        <>
                          <span aria-hidden className="absolute inset-0 rounded-pill bg-accent/25 animate-ping" />
                          <span aria-hidden className="absolute -inset-1 rounded-pill bg-accent/10" />
                        </>
                      )}
                      <div
                        className={cn(
                          "relative h-12 w-12 rounded-pill flex items-center justify-center transition-all",
                          done && "bg-accent text-accent-foreground shadow-glow",
                          active && "bg-card text-accent ring-2 ring-accent shadow-glow",
                          pending && "bg-card text-muted-foreground ring-1 ring-border",
                        )}
                      >
                        {done ? <Check className="h-5 w-5" strokeWidth={2} /> : <I className="h-5 w-5" strokeWidth={2} />}
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "rounded-lg p-card transition-all",
                      active && "bg-card ring-1 ring-accent/40 shadow-glow",
                      done && "bg-card/60 ring-1 ring-border/50",
                      pending && "bg-card/40 ring-1 ring-dashed ring-border/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Heading
                            variant="cardTitle"
                            case="sentence"
                            className={cn(pending ? "text-muted-foreground" : "text-foreground")}
                          >
                            {title}
                          </Heading>
                          {active && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-accent text-accent-foreground">
                              <span className="h-1.5 w-1.5 rounded-pill bg-accent-foreground animate-pulse" />
                              <Text variant="caption" className="text-accent-foreground">In progress</Text>
                            </span>
                          )}
                          {done && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-accent/15">
                              <Check className="h-3 w-3 text-accent" strokeWidth={2} />
                              <Text variant="caption" className="text-accent">Done</Text>
                            </span>
                          )}
                        </div>
                        <Text variant="bodySecondary" as="p" className="mt-1">
                          {stepSub}
                        </Text>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1.5 min-w-0">
                        <Clock className={cn("h-3.5 w-3.5 shrink-0", done ? "text-accent" : active ? "text-accent" : "text-muted-foreground")} strokeWidth={2} />
                        <Text variant="caption" className={cn("truncate", done ? "text-accent" : "text-muted-foreground")}>
                          {done ? "Completed" : active ? "Now" : `In ${eta}`}
                        </Text>
                      </div>
                      <Text variant="caption" className="text-muted-foreground tabular-nums shrink-0">
                        {formatStepTime(offsetH)}
                      </Text>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="px-4 mt-6">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="w-full rounded-lg p-card bg-card ring-1 ring-border flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={2} />
            <Text variant="button" className="text-foreground">Back to form</Text>
          </button>
        </section>
      </div>
    );
  }

  /* ----------------------------- SUBMISSION VIEW ----------------------------- */
  return (
    <div className="pb-40">
      <ScreenHeader />

      {/* Pending submission banner */}
      {hasPending && (
        <section className="px-4 mt-2">
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full text-left rounded-lg p-card flex items-center gap-3 bg-accent/10 ring-1 ring-accent/30 active:scale-[0.99] transition-all"
          >
            <div className="h-10 w-10 rounded-pill bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <Heading variant="cardTitle" case="sentence" className="text-foreground">
                Pending review in progress
              </Heading>
              <Text variant="caption" className="text-muted-foreground mt-0.5 block">
                Tap to view current submission status
              </Text>
            </div>
            <ArrowRight className="h-5 w-5 text-accent shrink-0" strokeWidth={2} />
          </button>
        </section>
      )}

      {/* Tier selection */}
      <section className="px-4 mt-2">
        <div className="mt-5 space-y-2.5">
          {tiersQ.isLoading && (
            <div className="rounded-lg p-card bg-card ring-1 ring-border flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={2} />
              <Text variant="bodySecondary">Loading tiers…</Text>
            </div>
          )}

          {tiers.map((t, idx) => {
            const I = tierIcons[idx % tierIcons.length];
            const label = tierLabels[idx % tierLabels.length];
            const active = effectiveTier === t.id;
            const disabled = hasPending && !active;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => !disabled && setSelectedTier(t.id)}
                disabled={disabled}
                aria-pressed={active}
                className={cn(
                  "w-full text-left rounded-lg p-card flex items-center gap-4 transition-all active:scale-[0.99]",
                  active
                    ? "bg-card ring-2 ring-accent shadow-glow"
                    : "bg-card ring-1 ring-border/60 hover:ring-border",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <I className="h-5 w-5" strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <Heading variant="cardTitle" case="sentence" className="text-foreground">
                    {t.min_views.toLocaleString()}+ views
                  </Heading>
                  <Text variant="caption" className={cn("mt-0.5 block", active ? "text-accent" : "text-muted-foreground")}>
                    {t.label ?? label}
                  </Text>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <Text variant="caption" className={cn(active ? "text-accent/80" : "text-muted-foreground")}>
                      Reward
                    </Text>
                    <Text variant="cardTitle" as="p" className={cn("tabular-nums", active ? "text-accent" : "text-foreground")}>
                      ৳{Number(t.reward_amount)}
                    </Text>
                  </div>
                  <span
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center transition-all shrink-0",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "bg-transparent ring-1 ring-border",
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Submission form */}
      <section className="px-4 mt-8">
        <div className="mt-4 rounded-xl bg-white ring-1 ring-border shadow-card p-card text-slate-900">
          <FieldGroup title="Channel & video" first>
            <FieldInput
              label="Video URL"
              icon={<Link2 className="h-[18px] w-[18px]" />}
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                clearError("video_url");
              }}
              disabled={hasPending}
              error={errors.video_url}
            />
            <FieldInput
              label="YouTube channel name"
              icon={<Youtube className="h-[18px] w-[18px]" />}
              placeholder="Your channel name"
              value={channelName}
              onChange={(e) => {
                setChannelName(e.target.value);
                clearError("channel_name");
              }}
              disabled={hasPending}
              error={errors.channel_name}
            />
            <FieldInput
              label="YouTube channel link"
              icon={<Link2 className="h-[18px] w-[18px]" />}
              placeholder="https://youtube.com/@yourchannel"
              value={channelLink}
              onChange={(e) => {
                setChannelLink(e.target.value);
                clearError("channel_link");
              }}
              disabled={hasPending}
              error={errors.channel_link}
            />
          </FieldGroup>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <FileField
              label="Channel logo"
              hint="PNG / JPG · ≤5MB"
              icon={<ImageIcon className="h-5 w-5" />}
              file={logoFile}
              onChange={(f) => {
                setLogoFile(f);
                clearError("channel_logo");
              }}
              disabled={hasPending}
              error={errors.channel_logo}
            />
            <FileField
              label="Analytics screenshot"
              hint="Show view count"
              icon={<BarChart3 className="h-5 w-5" />}
              file={analyticsFile}
              onChange={(f) => {
                setAnalyticsFile(f);
                clearError("analytics");
              }}
              disabled={hasPending}
              error={errors.analytics}
            />
          </div>
        </div>
      </section>


      {/* Sticky CTA */}
      <StickyCta>
        {hasPending ? (
          <PrimaryButton
            onClick={() => {
              setSubmitted(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Eye className="h-5 w-5" />
            View pending submission status
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
            {mutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting…
              </>
            ) : canSubmit && currentTier ? (
              <>
                Submit for review · ৳{Number(currentTier.reward_amount)}
                <ArrowRight className="h-5 w-5 transition-transform group-active:translate-x-1" />
              </>
            ) : (
              <>Complete all fields to submit</>
            )}
          </PrimaryButton>
        )}
      </StickyCta>
    </div>
  );
}

/* ============================== PRIMITIVES ============================== */

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-eyebrow text-accent normal-case capitalize tracking-normal">{children}</p>;
}

function FieldGroup({ title, children, first }: { title: string; children: ReactNode; first?: boolean }) {
  return (
    <div className={first ? "" : "mt-4"}>
      <Text variant="caption" case="title" className="text-slate-500">
        {title}
      </Text>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

function StickyCta({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pt-6 pb-3 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative w-full flex items-center justify-center gap-2 h-14 rounded-lg transition-all",
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-primary text-primary-foreground shadow-glow active:scale-[0.98]",
      )}
    >
      <Text variant="button" className="inline-flex items-center gap-2">
        {children}
      </Text>
    </button>
  );
}

function FieldInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  disabled,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <Text variant="label" className="text-slate-700 mb-1.5 block">
        {label}
      </Text>
      <div className="relative">
        <span
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2",
            error ? "text-destructive" : "text-slate-400",
          )}
        >
          {icon}
        </span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            "w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 ring-1 text-slate-900 text-input placeholder:text-slate-400 focus:ring-2 focus:bg-white focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed",
            error
              ? "ring-destructive/60 focus:ring-destructive"
              : "ring-slate-200 focus:ring-accent",
          )}
        />
      </div>
      {error && (
        <Text variant="caption" as="p" className="text-destructive mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </label>
  );
}


function FileField({
  label,
  hint,
  icon,
  file,
  onChange,
  disabled,
  error,
}: {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  file: File | null;
  onChange: (f: File | null) => void;
  disabled?: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

  return (
    <div className="block">
      <button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        disabled={disabled}
        aria-invalid={!!error}
        className={cn(
          "relative w-full aspect-square rounded-lg overflow-hidden transition-all active:scale-[0.98] text-left group",
          file
            ? "ring-2 ring-accent shadow-glow"
            : "ring-1 ring-dashed ring-slate-300 hover:ring-accent/60 bg-slate-50",
          error && "ring-2 ring-destructive",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-2 right-2 h-8 w-8 rounded-pill bg-background/90 text-foreground flex items-center justify-center shadow-card"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </span>
            <div className="absolute bottom-0 left-0 right-0 p-card">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-pill bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <Text variant="label" as="p" className="text-primary-foreground truncate">
                  {label}
                </Text>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-card text-center">
            <div className="h-12 w-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              {icon}
            </div>
            <Text variant="label" as="p" className="text-slate-900 mt-1">
              {label}
            </Text>
            {hint && <Text variant="caption" className="text-slate-500">{hint}</Text>}

            <span className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-accent/10 text-accent">
              <Upload className="h-3.5 w-3.5" />
              <Text variant="caption" className="text-accent">Upload</Text>
            </span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
