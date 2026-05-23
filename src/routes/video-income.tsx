import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, type ChangeEvent } from "react";
import {
  Sparkles,
  PlayCircle,
  Upload,
  CheckCircle2,
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
          "Earn rewards based on your YouTube video views. From 500+ to 5000+ views, each tier pays differently.",
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
  { id: "t1", views: "500+ views", amount: 100, icon: Eye, label: "Entry level" },
  { id: "t2", views: "1,000+ views", amount: 250, icon: PlayCircle, label: "Popular" },
  { id: "t3", views: "2,000+ views", amount: 500, icon: Sparkles, label: "Advanced" },
  { id: "t4", views: "3,000+ views", amount: 700, icon: BarChart3, label: "Pro tier" },
  { id: "t5", views: "5,000+ views", amount: 1500, icon: Flame, label: "Expert" },
];

const timeline = [
  {
    icon: Upload,
    title: "Submitted",
    sub: "Your video has been received",
    eta: "Now",
  },
  {
    icon: Clock,
    title: "Under review",
    sub: "Our team is verifying views and content",
    eta: "12–24 hours",
  },
  {
    icon: ShieldCheck,
    title: "Approval",
    sub: "Approved after successful verification",
    eta: "24–48 hours",
  },
  {
    icon: Wallet,
    title: "Added to balance",
    sub: "Reward will be added to your main balance",
    eta: "48–72 hours",
  },
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

  if (submitted) {
    return (
      <div className="pb-44">
        <ScreenHeader title="Submission status" />

        {/* Success hero */}
        <section className="px-5">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-6 shadow-navy">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[color:var(--accent)]/30 blur-3xl"
            />
            <div className="relative flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[color:var(--accent)] text-accent-foreground flex items-center justify-center shadow-glow">
                <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <Text
                  variant="caption"
                  case="upper"
                  className="text-primary-foreground/80"
                >
                  Submitted
                </Text>
                <Heading
                  variant="cardTitle"
                  case="sentence"
                  className="text-primary-foreground mt-0.5"
                >
                  Submission successful
                </Heading>
              </div>
            </div>

            <div className="relative mt-5 rounded-2xl bg-primary-foreground/10 ring-1 ring-primary-foreground/15 backdrop-blur p-4 flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-primary-foreground/70">
                  Selected tier
                </Text>
                <Text
                  variant="label"
                  as="p"
                  className="text-primary-foreground mt-0.5"
                >
                  {tier.views}
                </Text>
              </div>
              <div className="text-right">
                <Text variant="caption" className="text-primary-foreground/70">
                  Reward
                </Text>
                <Text
                  variant="cardTitle"
                  as="p"
                  className="text-[color:var(--accent)] tabular-nums mt-0.5"
                >
                  ৳{tier.amount}
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-5 mt-6">
          <Heading variant="sectionTitle" case="sentence" className="text-foreground">
            Review & payment process
          </Heading>
          <Text variant="bodySecondary" as="p" className="text-muted-foreground mt-1">
            Your video will be verified and the reward added to your balance
          </Text>

          <ol className="relative mt-4 space-y-3">
            <span
              aria-hidden
              className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-[color:var(--accent)] via-[color:var(--accent)]/30 to-border"
            />
            {timeline.map(({ icon: I, title, sub, eta }, idx) => {
              const active = idx === 0;
              return (
                <li
                  key={title}
                  className="relative bg-card rounded-2xl shadow-card ring-1 ring-border/60 p-4 flex items-start gap-3"
                >
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "h-[54px] w-[54px] rounded-2xl flex items-center justify-center ring-1",
                        active
                          ? "bg-[color:var(--accent)] text-accent-foreground ring-[color:var(--accent)]/30 shadow-glow"
                          : "bg-muted text-muted-foreground ring-border",
                      )}
                    >
                      <I className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-card">
                      <Text variant="caption" className="tabular-nums leading-none">
                        {idx + 1}
                      </Text>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <Heading
                        variant="cardTitle"
                        case="sentence"
                        className="text-foreground"
                      >
                        {title}
                      </Heading>
                      <span
                        className={cn(
                          "shrink-0 px-2 py-0.5 rounded-full",
                          active
                            ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Text variant="caption">{eta}</Text>
                      </span>
                    </div>
                    <Text
                      variant="bodySecondary"
                      as="p"
                      className="text-muted-foreground mt-1"
                    >
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
          <div className="rounded-2xl bg-muted/40 ring-1 ring-border/60 p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-card text-[color:var(--accent)] flex items-center justify-center shrink-0 shadow-card">
              <Sparkles className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <Heading
                variant="cardTitle"
                case="sentence"
                className="text-foreground"
              >
                Please note
              </Heading>
              <Text
                variant="bodySecondary"
                as="p"
                className="text-muted-foreground mt-1"
              >
                Views are verified against YouTube Studio analytics. Submissions
                with fake views or bot traffic will be rejected.
              </Text>
            </div>
          </div>
        </section>

        {/* Sticky CTA */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pt-6 pb-2 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
          <button
            onClick={reset}
            className="group relative w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-[color:var(--accent)] text-accent-foreground shadow-glow active:scale-[0.98] transition-transform"
          >
            <Text variant="button">Submit a new video</Text>
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-44">
      <ScreenHeader title="Earn from videos" />

      {/* Hero */}
      <section className="px-5">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-6 shadow-navy">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[color:var(--accent)]/30 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl"
          />

          <div className="relative flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 backdrop-blur px-2.5 py-1 ring-1 ring-primary-foreground/15">
              <Youtube className="h-3 w-3 text-[color:var(--accent)]" strokeWidth={2.5} />
              <Text
                variant="caption"
                case="upper"
                className="text-primary-foreground/90"
              >
                YouTube Views Reward
              </Text>
            </span>
          </div>

          <div className="relative mt-4">
            <Heading
              variant="screenTitle"
              case="sentence"
              className="text-primary-foreground"
            >
              Earn up to
              <br />
              <span className="text-[color:var(--accent)]">৳1,500</span> per video
            </Heading>
            <Text
              variant="bodySecondary"
              as="p"
              className="text-primary-foreground/75 mt-2"
            >
              The more views your YouTube video gets, the bigger the reward.
            </Text>
          </div>
        </div>
      </section>

      {/* Tier selection */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <Heading variant="sectionTitle" case="sentence" className="text-foreground">
            Choose your tier
          </Heading>
          <Text variant="caption" className="text-muted-foreground">
            Select one
          </Text>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--accent)]" strokeWidth={2.5} />
          <Text variant="caption" className="text-muted-foreground">
            Verified via YouTube Studio analytics
          </Text>
        </div>

        <div className="mt-4 space-y-3">
          {tiers.map(({ id, views, amount, icon: I, label }) => {
            const active = selectedTier === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTier(id)}
                className={cn(
                  "w-full text-left bg-card rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] relative",
                  active
                    ? "border-2 border-[color:var(--accent)] shadow-lg shadow-[color:var(--accent)]/10"
                    : "border border-border/60 hover:border-border",
                )}
              >
                {active && (
                  <span className="absolute -top-2 -right-2 bg-[color:var(--accent)] text-accent-foreground p-1 rounded-full shadow-md">
                    <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <div
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    active
                      ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <I className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <Heading
                    variant="cardTitle"
                    case="sentence"
                    className="text-foreground"
                  >
                    {views}
                  </Heading>
                  <Text
                    variant="caption"
                    className={cn(
                      "mt-0.5 block",
                      active ? "text-[color:var(--accent)]" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </Text>
                </div>
                <div className="text-right shrink-0">
                  <Text
                    variant="cardTitle"
                    as="p"
                    className="text-[color:var(--accent)] tabular-nums"
                  >
                    ৳{amount}
                  </Text>
                  <Text
                    variant="caption"
                    case="upper"
                    className="text-muted-foreground block"
                  >
                    Reward
                  </Text>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Submission form */}
      <section className="px-5 mt-7">
        <Heading variant="sectionTitle" case="sentence" className="text-foreground">
          Submission details
        </Heading>
        <Text variant="bodySecondary" as="p" className="text-muted-foreground mt-1">
          Provide accurate info — reward is released after verification
        </Text>

        <div className="mt-4 space-y-3">
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
          <FileField
            label="Channel logo"
            hint="PNG / JPG"
            icon={<ImageIcon className="h-[18px] w-[18px]" />}
            file={logoFile}
            onChange={setLogoFile}
          />
          <FileField
            label="YT Studio analytics screenshot"
            hint="A screenshot that clearly shows the view count"
            icon={<BarChart3 className="h-[18px] w-[18px]" />}
            file={analyticsFile}
            onChange={setAnalyticsFile}
          />
        </div>
      </section>

      {/* Summary */}
      <section className="px-5 mt-6">
        <div className="rounded-2xl bg-card ring-1 ring-border/60 shadow-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
              <Coins className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <Text variant="caption" className="text-muted-foreground">
                You will receive
              </Text>
              <Text
                variant="label"
                as="p"
                className="text-foreground mt-0.5 truncate"
              >
                {tier.views}
              </Text>
            </div>
          </div>
          <Text
            variant="sectionTitle"
            as="p"
            className="text-[color:var(--accent)] tabular-nums"
          >
            ৳{tier.amount}
          </Text>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pt-6 pb-2 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "group relative w-full flex items-center justify-center gap-2 h-14 rounded-2xl transition-all",
            canSubmit
              ? "bg-[color:var(--accent)] text-accent-foreground shadow-glow active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <Text variant="button">Submit</Text>
          <ArrowRight
            className="h-5 w-5 transition-transform group-active:translate-x-1"
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
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
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-card ring-1 ring-border/60 text-foreground text-input placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-[color:var(--accent)] focus:outline-none transition-all"
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
          "w-full rounded-xl bg-card ring-1 p-3 flex items-center gap-3 transition-all active:scale-[0.99] text-left",
          file
            ? "ring-[color:var(--accent)]/40 bg-[color:var(--accent)]/5"
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
          <div className="h-12 w-12 rounded-lg bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <Text variant="label" as="p" className="text-foreground truncate">
                {file.name}
              </Text>
              <Text variant="caption" className="text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </Text>
            </>
          ) : (
            <>
              <Text variant="label" as="p" className="text-foreground">
                Upload file
              </Text>
              {hint && (
                <Text variant="caption" className="text-muted-foreground">
                  {hint}
                </Text>
              )}
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
            className="h-8 w-8 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </span>
        ) : (
          <span className="h-8 w-8 rounded-lg bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
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
