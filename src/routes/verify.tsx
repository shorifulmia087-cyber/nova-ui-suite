import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card } from "@/components/mobile/Primitives";
import { Heading, Text } from "@/lib/typography";
import { listActivePaymentMethods, type PaymentMethodRow } from "@/lib/payment-methods.functions";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Wallet,
  TrendingUp,
  Gift,
  Headphones,
  Zap,
  Crown,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verification — Ness" },
      { name: "description", content: "Verify your account to unlock all features." },
    ],
  }),
  component: Verify,
});

type Step = "benefits" | "payment" | "processing" | "verified";

const VERIFY_FEE = 250;

const BENEFITS = [
  { icon: Wallet, title: "আনলিমিটেড উইথড্র", desc: "যেকোনো সময় কোনো লিমিট ছাড়াই আপনার আয় উইথড্র করুন।" },
  { icon: TrendingUp, title: "বেশি আয়ের সুযোগ", desc: "টাস্ক ও ভিডিও থেকে ২x পর্যন্ত বেশি আয় করুন।" },
  { icon: Gift, title: "এক্সক্লুসিভ বোনাস", desc: "টার্গেট বোনাস ও বিশেষ রিওয়ার্ড উপভোগ করুন।" },
  { icon: Crown, title: "ভেরিফাইড ব্যাজ", desc: "আপনার প্রোফাইলে ভেরিফাইড ব্যাজ পান।" },
  { icon: Zap, title: "প্রায়োরিটি টাস্ক অ্যাক্সেস", desc: "হাই-পেয়িং টাস্কে সবার আগে অ্যাক্সেস পান।" },
  { icon: Headphones, title: "প্রায়োরিটি সাপোর্ট", desc: "২৪/৭ ডেডিকেটেড কাস্টমার সাপোর্ট।" },
];

const PAYMENT_METHODS = [
  { id: "bkash", name: "bKash", color: "#E2136E", number: "017XXXXXXXX" },
  { id: "nagad", name: "Nagad", color: "#EC1C24", number: "017XXXXXXXX" },
  { id: "rocket", name: "Rocket", color: "#8A1A9B", number: "017XXXXXXXX" },
];

function Verify() {
  const navigate = useNavigate();
  const fetchMethods = useServerFn(listActivePaymentMethods);
  const [step, setStep] = useState<Step>("benefits");
  const [agreed, setAgreed] = useState(false);
  const [methods, setMethods] = useState<PaymentMethodRow[]>([]);
  const [method, setMethod] = useState<string>("");
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");

  useEffect(() => {
    if (localStorage.getItem("nessVerified") === "1") setStep("verified");
  }, []);

  useEffect(() => {
    if (step !== "payment" || methods.length > 0) return;
    setMethodsLoading(true);
    fetchMethods()
      .then((rows) => {
        setMethods(rows);
        if (rows.length > 0) setMethod((curr) => curr || rows[0].id);
      })
      .catch(() => setMethods([]))
      .finally(() => setMethodsLoading(false));
  }, [step]);

  const canPay = txnId.trim().length >= 6 && senderNumber.trim().length >= 9;

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPay) return;
    setStep("processing");
    setTimeout(() => {
      localStorage.setItem("nessVerified", "1");
      window.dispatchEvent(new Event("ness:verified"));
      setStep("verified");
    }, 1400);
  };

  if (step === "verified") {
    return (
      <div>
        <ScreenHeader title="Verification" />
        <div className="px-4">
          <Card className="p-card text-center border-0 bg-gradient-soft">
            <div className="mx-auto h-16 w-16 rounded-full bg-[color:var(--success)]/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-9 w-9 text-[color:var(--success)]" />
            </div>
            <Heading variant="sectionTitle" case="sentence" className="flex items-center justify-center gap-1.5">
              You're verified
              <ShieldCheck className="h-5 w-5 text-[color:var(--accent)]" />
            </Heading>
            <Text variant="bodySecondary" className="mt-1 text-muted-foreground">
              Your account is now verified. Enjoy all premium features.
            </Text>
            <div className="mt-5 grid gap-2">
              <button
                onClick={() => navigate({ to: "/profile" })}
                className="text-button h-12 rounded-lg bg-gradient-brand text-primary-foreground shadow-glow active:scale-[0.98] transition"
              >
                Back to profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("nessVerified");
                  window.dispatchEvent(new Event("ness:verified"));
                  setStep("benefits");
                  setAgreed(false);
                  setTxnId("");
                  setSenderNumber("");
                }}
                className="text-caption h-10 rounded-lg text-muted-foreground"
              >
                Reset (testing)
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "payment" || step === "processing") {
    const selected = methods.find((m) => m.id === method);
    return (
      <div>
        <ScreenHeader title="Payment" />
        <form onSubmit={submitPayment} className="px-4 pb-8 space-y-4">
          {/* Amount summary */}
          <Card className="p-card border-0 bg-gradient-soft text-center">
            <Text variant="caption" case="upper" className="text-muted-foreground">
              Verification Fee
            </Text>
            <Heading variant="display" case="none" className="mt-1 text-foreground">
              ৳{VERIFY_FEE}
            </Heading>
            <Text variant="bodySecondary" className="text-muted-foreground mt-1">
              One-time payment for lifetime access
            </Text>
          </Card>

          {/* Method selection */}
          <Card className="p-card border-0 space-y-3">
            <Heading variant="cardTitle" case="sentence" className="text-foreground">
              Select payment method
            </Heading>
            {methodsLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : methods.length === 0 ? (
              <Text variant="caption" className="text-muted-foreground text-center py-3">
                No payment methods available yet. Please try again later.
              </Text>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {methods.map((m) => {
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`relative rounded-lg p-3 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                        active ? "ring-2 ring-[color:var(--accent)] bg-background" : "bg-muted/60"
                      }`}
                    >
                      <img
                        src={m.logo_url}
                        alt={m.name}
                        className="h-9 w-9 rounded-full object-cover bg-background"
                      />
                      <Text variant="label" className="text-foreground leading-none text-center line-clamp-1">
                        {m.name}
                      </Text>
                      {active && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[color:var(--accent)] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-accent-foreground" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Send instructions */}
          {selected && (
          <Card className="p-card border-0 bg-muted/40 space-y-2">
            <Text variant="label" className="text-foreground">
              Send ৳{VERIFY_FEE} to this {selected.name} number:
            </Text>
            <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5">
              <Text variant="cardTitle" className="tabular-nums text-foreground">
                {selected.address}
              </Text>
              <Text variant="caption" case="upper" className="text-[color:var(--accent)] font-semibold">
                Personal
              </Text>
            </div>
            <Text variant="caption" className="text-muted-foreground">
              Limits: ৳{selected.min_amount} – ৳{selected.max_amount}. After sending, enter the Transaction ID below.
            </Text>
          </Card>
          )}
              <Text variant="caption" case="upper" className="text-[color:var(--accent)] font-semibold">
                Personal
              </Text>
            </div>
            <Text variant="caption" className="text-muted-foreground">
              After sending, enter the Transaction ID below.
            </Text>
          </Card>

          {/* Transaction details */}
          <Card className="p-card border-0 space-y-3">
            <label className="block">
              <Text variant="label" as="span" className="block mb-1.5 text-foreground">
                Your {selected.name} number
              </Text>
              <input
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                className="text-input w-full h-11 rounded-lg bg-muted px-3 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              />
            </label>
            <label className="block">
              <Text variant="label" as="span" className="block mb-1.5 text-foreground">
                Transaction ID
              </Text>
              <input
                value={txnId}
                onChange={(e) => setTxnId(e.target.value.toUpperCase())}
                placeholder="e.g. 9A1B2C3D4E"
                className="text-input w-full h-11 rounded-lg bg-muted px-3 tracking-wider outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              />
            </label>
          </Card>

          <div className="grid grid-cols-[auto_1fr] gap-2">
            <button
              type="button"
              onClick={() => setStep("benefits")}
              disabled={step === "processing"}
              className="text-button h-12 px-5 rounded-lg bg-muted text-foreground active:scale-[0.98] transition disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!canPay || step === "processing"}
              className="text-button h-12 rounded-lg bg-gradient-brand text-primary-foreground shadow-glow active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none inline-flex items-center justify-center gap-2"
            >
              {step === "processing" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Confirm payment</>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 1: Benefits
  return (
    <div>
      <ScreenHeader title="Verification" />
      <div className="px-4 pb-8 space-y-4">
        {/* Hero */}
        <Card className="p-card text-center border-0 bg-gradient-soft">
          <div className="mx-auto h-16 w-16 rounded-full bg-[color:var(--accent)]/15 flex items-center justify-center mb-3">
            <ShieldCheck className="h-9 w-9 text-[color:var(--accent)]" />
          </div>
          <Heading variant="sectionTitle" case="sentence" className="text-foreground">
            Verify your account
          </Heading>
          <Text variant="bodySecondary" className="mt-1 text-muted-foreground">
            Unlock the full power of Ness with a verified account.
          </Text>
        </Card>

        {/* Benefits list */}
        <Card className="p-card border-0 space-y-1">
          <Heading variant="cardTitle" case="sentence" className="text-foreground mb-2">
            What you'll get
          </Heading>
          <div className="space-y-2.5">
            {BENEFITS.map(({ title }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="h-7 w-7 shrink-0 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] flex items-center justify-center">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </div>
                <Text variant="label" className="text-foreground leading-tight flex-1">
                  {title}
                </Text>
              </div>
            ))}
          </div>

        </Card>

        {/* Fee notice */}
        <Card className="p-card border-0 bg-muted/40 flex items-center justify-between">
          <div>
            <Text variant="caption" case="upper" className="text-muted-foreground">
              One-time fee
            </Text>
            <Heading variant="cardTitle" className="text-foreground">
              ৳{VERIFY_FEE}
            </Heading>
          </div>
          <Text variant="caption" className="text-muted-foreground text-right max-w-[55%]">
            Lifetime verification. No renewals or hidden charges.
          </Text>
        </Card>

        {/* Agree */}
        <label className="flex items-start gap-3 px-1 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded accent-[color:var(--accent)]"
          />
          <Text variant="bodySecondary" className="text-foreground leading-snug">
            I agree to the verification terms and the one-time fee.
          </Text>
        </label>

        <button
          type="button"
          onClick={() => setStep("payment")}
          disabled={!agreed}
          style={agreed ? { animation: "attention-wiggle 1.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite, attention-pulse 1.8s ease-in-out infinite" } : undefined}
          className="text-button w-full h-12 rounded-lg bg-gradient-brand text-primary-foreground shadow-glow active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none disabled:animate-none inline-flex items-center justify-center gap-2"
        >
          Continue to payment
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
