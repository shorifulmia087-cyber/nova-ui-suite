import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  PlayCircle,
  Upload,
  CheckCircle2,
  Coins,
  TrendingUp,
  Flame,
  ArrowRight,
  Video,
} from "lucide-react";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Heading, Text } from "@/lib/typography";

export const Route = createFileRoute("/video-income")({
  head: () => ({
    meta: [
      { title: "ভিডিও বানিয়ে ইনকাম — Ness" },
      {
        name: "description",
        content:
          "ভিডিও তৈরি করে সহজেই আয় করুন। প্রতিটি অনুমোদিত ভিডিওর জন্য বোনাস পান।",
      },
      { property: "og:title", content: "ভিডিও বানিয়ে ইনকাম — Ness" },
      {
        property: "og:description",
        content: "ভিডিও তৈরি করে সহজেই আয় করুন।",
      },
    ],
  }),
  component: VideoIncomePage,
});

const steps = [
  {
    icon: PlayCircle,
    title: "ভিডিও তৈরি করুন",
    subtitle: "নির্দেশনা অনুযায়ী ছোট ভিডিও বানান",
  },
  {
    icon: Upload,
    title: "জমা দিন",
    subtitle: "অ্যাপে আপলোড করে সাবমিট করুন",
  },
  {
    icon: CheckCircle2,
    title: "রিভিউ",
    subtitle: "টিম ভিডিও যাচাই করবে",
  },
  {
    icon: Coins,
    title: "ইনকাম পান",
    subtitle: "অনুমোদিত হলে বোনাস ব্যালেন্সে যোগ",
  },
];

const rates = [
  {
    label: "সাধারণ ভিডিও",
    sub: "সাধারণ টপিকে ছোট ভিডিও",
    amount: "৳৫",
    icon: Video,
  },
  {
    label: "প্রিমিয়াম ভিডিও",
    sub: "উন্নত মানের কন্টেন্ট",
    amount: "৳১০",
    icon: Sparkles,
  },
  {
    label: "বিশেষ টপিক",
    sub: "নির্ধারিত বিশেষ বিষয়",
    amount: "৳১৫",
    icon: TrendingUp,
  },
  {
    label: "ভাইরাল বোনাস",
    sub: "১০K+ ভিউ পেলে এক্সট্রা",
    amount: "৳৫০",
    icon: Flame,
  },
];

function VideoIncomePage() {
  return (
    <div className="pb-28">
      <ScreenHeader title="ভিডিও বানিয়ে ইনকাম" />

      {/* Hero — premium gradient with stat */}
      <section className="px-5">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-6 shadow-navy">
          {/* decorative glow */}
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
              <Sparkles className="h-3 w-3 text-[color:var(--accent)]" strokeWidth={2.5} />
              <Text
                variant="caption"
                case="upper"
                className="text-[10px] font-bold tracking-wider text-primary-foreground/90"
              >
                Earn with videos
              </Text>
            </span>
          </div>

          <div className="relative mt-4">
            <Heading
              variant="screenTitle"
              case="sentence"
              className="text-primary-foreground leading-tight"
            >
              ছোট ভিডিও বানিয়ে
              <br />
              <span className="text-[color:var(--accent)]">৳৫০ পর্যন্ত</span> পান
            </Heading>
            <Text
              variant="caption"
              className="text-primary-foreground/75 mt-2 leading-relaxed"
            >
              প্রতিটি অনুমোদিত ভিডিওতে বোনাস। ভাইরাল হলে এক্সট্রা ইনকাম।
            </Text>
          </div>

          {/* Mini stats */}
          <div className="relative mt-5 grid grid-cols-3 gap-2">
            {[
              { k: "শুরু রেট", v: "৳৫" },
              { k: "প্রিমিয়াম", v: "৳১৫" },
              { k: "ভাইরাল", v: "৳৫০" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-2xl bg-primary-foreground/10 ring-1 ring-primary-foreground/15 px-3 py-2.5 backdrop-blur"
              >
                <Text
                  variant="caption"
                  className="text-primary-foreground/70 text-[10px] leading-none"
                >
                  {s.k}
                </Text>
                <p className="mt-1.5 text-[16px] font-extrabold text-primary-foreground tabular-nums leading-none">
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — vertical timeline */}
      <section className="px-5 mt-6">
        <div className="flex items-end justify-between">
          <Heading
            variant="sectionTitle"
            case="sentence"
            className="text-foreground"
          >
            কিভাবে কাজ করে
          </Heading>
          <Text variant="caption" className="text-muted-foreground">
            ৪টি ধাপ
          </Text>
        </div>

        <ol className="relative mt-4 space-y-3">
          {/* connector line */}
          <span
            aria-hidden
            className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-[color:var(--accent)]/40 via-border to-transparent"
          />
          {steps.map(({ icon: I, title, subtitle }, idx) => (
            <li
              key={title}
              className="relative bg-card rounded-2xl shadow-card ring-1 ring-border/60 p-4 flex items-start gap-3"
            >
              <div className="relative shrink-0">
                <div className="h-[54px] w-[54px] rounded-2xl bg-gradient-to-br from-[color:var(--accent)]/15 to-[color:var(--accent)]/5 text-[color:var(--accent)] flex items-center justify-center ring-1 ring-[color:var(--accent)]/20">
                  <I className="h-6 w-6" strokeWidth={2} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center shadow-card tabular-nums">
                  {idx + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <Heading
                  variant="cardTitle"
                  case="sentence"
                  className="text-foreground leading-tight text-[15px]"
                >
                  {title}
                </Heading>
                <Text
                  variant="caption"
                  className="text-muted-foreground leading-snug mt-1"
                >
                  {subtitle}
                </Text>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Income rates — single column list */}
      <section className="px-5 mt-7">
        <div className="flex items-end justify-between">
          <Heading
            variant="sectionTitle"
            case="sentence"
            className="text-foreground"
          >
            ইনকাম রেট
          </Heading>
          <Text variant="caption" className="text-muted-foreground">
            প্রতি ভিডিও
          </Text>
        </div>

        <div className="mt-4 space-y-2.5">
          {rates.map(({ label, sub, amount, icon: I }) => (
            <div
              key={label}
              className="group bg-card rounded-2xl shadow-card ring-1 ring-border/60 p-4 flex items-center gap-3 active:scale-[0.99] transition-transform"
            >
              <div className="h-11 w-11 rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
                <I className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <Heading
                  variant="cardTitle"
                  case="sentence"
                  className="text-foreground leading-tight text-[14px]"
                >
                  {label}
                </Heading>
                <Text
                  variant="caption"
                  className="text-muted-foreground leading-snug mt-0.5"
                >
                  {sub}
                </Text>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[20px] font-extrabold text-[color:var(--accent)] tabular-nums leading-none">
                  {amount}
                </p>
                <Text
                  variant="caption"
                  case="upper"
                  className="text-[9px] font-bold text-muted-foreground tracking-wider mt-1"
                >
                  Bonus
                </Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Note card */}
      <section className="px-5 mt-6">
        <div className="rounded-2xl bg-muted/40 ring-1 ring-border/60 p-4">
          <div className="flex items-start gap-3">
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
                নিজের তৈরি অরিজিনাল কন্টেন্ট