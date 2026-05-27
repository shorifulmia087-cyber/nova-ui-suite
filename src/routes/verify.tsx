import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card } from "@/components/mobile/Primitives";
import { Heading, Text } from "@/lib/typography";
import { listActivePaymentMethods, submitVerificationPayment, type PaymentMethodRow } from "@/lib/payment-methods.functions";
import { AppInput } from "@/components/mobile/AppInput";
import { toast } from "sonner";
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
  Copy,
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
  const submitPaymentFn = useServerFn(submitVerificationPayment);
  const [step, setStep] = useState<Step>("benefits");
  const [agreed, setAgreed] = useState(false);
  const [methods, setMethods] = useState<PaymentMethodRow[]>([]);
  const [method, setMethod] = useState<string>("");
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [serverTxnError, setServerTxnError] = useState<string>("");

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

  const selectedMethod = methods.find((m) => m.id === method);
  const requiredLen = selectedMethod?.txn_id_length ?? 0;

  const trimmedTxn = txnId.trim().toUpperCase();
  const trimmedSender = senderNumber.trim();
  const txnFormatError = !trimmedTxn
    ? ""
    : !selectedMethod
    ? ""
    : trimmedTxn.length !== requiredLen
    ? `${selectedMethod.name}-এর Transaction ID ঠিক ${requiredLen} ক্যারেক্টারের হতে হবে`
    : !/^[A-Z0-9]+$/.test(trimmedTxn)
    ? "শুধু A-Z ও 0-9 ব্যবহার করুন"
    : "";
  const txnError = serverTxnError || txnFormatError;
  const senderError = !trimmedSender
    ? ""
    : !/^01[3-9]\d{8}$/.test(trimmedSender)
    ? "১১ ডিজিটের বৈধ মোবাইল নাম্বার দিন (01XXXXXXXXX)"
    : "";
  const canPay =
    !!selectedMethod &&
    requiredLen > 0 &&
    trimmedTxn.length === requiredLen &&
    /^[A-Z0-9]+$/.test(trimmedTxn) &&
    /^01[3-9]\d{8}$/.test(trimmedSender);

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(
      () => toast.success(`${label} কপি হয়েছে`),
      () => toast.error("কপি করা যায়নি"),
    );
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPay || !selectedMethod) return;
    setServerTxnError("");
    setStep("processing");
    try {
      const res = await submitPaymentFn({
        data: {
          payment_method_id: selectedMethod.id,
          txn_id: trimmedTxn,
          sender_number: trimmedSender,
          amount: VERIFY_FEE,
        },
      });
      if (!res.success) {
        if ("field" in res && res.field === "txn_id") {
          setServerTxnError(res.error);
          toast.error(res.error);
        } else {
          toast.error(("error" in res && res.error) || "ভেরিফিকেশন সম্পূর্ণ করা যায়নি");
        }
        setStep("payment");
        return;
      }
      localStorage.setItem("nessVerified", "1");
      window.dispatchEvent(new Event("ness:verified"));
      setStep("verified");
    } catch (err: any) {
      toast.error(err?.message ?? "সার্ভার এরর। আবার চেষ্টা করুন।");
      setStep("payment");
    }
  };

  if (step === "verified") {
    return (
      <div>
        <ScreenHeader title="Verification" />
        <div className="px-4">
          <Card className="p-card text-center border-0 bg-gradient-soft elevation-2">
            <div className="mx-auto h-20 w-20 rounded-full bg-[color:var(--success)]/12 flex items-center justify-center mb-4 ring-8 ring-[color:var(--success)]/5">
              <CheckCircle2 className="h-10 w-10 text-[color:var(--success)]" />
            </div>
            <Heading variant="sectionTitle" case="sentence" className="flex items-center justify-center gap-1.5">
              You're verified
              <ShieldCheck className="h-5 w-5 text-[color:var(--accent)]" />
            </Heading>
            <Text variant="bodySecondary" className="mt-1.5 text-muted-foreground">
              Your account is now verified. Enjoy all premium features.
            </Text>
            <div className="mt-6 grid gap-2">
              <button
                onClick={() => navigate({ to: "/profile" })}
                className="text-button h-12 rounded-lg bg-primary text-primary-foreground elevation-2 hover:elevation-3 active:scale-[0.98] transition-all"
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
                className="text-caption h-10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
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
    const instructionSteps = selected
      ? [
          { label: <>আপনার <b className="font-semibold">{selected.name}</b> মোবাইল অ্যাপে যান।</> },
          { label: <><b className="font-semibold">Send Money</b> অপশনটি সিলেক্ট করুন।</> },
          {
            label: <>নাম্বার দিন: <b className="font-semibold tabular-nums">{selected.address}</b></>,
            action: { value: selected.address, label: "নাম্বার" },
          },
          {
            label: <>অ্যামাউন্ট দিন: <b className="font-semibold tabular-nums">{VERIFY_FEE} BDT</b></>,
            action: { value: String(VERIFY_FEE), label: "অ্যামাউন্ট" },
          },
          { label: <>আপনার <b className="font-semibold">{selected.name}</b> পিন দিয়ে কনফার্ম করুন।</> },
          { label: <>নিচের ঘরে <b className="font-semibold">Transaction ID</b> বসিয়ে <b className="font-semibold">Verify</b> বাটনে চাপ দিন।</> },
        ]
      : [];

    return (
      <div>
        <ScreenHeader title="Payment" />
        <form onSubmit={submitPayment} className="px-4 pb-8 space-y-4">
          {/* Method selection */}
          <Card className="p-card border-0 space-y-3 elevation-1">
            <div className="flex items-center justify-between">
              <Heading variant="cardTitle" case="sentence" className="text-foreground">
                পেমেন্ট মেথড
              </Heading>
              <Text variant="caption" className="text-muted-foreground">
                একটি বেছে নিন
              </Text>
            </div>
            {methodsLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : methods.length === 0 ? (
              <Text variant="caption" className="text-muted-foreground text-center py-3">
                কোনো পেমেন্ট মেথড পাওয়া যায়নি। পরে আবার চেষ্টা করুন।
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
                      className={`group relative rounded-lg overflow-hidden flex flex-col items-center transition-all duration-300 active:scale-[0.97] border-[1.5px] ${
                        active
                          ? "bg-gradient-to-b from-[color:color-mix(in_oklab,var(--accent)_8%,var(--card))] to-card elevation-2 border-[color:var(--accent)]"
                          : "bg-card elevation-1 border-border hover:border-[color:color-mix(in_oklab,var(--accent)_35%,var(--border))]"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/50 to-transparent"
                        />
                      )}

                      <div className="w-full pt-3 pb-2 flex items-center justify-center">
                        <div className="relative h-14 w-14 rounded-md bg-white flex items-center justify-center p-2 overflow-hidden ring-1 ring-border/60">
                          <img
                            src={m.logo_url}
                            alt={m.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>

                      <div className={`w-full px-2 py-2 border-t transition-colors duration-300 ${
                        active
                          ? "border-[color:var(--accent)]/15 bg-[color:var(--accent)]/5"
                          : "border-border bg-muted/30"
                      }`}>
                        <Text
                          variant="label"
                          className={`leading-none text-center line-clamp-1 transition-colors duration-300 ${
                            active ? "text-[color:var(--accent)]" : "text-foreground"
                          }`}
                        >
                          {m.name}
                        </Text>
                      </div>

                      {active && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[color:var(--accent)] flex items-center justify-center elevation-1 ring-2 ring-card">
                          <Check className="h-2.5 w-2.5 text-accent-foreground" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {selected && (
            <>
              {/* Amount */}
              <Card className="p-card border-0 text-center bg-gradient-soft elevation-1">
                <Text variant="caption" case="upper" className="text-muted-foreground tracking-widest">
                  One-time fee
                </Text>
                <Heading variant="display" case="none" className="text-foreground tabular-nums mt-1">
                  ৳{VERIFY_FEE}
                </Heading>
                <Text variant="bodySecondary" className="text-muted-foreground mt-1">
                  ভেরিফিকেশন ফি · লাইফটাইম
                </Text>
              </Card>

              {/* Step-by-step instructions (Bangla) */}
              <Card className="p-card border-0 space-y-4 elevation-1">
                <Heading variant="cardTitle" case="sentence" className="text-foreground">
                  কীভাবে টাকা পাঠাবেন
                </Heading>

                <ol className="space-y-3">
                  {instructionSteps.map((s, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="h-7 w-7 shrink-0 rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center">
                        <Text variant="caption" as="span" className="text-[color:var(--accent)] font-semibold tabular-nums">
                          {i + 1}
                        </Text>
                      </span>
                      <Text variant="body" className="text-foreground leading-relaxed flex-1">
                        {s.label}
                      </Text>
                      {s.action && (
                        <button
                          type="button"
                          onClick={() => copy(s.action!.value, s.action!.label)}
                          className="inline-flex items-center gap-1 rounded-md bg-[color:var(--accent)]/10 text-[color:var(--accent)] px-2.5 py-1.5 hover:bg-[color:var(--accent)]/15 active:scale-95 transition-all"
                        >
                          <Copy className="h-4 w-4" />
                          <Text variant="caption" as="span" className="text-[color:var(--accent)] font-medium">
                            কপি
                          </Text>
                        </button>
                      )}
                    </li>
                  ))}
                </ol>

                <div className="pt-2 space-y-3 border-t border-border">
                  <div className="pt-2">
                    <AppInput
                      label="Sender Number"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      inputMode="numeric"
                      placeholder="01XXXXXXXXX"
                      error={senderError || undefined}
                      hint={!senderError ? "যে নাম্বার থেকে পাঠাচ্ছেন সেটি দিন" : undefined}
                      className="tracking-wider"
                    />
                  </div>

                  <div>
                    <AppInput
                      label="Transaction ID"
                      value={txnId}
                      onChange={(e) => {
                        setServerTxnError("");
                        setTxnId(
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, selected.txn_id_length),
                        );
                      }}
                      maxLength={selected.txn_id_length}
                      placeholder="Transaction ID লিখুন"
                      error={txnError || undefined}
                      className="tracking-wider"
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          <div className="grid grid-cols-[auto_1fr] gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep("benefits")}
              disabled={step === "processing"}
              className="text-button h-12 px-5 rounded-lg bg-muted text-foreground hover:bg-muted/80 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!canPay || step === "processing"}
              className="text-button h-12 rounded-lg bg-primary text-primary-foreground elevation-2 hover:elevation-3 active:scale-[0.98] transition-all disabled:opacity-40 disabled:elevation-0 inline-flex items-center justify-center gap-2"
            >
              {step === "processing" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> ভেরিফাই হচ্ছে…</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Verify Payment</>
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
        <Card className="p-card text-center border-0 bg-gradient-soft elevation-2">
          <div className="mx-auto h-20 w-20 rounded-full bg-[color:var(--accent)]/12 flex items-center justify-center mb-4 ring-8 ring-[color:var(--accent)]/5">
            <ShieldCheck className="h-10 w-10 text-[color:var(--accent)]" />
          </div>
          <Heading variant="sectionTitle" case="sentence" className="text-foreground">
            Verify your account
          </Heading>
          <Text variant="bodySecondary" className="mt-1.5 text-muted-foreground max-w-xs mx-auto">
            Unlock the full power of Ness with a verified account.
          </Text>
        </Card>

        {/* Benefits list */}
        <Card className="p-card border-0 space-y-1 elevation-1">
          <Heading variant="cardTitle" case="sentence" className="text-foreground mb-3">
            What you'll get
          </Heading>
          <div className="space-y-3">
            {BENEFITS.map(({ title }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="relative h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-[color:var(--success)] to-[color:color-mix(in_oklab,var(--success)_70%,#000)] text-white flex items-center justify-center elevation-1 ring-4 ring-[color:var(--success)]/10">
                  <Check className="h-4 w-4" />
                </div>
                <Text variant="label" className="text-foreground leading-tight flex-1">
                  {title}
                </Text>
              </div>
            ))}

          </div>
        </Card>

        {/* Fee notice */}
        <Card className="relative overflow-hidden p-card border-0 elevation-2 bg-gradient-to-br from-[color:color-mix(in_oklab,var(--accent)_8%,var(--card))] via-card to-[color:color-mix(in_oklab,var(--primary)_6%,var(--card))]">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[color:var(--accent)]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-[color:var(--primary)]/8 blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[color:var(--accent)] to-[color:color-mix(in_oklab,var(--accent)_65%,#000)] flex items-center justify-center elevation-2 ring-4 ring-[color:var(--accent)]/10">
                <Crown className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <Text variant="caption" case="upper" className="text-muted-foreground tracking-widest">
                  One-time fee
                </Text>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <Heading variant="sectionTitle" case="none" className="text-foreground tabular-nums leading-none">
                    ৳{VERIFY_FEE}
                  </Heading>
                  <Text variant="caption" className="text-muted-foreground">BDT</Text>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-pill bg-[color:var(--success)]/12 px-2.5 py-1">
                <CheckCircle2 className="h-3 w-3 text-[color:var(--success)]" />
                <Text variant="caption" as="span" className="text-[color:var(--success)] font-medium">Lifetime</Text>
              </span>
              <Text variant="caption" className="text-muted-foreground text-right leading-tight max-w-[140px]">
                No renewals or hidden charges
              </Text>
            </div>
          </div>
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
          className="text-button w-full h-12 rounded-lg bg-primary text-primary-foreground elevation-2 hover:elevation-3 active:scale-[0.98] transition-all disabled:opacity-40 disabled:elevation-0 inline-flex items-center justify-center gap-2"
        >
          Continue to payment
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

