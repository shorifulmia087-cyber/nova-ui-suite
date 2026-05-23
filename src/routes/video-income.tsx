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
    return (
      <div className="pb-40">
        <ScreenHeader title="Submission status" />

        <section className="px-5">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-card shadow-navy">
            <span aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-12 h-44 w-44 rounded-full bg-primary-foreground/10 blur-3xl" />

            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-glow">
                <Check className="h-7 w-7" strokeWidth={2.6} />
              </div>
              <div className="min-w-0">
                <Text variant="caption" case="title" className="text-primary-foreground/70">
                  Status
                </Text>
                <Heading variant="cardTitle" case="sentence" className="text-primary-foreground mt-1">
                  Submission received
                </Heading>
              </div>
            </div>

            <div className="relative mt-6 rounded-2xl bg-primary-foreground/10 ring-1 ring-primary-foreground/15 backdrop-blur p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Text variant="caption" className="text-primary-foreground/70">
                  Selected tier
                </Text>
                <Text variant="label" as="p" className="text-primary-foreground mt-1 truncate">
                  {tier.views}
                </Text>
              </div>
              <div className="text-right shrink-0">
                <Text variant="caption" className="text-primary-foreground/70">
                  Reward
                </Text>
                <Text variant="cardTitle" as="p" className="text-accent tabular-nums mt-1">
                  ৳{tier.amount}
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-5 mt-8">
          <SectionEyebrow>Process</SectionEyebrow>
          <Heading variant="sectionTitle" case="sentence" className="text-foreground mt-1">
            Review & payment
          </Heading>
          <Text variant="bodySecondary" as="p" className="mt-1">
            Your video is verified before the reward is credited
          </Text>

          <ol className="relative mt-5 space-y-3">
            <span
              aria-hidden
              className="absolute left-[31px] top-7 bottom-7 w-px bg-gradient-to-b from-accent via-accent/30 to-border"
            />
            {timeline.map(({ icon: I, title, sub, eta }, idx) => {
              const active = idx === 0;
              return (
                <li
                  key={title}
                  className="relative bg-card rounded-2xl shadow-card ring-1 ring-border/60 p-card flex items-start gap-4"
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ring-1",
                      active
                        ? "bg-accent text-accent-foreground ring-accent/30 shadow-glow"
                        : "bg-muted text-muted-foreground ring-border",
                    )}
                  >
                    <I className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-3">
                      <Heading variant="cardTitle" case="sentence" className="text-foreground">
                        {title}
                      </Heading>
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center px-2.5 py-1 rounded-full",
                          active ? "bg-accent/15" : "bg-muted",
                        )}
                      >
                        <Text variant="caption" className={cn(active ? "text-accent" : "text-muted-foreground")}>
                          {eta}
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
          </ol>
        </section>

        {/* Note */}
        <section className="px-5 mt-6">
          <div className="rounded-2xl bg-muted/50 ring-1 ring-border/60 p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-card text-accent flex items-center justify-center shrink-0 shadow-card">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <Heading variant="cardTitle" case="sentence" className="text-foreground">
                Verified payouts only
              </Heading>
              <Text variant="bodySecondary" as="p" className="mt-1">
                Views are cross-checked against YouTube Studio analytics.
                Submissions with fake views or bot traffic are rejected.
              </Text>
            </div>
          </div>
        </section>

        {/* Sticky CTA */}
        <StickyCta>
          <PrimaryButton onClick={reset}>
            Submit a new video
            <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
          </PrimaryButton>
        </StickyCta>
      </div>
    );
  }

  /* ----------------------------- SUBMISSION VIEW ----------------------------- */
  return (
    <div className="pb-40">
      <ScreenHeader title="Earn from videos" />

      {/* Tier selection */}
      <section className="px-5 mt-2">

        <SectionEyebrow>Step 01</SectionEyebrow>
        <div className="flex items-end justify-between gap-3 mt-1">
          <Heading variant="sectionTitle" case="sentence" className="text-foreground">
            Choose your tier
          </Heading>
          <Text variant="caption">{tiers.length} options</Text>
        </div>
        <Text variant="bodySecondary" as="p" className="mt-1">
          Select the tier that matches your video's current view count
        </Text>

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
                  "w-full text-left rounded-2xl p-card flex items-center gap-4 transition-all active:scale-[0.99]",
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
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-1.5 px-1">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
          <Text variant="caption">Verified against YouTube Studio analytics</Text>
        </div>
      </section>

      {/* Submission form */}
      <section className="px-5 mt-8">
        <SectionEyebrow>Step 02</SectionEyebrow>
        <Heading variant="sectionTitle" case="sentence" className="text-foreground mt-1">
          Submission details
        </Heading>
        <Text variant="bodySecondary" as="p" className="mt-1">
          Provide accurate info — the reward is released after verification
        </Text>

        <div className="mt-4 rounded-3xl bg-card ring-1 ring-border/60 shadow-card p-card">
          {/* Group 1 — Channel & video */}
          <FieldGroup title="Channel & video">
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

          {/* Group 2 — Verification uploads */}
          <FieldGroup title="Verification uploads">
            <FileField
              label="Channel logo"
              hint="PNG or JPG, square preferred"
              icon={<ImageIcon className="h-[18px] w-[18px]" />}
              file={logoFile}
              onChange={setLogoFile}
            />
            <FileField
              label="YT Studio analytics screenshot"
              hint="Must clearly show the view count"
              icon={<BarChart3 className="h-[18px] w-[18px]" />}
              file={analyticsFile}
              onChange={setAnalyticsFile}
            />
          </FieldGroup>
        </div>
      </section>



      {/* Sticky CTA */}
      <StickyCta>
        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
          {canSubmit ? (
            <>
              Submit for review · ৳{tier.amount}
              <ArrowRight className="h-5 w-5 transition-transform group-active:translate-x-1" strokeWidth={2.4} />
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


function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <Text variant="caption" case="title" className="text-muted-foreground ml-1">
        {title}
      </Text>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

function StickyCta({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pt-6 pb-3 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
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
        "group relative w-full flex items-center justify-center gap-2 h-14 rounded-2xl transition-all",
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
      <Text variant="label" className="text-foreground mb-1.5 ml-1 block">
        {label}
      </Text>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-card ring-1 ring-border/60 text-foreground text-input placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
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
      <Text variant="label" className="text-foreground mb-1.5 ml-1 block">
        {label}
      </Text>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full rounded-xl bg-card ring-1 p-card flex items-center gap-3 transition-all active:scale-[0.99] text-left",
          file
            ? "ring-accent/40 bg-accent/5"
            : "ring-border/60 hover:ring-border",
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt=""
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-border/60 shrink-0"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <Text variant="label" as="p" className="text-foreground truncate">
                {file.name}
              </Text>
              <Text variant="caption">{(file.size / 1024).toFixed(0)} KB · ready</Text>
            </>
          ) : (
            <>
              <Text variant="label" as="p" className="text-foreground">
                Tap to upload
              </Text>
              {hint && <Text variant="caption">{hint}</Text>}
            </>
          )}
        </div>
        {file ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="h-9 w-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </span>
        ) : (
          <span className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Upload className="h-4 w-4" />
          </span>
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
