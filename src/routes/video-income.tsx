import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, type ChangeEvent, type ReactNode } from "react";
import {
  Sparkles,
  PlayCircle,
  Upload,
  
  Coins,
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
} from "lucide-react";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Heading, Text } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

type Tier = {
  id: string;
  views: string;
  amount: number;
  icon: typeof Eye;
  label: string;
};

const tiers: Tier[] = [
  { id: "t1", views: "500+ views",   amount: 100,  icon: Eye,        label: "Entry" },
  { id: "t2", views: "1,000+ views", amount: 250,  icon: PlayCircle, label: "Popular" },
  { id: "t3", views: "2,000+ views", amount: 500,  icon: Sparkles,   label: "Advanced" },
  { id: "t4", views: "3,000+ views", amount: 700,  icon: BarChart3,  label: "Pro" },
  { id: "t5", views: "5,000+ views", amount: 1500, icon: Flame,      label: "Expert" },
];

const timeline = [
  { icon: Upload,      title: "Submitted",        sub: "Your video has been received",                 eta: "Now" },
  { icon: Clock,       title: "Under review",     sub: "Our team is verifying views and content",      eta: "12–24 h" },
  { icon: ShieldCheck, title: "Approval",         sub: "Approved after successful verification",       eta: "24–48 h" },
  { icon: Wallet,      title: "Added to balance", sub: "Reward credited to your main wallet balance",  eta: "48–72 h" },
];

function VideoIncomePage() {
  const [selectedTier, setSelectedTier] = useState<string>("t1");
  const [videoUrl, setVideoUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [analyticsFile, setAnalyticsFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const tier = tiers.find((t) => t.id === selectedTier)!;

  const canSubmit =
    videoUrl.trim().length > 5 &&
    channelName.trim().length > 0 &&
    logoFile !== null &&
    analyticsFile !== null;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Please fill in all the fields");
      return;
    }
    setSubmitted(true);
    toast.success("Submitted successfully");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setSubmitted(false);
    setVideoUrl("");
    setChannelName("");
    setLogoFile(null);
    setAnalyticsFile(null);
  };

  /* -------------------------- SUCCESS / STATUS VIEW -------------------------- */
  if (submitted) {
    const currentStep = 1; // 1-indexed: currently "Under review"
    const totalSteps = timeline.length;
    const progressPct = Math.round((currentStep / (totalSteps - 1)) * 100);

    return (
      <div className="pb-40">
        <ScreenHeader />

        {/* Premium hero */}
        <section className="px-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-[color:var(--primary)]/90 text-primary-foreground p-card shadow-navy">
            <span aria-hidden className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-52 w-52 rounded-full bg-primary-foreground/10 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] [background-size:18px_18px]" />

            <div className="relative flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <span className="absolute inset-0 rounded-pill bg-accent/30 animate-ping" />
                <div className="relative h-16 w-16 rounded-pill bg-accent text-accent-foreground flex items-center justify-center shadow-glow">
                  <Check className="h-8 w-8" strokeWidth={2} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-primary-foreground/15 backdrop-blur ring-1 ring-primary-foreground/20">
                  <span className="h-1.5 w-1.5 rounded-pill bg-accent animate-pulse" />
                  <Text variant="caption" className="text-primary-foreground/90">
                    In review
                  </Text>
                </span>
                <Heading variant="cardTitle" case="sentence" className="text-primary-foreground mt-2">
                  Submission received
                </Heading>
                <Text variant="caption" className="text-primary-foreground/70 mt-0.5 block">
                  ID · VI-{Math.random().toString(36).slice(2, 8).toUpperCase()}
                </Text>
              </div>
            </div>

            {/* Reward + tier */}
            <div className="relative mt-5 rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/15 backdrop-blur p-card flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Text variant="caption" className="text-primary-foreground/70">
                  Tier
                </Text>
                <Text variant="label" as="p" className="text-primary-foreground mt-1 truncate">
                  {tier.views}
                </Text>
              </div>
              <span aria-hidden className="h-10 w-px bg-primary-foreground/15" />
              <div className="text-right shrink-0">
                <Text variant="caption" className="text-primary-foreground/70">
                  Reward
                </Text>
                <Text variant="cardTitle" as="p" className="text-accent tabular-nums mt-1">
                  ৳{tier.amount}
                </Text>
              </div>
            </div>

            {/* Progress */}
            <div className="relative mt-5">
              <div className="flex items-center justify-between mb-2">
                <Text variant="caption" className="text-primary-foreground/70">
                  Progress
                </Text>
                <Text variant="caption" className="text-accent tabular-nums">
                  {progressPct}%
                </Text>
              </div>
              <div className="h-1.5 w-full rounded-pill bg-primary-foreground/15 overflow-hidden">
                <div
                  className="h-full rounded-pill bg-gradient-to-r from-accent to-[color:var(--accent)]/70 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-4 mt-8">
          <SectionEyebrow>Review process</SectionEyebrow>
          <Heading variant="sectionTitle" case="sentence" className="text-foreground mt-1">
            What happens next
          </Heading>
          <Text variant="bodySecondary" as="p" className="mt-1">
            Live status of your submission
          </Text>

          <ol className="relative mt-5">
            {/* Background rail */}
            <span aria-hidden className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-border rounded-pill" />
            {/* Filled rail up to current step */}
            <span
              aria-hidden
              className="absolute left-[27px] top-6 w-0.5 bg-gradient-to-b from-accent via-accent to-accent/30 rounded-pill transition-all duration-700"
              style={{ height: `calc((100% - 48px) * ${currentStep / (totalSteps - 1)})` }}
            />

            <div className="space-y-3">
              {timeline.map(({ icon: I, title, sub, eta }, idx) => {
                const done = idx < currentStep;
                const active = idx === currentStep;
                return (
                  <li
                    key={title}
                    className={cn(
                      "relative rounded-lg p-card flex items-start gap-4 transition-all",
                      active
                        ? "bg-card ring-1 ring-accent/40 shadow-glow"
                        : "bg-card ring-1 ring-border/60 shadow-card",
                    )}
                  >
                    <div className="relative shrink-0">
                      {active && (
                        <span aria-hidden className="absolute inset-0 rounded-pill bg-accent/30 animate-ping" />
                      )}
                      <div
                        className={cn(
                          "relative h-14 w-14 rounded-pill flex items-center justify-center ring-2 transition-colors",
                          done
                            ? "bg-accent/15 text-accent ring-accent/30"
                            : active
                              ? "bg-accent text-accent-foreground ring-accent/40"
                              : "bg-muted text-muted-foreground ring-border",
                        )}
                      >
                        {done ? <Check className="h-6 w-6" /> : <I className="h-6 w-6" strokeWidth={2} />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between gap-3">
                        <Heading variant="cardTitle" case="sentence" className="text-foreground">
                          {title}
                        </Heading>
                        <span
                          className={cn(
                            "shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-pill",
                            done
                              ? "bg-accent/15"
                              : active
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted",
                          )}
                        >
                          {active && <span className="h-1.5 w-1.5 rounded-pill bg-accent-foreground animate-pulse" />}
                          <Text
                            variant="caption"
                            className={cn(
                              done
                                ? "text-accent"
                                : active
                                  ? "text-accent-foreground"
                                  : "text-muted-foreground",
                            )}
                          >
                            {done ? "Done" : eta}
                          </Text>
                        </span>
                      </div>
                      <Text variant="bodySecondary" as="p" className="mt-1">
                        {sub}
                      </Text>
                    </div>
                  </li>
                );
              })}
            </div>
          </ol>
        </section>

        {/* Note */}
        <section className="px-4 mt-6">
          <div className="rounded-lg bg-gradient-to-br from-accent/8 to-transparent ring-1 ring-accent/20 p-card flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <Heading variant="cardTitle" case="sentence" className="text-foreground">
                Verified payouts only
              </Heading>
              <Text variant="bodySecondary" as="p" className="mt-1">
                Views are cross-checked against YouTube Studio analytics. Fake views or bot traffic are rejected.
              </Text>
            </div>
          </div>
        </section>

        {/* Sticky CTA */}
        <StickyCta>
          <PrimaryButton onClick={reset}>
            Submit a new video
            <ArrowRight className="h-5 w-5" />
          </PrimaryButton>
        </StickyCta>
      </div>
    );
  }


  /* ----------------------------- SUBMISSION VIEW ----------------------------- */
  return (
    <div className="pb-40">
      <ScreenHeader />

      {/* Tier selection */}
      <section className="px-4 mt-2">
        <div className="mt-5 space-y-2.5">

          {tiers.map(({ id, views, amount, icon: I, label }) => {
            const active = selectedTier === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTier(id)}
                aria-pressed={active}
                className={cn(
                  "w-full text-left rounded-lg p-card flex items-center gap-4 transition-all active:scale-[0.99]",
                  active
                    ? "bg-card ring-2 ring-accent shadow-glow"
                    : "bg-card ring-1 ring-border/60 hover:ring-border",
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
                    {views}
                  </Heading>
                  <Text variant="caption" className={cn("mt-0.5 block", active ? "text-accent" : "text-muted-foreground")}>
                    {label}
                  </Text>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <Text variant="caption" className={cn(active ? "text-accent/80" : "text-muted-foreground")}>
                      Reward
                    </Text>
                    <Text variant="cardTitle" as="p" className={cn("tabular-nums", active ? "text-accent" : "text-foreground")}>
                      ৳{amount}
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
          {/* Group 1 — Channel & video */}
          <FieldGroup title="Channel & video" first>
            <FieldInput
              label="Video URL"
              icon={<Link2 className="h-[18px] w-[18px]" />}
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <FieldInput
              label="YouTube channel name"
              icon={<Youtube className="h-[18px] w-[18px]" />}
              placeholder="Your channel name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </FieldGroup>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <FileField
              label="Channel logo"
              hint="PNG or JPG"
              icon={<ImageIcon className="h-5 w-5" />}
              file={logoFile}
              onChange={setLogoFile}
            />
            <FileField
              label="Analytics screenshot"
              hint="Show view count"
              icon={<BarChart3 className="h-5 w-5" />}
              file={analyticsFile}
              onChange={setAnalyticsFile}
            />
          </div>
        </div>
      </section>



      {/* Sticky CTA */}
      <StickyCta>
        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
          {canSubmit ? (
            <>
              Submit for review · ৳{tier.amount}
              <ArrowRight className="h-5 w-5 transition-transform group-active:translate-x-1" />
            </>
          ) : (
            <>Complete all fields to submit</>
          )}
        </PrimaryButton>
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
}: {
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <Text variant="label" className="text-slate-700 mb-1.5 block">
        {label}
      </Text>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-slate-900 text-input placeholder:text-slate-400 focus:ring-2 focus:ring-accent focus:bg-white focus:outline-none transition-all"
        />
      </div>
    </label>
  );
}


function FileField({
  label,
  hint,
  icon,
  file,
  onChange,
}: {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

  return (
    <div className="block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative w-full aspect-square rounded-lg overflow-hidden transition-all active:scale-[0.98] text-left group",
          file
            ? "ring-2 ring-accent shadow-glow"
            : "ring-1 ring-dashed ring-slate-300 hover:ring-accent/60 bg-slate-50",
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
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

