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
      { title: "ভিডিও বানিয়ে ইনকাম — Ness" },
      {
        name: "description",
        content:
          "YouTube ভিডিওর ভিউ অনুযায়ী ইনকাম করুন। ৫০০+ ভিউ থেকে ৫০০০+ ভিউ পর্যন্ত আলাদা রিওয়ার্ড।",
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
};

const tiers: Tier[] = [
  { id: "t1", views: "৫০০+ ভিউ", amount: 100, icon: Eye },
  { id: "t2", views: "১০০০+ ভিউ", amount: 250, icon: PlayCircle },
  { id: "t3", views: "২০০০+ ভিউ", amount: 500, icon: Sparkles },
  { id: "t4", views: "৩০০০+ ভিউ", amount: 700, icon: BarChart3 },
  { id: "t5", views: "৫০০০+ ভিউ", amount: 1500, icon: Flame },
];

const timeline = [
  {
    icon: Upload,
    title: "সাবমিট সম্পন্ন",
    sub: "আপনার ভিডিও জমা হয়েছে",
    eta: "এখন",
  },
  {
    icon: Clock,
    title: "রিভিউ চলছে",
    sub: "টিম ভিউ ও কন্টেন্ট যাচাই করছে",
    eta: "১২–২৪ ঘন্টা",
  },
  {
    icon: ShieldCheck,
    title: "অনুমোদন",
    sub: "যাচাই শেষে অনুমোদন দেওয়া হবে",
    eta: "২৪–৪৮ ঘন্টা",
  },
  {
    icon: Wallet,
    title: "ব্যালেন্সে যোগ",
    sub: "রিওয়ার্ড মূল ব্যালেন্সে যোগ হবে",
    eta: "৪৮–৭২ ঘন্টা",
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
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    setSubmitted(true);
    toast.success("সফলভাবে জমা হয়েছে");
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
      <div className="pb-28">
        <ScreenHeader title="সাবমিশন স্ট্যাটাস" />

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
                  className="text-[10px] font-bold tracking-wider text-primary-foreground/80"
                >
                  Submitted
                </Text>
                <Heading
                  variant="cardTitle"
                  case="sentence"
                  className="text-primary-foreground text-[18px] leading-tight mt-0.5"
                >
                  জমা সফল হয়েছে
                </Heading>
              </div>
            </div>

            <div className="relative mt-5 rounded-2xl bg-primary-foreground/10 ring-1 ring-primary-foreground/15 backdrop-blur p-4 flex items-center justify-between">
              <div>
                <Text
                  variant="caption"
                  className="text-primary-foreground/70 text-[11px]"
                >
                  নির্বাচিত টিয়ার
                </Text>
                <p className="text-primary-foreground font-bold text-[15px] mt-0.5">
                  {tier.views}
                </p>
              </div>
              <div className="text-right">
                <Text
                  variant="caption"
                  className="text-primary-foreground/70 text-[11px]"
                >
                  রিওয়ার্ড
                </Text>
                <p className="text-[color:var(--accent)] font-extrabold text-[20px] tabular-nums leading-none mt-1">
                  ৳{tier.amount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-5 mt-6">
          <Heading
            variant="sectionTitle"
            case="sentence"
            className="text-foreground"
          >
            রিভিউ ও পেমেন্ট প্রসেস
          </Heading>
          <Text variant="caption" className="text-muted-foreground mt-1 block">
            আপনার ভিডিও যাচাই হয়ে ব্যালেন্সে যোগ হবে
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
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center shadow-card tabular-nums">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <Heading
                        variant="cardTitle"
                        case="sentence"
                        className="text-foreground leading-tight text-[15px]"
                      >
                        {title}
                      </Heading>
                      <Text
                        variant="caption"
                        className={cn(
                          "shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full",
                          active
                            ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {eta}
                      </Text>
                    </div>
                    <Text
                      variant="caption"
                      className="text-muted-foreground leading-snug mt-1"
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
                className="text-foreground leading-tight text-[14px]"
              >
                মনে রাখুন
              </Heading>
              <Text
                variant="caption"
                className="text-muted-foreground leading-snug mt-1"
              >
                ভিউ যাচাই YouTube Studio অ্যানালিটিক্স অনুযায়ী হবে। ভুয়া ভিউ বা
                বট ট্রাফিক ধরা পড়লে সাবমিশন বাতিল হবে।
              </Text>
            </div>
          </div>
        </section>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-5 pt-3 bg-gradient-to-t from-background via-background to-transparent z-40">
          <button
            onClick={reset}
            className="group relative w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-[color:var(--accent)] text-accent-foreground font-bold text-[15px] shadow-glow active:scale-[0.98] transition-transform"
          >
            <span>নতুন ভিডিও জমা দিন</span>
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <ScreenHeader title="ভিডিও বানিয়ে ইনকাম" />

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
                className="text-[10px] font-bold tracking-wider text-primary-foreground/90"
              >
                YouTube Views Reward
              </Text>
            </span>
          </div>

          <div className="relative mt-4">
            <Heading
              variant="screenTitle"
              case="sentence"
              className="text-primary-foreground leading-tight"
            >
              ভিউ অনুযায়ী
              <br />
              <span className="text-[color:var(--accent)]">৳১৫০০ পর্যন্ত</span> পান
            </Heading>
            <Text
              variant="caption"
              className="text-primary-foreground/75 mt-2 leading-relaxed"
            >
              YouTube ভিডিওর ভিউ যত বেশি, রিওয়ার্ড তত বড়।
            </Text>
          </div>
        </div>
      </section>

      {/* Tier selection */}
      <section className="px-5 mt-6">
        <div className="flex items-end justify-between">
          <Heading
            variant="sectionTitle"
            case="sentence"
            className="text-foreground"
          >
            আপনার টিয়ার বাছুন
          </Heading>
          <Text variant="caption" className="text-muted-foreground">
            ১টি বাছাই করুন
          </Text>
        </div>

        <div className="mt-4 space-y-2.5">
          {tiers.map(({ id, views, amount, icon: I }) => {
            const active = selectedTier === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTier(id)}
                className={cn(
                  "w-full text-left bg-card rounded-2xl shadow-card p-4 flex items-center gap-3 transition-all active:scale-[0.99] ring-1",
                  active
                    ? "ring-2 ring-[color:var(--accent)] bg-[color:var(--accent)]/5"
                    : "ring-border/60 hover:ring-border",
                )}
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    active
                      ? "bg-[color:var(--accent)] text-accent-foreground"
                      : "bg-[color:var(--accent)]/10 text-[color:var(--accent)]",
                  )}
                >
                  <I className="h-[20px] w-[20px]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <Heading
                    variant="cardTitle"
                    case="sentence"
                    className="text-foreground leading-tight text-[14px]"
                  >
                    {views}
                  </Heading>
                  <Text
                    variant="caption"
                    className="text-muted-foreground leading-snug mt-0.5"
                  >
                    YouTube Studio অ্যানালিটিক্স অনুযায়ী
                  </Text>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[20px] font-extrabold text-[color:var(--accent)] tabular-nums leading-none">
                    ৳{amount}
                  </p>
                  <Text
                    variant="caption"
                    case="upper"
                    className="text-[9px] font-bold text-muted-foreground tracking-wider mt-1"
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
        <Heading
          variant="sectionTitle"
          case="sentence"
          className="text-foreground"
        >
          সাবমিশন তথ্য
        </Heading>
        <Text variant="caption" className="text-muted-foreground mt-1 block">
          সঠিক তথ্য দিন, যাচাইয়ের পর রিওয়ার্ড দেওয়া হবে
        </Text>

        <div className="mt-4 space-y-3">
          <FieldInput
            label="ভিডিও URL"
            icon={<Link2 className="h-[18px] w-[18px]" />}
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <FieldInput
            label="YouTube চ্যানেল নাম"
            icon={<Youtube className="h-[18px] w-[18px]" />}
            placeholder="আপনার চ্যানেলের নাম"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
          <FileField
            label="চ্যানেল লোগো"
            hint="PNG / JPG"
            icon={<ImageIcon className="h-[18px] w-[18px]" />}
            file={logoFile}
            onChange={setLogoFile}
          />
          <FileField
            label="YT Studio অ্যানালিটিক্স স্ক্রিনশট"
            hint="ভিউ-কাউন্ট স্পষ্ট দেখা যায় এমন স্ক্রিনশট"
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
            <div className="h-10 w-10 rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
              <Coins className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <Text
                variant="caption"
                className="text-muted-foreground text-[11px]"
              >
                আপনি পাবেন
              </Text>
              <p className="text-foreground font-bold text-[14px] leading-tight mt-0.5 truncate">
                {tier.views}
              </p>
            </div>
          </div>
          <p className="text-[22px] font-extrabold text-[color:var(--accent)] tabular-nums leading-none">
            ৳{tier.amount}
          </p>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-5 pt-3 bg-gradient-to-t from-background via-background to-transparent z-40">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "group relative w-full flex items-center justify-center gap-2 h-14 rounded-2xl font-bold text-[15px] transition-all",
            canSubmit
              ? "bg-[color:var(--accent)] text-accent-foreground shadow-glow active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <span>সাবমিট করুন</span>
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
      <Text
        variant="caption"
        className="text-foreground font-medium text-[12px] mb-1.5 ml-1 block"
      >
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
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-card ring-1 ring-border/60 text-foreground text-[14px] placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-[color:var(--accent)] focus:outline-none transition-all"
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
      <Text
        variant="caption"
        className="text-foreground font-medium text-[12px] mb-1.5 ml-1 block"
      >
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
              <p className="text-foreground font-medium text-[13px] truncate">
                {file.name}
              </p>
              <Text
                variant="caption"
                className="text-muted-foreground text-[11px]"
              >
                {(file.size / 1024).toFixed(0)} KB
              </Text>
            </>
          ) : (
            <>
              <p className="text-foreground font-medium text-[13px]">
                ফাইল আপলোড করুন
              </p>
              {hint && (
                <Text
                  variant="caption"
                  className="text-muted-foreground text-[11px]"
                >
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
