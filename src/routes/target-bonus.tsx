import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Target, Trophy, Coins, CheckCircle2 } from "lucide-react";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Heading, Text } from "@/lib/typography";

export const Route = createFileRoute("/target-bonus")({
  head: () => ({
    meta: [
      { title: "Target Bonus — Ness" },
      { name: "description", content: "টার্গেট পূরণ করে আকর্ষণীয় বোনাস জিতে নিন।" },
      { property: "og:title", content: "Target Bonus — Ness" },
      { property: "og:description", content: "টার্গেট পূরণ করে আকর্ষণীয় বোনাস জিতে নিন।" },
    ],
  }),
  component: TargetBonusPage,
});

const tiers = [
  { target: "১০ রেফার", bonus: "৳১০০", note: "শুরুর টার্গেট" },
  { target: "৫০ রেফার", bonus: "৳৬০০", note: "মাঝারি লেভেল" },
  { target: "১০০ রেফার", bonus: "৳১,৫০০", note: "অ্যাডভান্স" },
  { target: "৫০০ রেফার", bonus: "৳৮,০০০", note: "প্রো লেভেল" },
];

function TargetBonusPage() {
  return (
    <div className="pb-24">
      <ScreenHeader />

      {/* Hero */}
      <div className="px-4">
        <div className="rounded-lg bg-primary text-primary-foreground p-card shadow-navy">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-[color:var(--accent)]/20 text-[color:var(--accent)] flex items-center justify-center">
              <Gift className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <Heading variant="cardTitle" case="sentence" className="text-primary-foreground leading-tight">
                টার্গেট পূরণ করুন
              </Heading>
              <Text variant="caption" className="text-primary-foreground/80">
                বড় বোনাস জিতে নিন প্রতিটি মাইলফলকে
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 mt-5">
        <div className="bg-card rounded-lg shadow-card px-2 pt-3 pb-4">
          <div className="px-3">
            <Heading variant="sectionTitle" case="sentence" className="text-foreground leading-tight">
              কিভাবে কাজ করে
            </Heading>
            <div className="mt-2 h-px bg-border/70" />
          </div>
          <div className="pt-3 px-2 space-y-2">
            {[
              { icon: Target, title: "টার্গেট বেছে নিন", subtitle: "আপনার পছন্দের মাইলফলক সিলেক্ট করুন" },
              { icon: CheckCircle2, title: "টার্গেট পূরণ করুন", subtitle: "নির্ধারিত সময়ের মধ্যে সম্পন্ন করুন" },
              { icon: Trophy, title: "বোনাস ক্লেইম", subtitle: "অটো ভেরিফাইড হলে বোনাস যোগ হবে" },
              { icon: Coins, title: "উইথড্র করুন", subtitle: "ব্যালেন্স থেকে যেকোনো সময় তুলুন" },
            ].map(({ icon: I, title, subtitle }, idx) => (
              <div
                key={title}
                className="rounded-lg bg-background ring-1 ring-border/60 p-card flex items-start gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
                  <I className="h-[20px] w-[20px]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Text variant="caption" className="text-muted-foreground tabular-nums font-semibold">
                      {String(idx + 1).padStart(2, "0")}
                    </Text>
                    <Heading variant="cardTitle" case="sentence" className="text-foreground leading-tight">
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

      {/* Tiers */}
      <div className="px-4 mt-5">
        <div className="bg-card rounded-lg shadow-card px-2 pt-3 pb-4">
          <div className="px-3">
            <Heading variant="sectionTitle" case="sentence" className="text-foreground leading-tight">
              বোনাস টায়ার
            </Heading>
            <div className="mt-2 h-px bg-border/70" />
          </div>
          <div className="pt-3 px-2 space-y-2">
            {tiers.map((t) => (
              <div
                key={t.target}
                className="rounded-lg bg-background ring-1 ring-border/60 p-card flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center shrink-0">
                  <Trophy className="h-[20px] w-[20px]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <Heading variant="cardTitle" case="sentence" className="text-foreground leading-tight">
                    {t.target}
                  </Heading>
                  <Text variant="caption" className="text-muted-foreground leading-snug mt-0.5">
                    {t.note}
                  </Text>
                </div>
                <Text variant="cardTitle" as="p" className="text-[color:var(--accent)] tabular-nums leading-none">
                  {t.bonus}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 mt-5">
        <Link
          to="/refer"
          className="text-button flex items-center justify-center h-12 rounded-lg bg-[color:var(--accent)] text-accent-foreground shadow-card active:scale-[0.98] transition-transform"
        >
          এখনই শুরু করুন
        </Link>
      </div>
    </div>
  );
}
