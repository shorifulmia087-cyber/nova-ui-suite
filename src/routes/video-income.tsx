import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Upload, PlayCircle, CheckCircle2, Coins } from "lucide-react";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Heading, Text } from "@/lib/typography";

export const Route = createFileRoute("/video-income")({
  head: () => ({
    meta: [
      { title: "ভিডিও বানিয়ে ইনকাম — Ness" },
      { name: "description", content: "ভিডিও তৈরি করে সহজেই আয় করুন। প্রতিটি অনুমোদিত ভিডিওর জন্য বোনাস পান।" },
      { property: "og:title", content: "ভিডিও বানিয়ে ইনকাম — Ness" },
      { property: "og:description", content: "ভিডিও তৈরি করে সহজেই আয় করুন।" },
    ],
  }),
  component: VideoIncomePage,
});

function VideoIncomePage() {
  return (
    <div className="pb-24">
      <ScreenHeader title="ভিডিও বানিয়ে ইনকাম" />

      {/* Hero card */}
      <div className="px-4">
        <div className="rounded-2xl bg-primary text-primary-foreground p-5 shadow-navy">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[color:var(--accent)]/20 text-[color:var(--accent)] flex items-center justify-center">
              <Sparkles className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <Heading variant="cardTitle" case="sentence" className="text-primary-foreground leading-tight">
                আজই শুরু করুন
              </Heading>
              <Text variant="caption" className="text-primary-foreground/80">
                প্রতিটি অনুমোদিত ভিডিওতে ৳১০ পর্যন্ত
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 mt-5">
        <div className="bg-card rounded-2xl shadow-card px-2 pt-3 pb-4">
          <div className="px-3">
            <Heading variant="sectionTitle" case="sentence" className="text-foreground leading-tight">
              কিভাবে কাজ করে
            </Heading>
            <div className="mt-2 h-px bg-border/70" />
          </div>
          <div className="pt-3 px-2 space-y-2">
            {[
              { icon: PlayCircle, title: "ভিডিও তৈরি করুন", subtitle: "নির্দেশনা অনুযায়ী ছোট ভিডিও বানান" },
              { icon: Upload, title: "জমা দিন", subtitle: "অ্যাপে আপলোড করে সাবমিট করুন" },
              { icon: CheckCircle2, title: "রিভিউ", subtitle: "টিম ভিডিও যাচাই করবে" },
              { icon: Coins, title: "ইনকাম পান", subtitle: "অনুমোদিত হলে বোনাস ব্যালেন্সে যোগ" },
            ].map(({ icon: I, title, subtitle }, idx) => (
              <div
                key={title}
                className="rounded-2xl bg-background ring-1 ring-border/60 p-3 flex items-start gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
                  <I className="h-[20px] w-[20px]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Heading variant="cardTitle" case="sentence" className="text-foreground leading-tight text-[14px]">
                      {title}
                    </Heading>
                  </div>
                  <Text variant="caption" className="text-muted-foreground leading-snug mt-0.5">
                    {subtitle}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rates */}
      <div className="px-4 mt-5">
        <div className="bg-card rounded-2xl shadow-card px-2 pt-3 pb-4">
          <div className="px-3">
            <Heading variant="sectionTitle" case="sentence" className="text-foreground leading-tight">
              ইনকাম রেট
            </Heading>
            <div className="mt-2 h-px bg-border/70" />
          </div>
          <div className="pt-3 px-2 grid grid-cols-2 gap-2">
            {[
              { label: "সাধারণ ভিডিও", amount: "৳৫" },
              { label: "প্রিমিয়াম ভিডিও", amount: "৳১০" },
              { label: "বিশেষ টপিক", amount: "৳১৫" },
              { label: "ভাইরাল বোনাস", amount: "৳৫০" },
            ].map((r) => (
              <div key={r.label} className="rounded-2xl bg-background ring-1 ring-border/60 p-3">
                <Text variant="caption" className="text-muted-foreground">
                  {r.label}
                </Text>
                <p className="mt-1 text-[18px] font-bold text-[color:var(--accent)] tabular-nums leading-none">
                  {r.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 mt-5">
        <Link
          to="/tasks"
          className="flex items-center justify-center h-12 rounded-2xl bg-[color:var(--accent)] text-accent-foreground font-bold text-[15px] shadow-card active:scale-[0.98] transition-transform"
        >
          ভিডিও জমা দিন
        </Link>
      </div>
    </div>
  );
}
