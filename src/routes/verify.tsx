import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card } from "@/components/mobile/Primitives";
import { ShieldCheck, Upload, Camera, CheckCircle2, IdCard, Loader2 } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify identity — Ness" }, { name: "description", content: "Submit your NID to verify your account." }] }),
  component: Verify,
});

type Status = "idle" | "submitting" | "verified";

function Verify() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (localStorage.getItem("nessVerified") === "1") setStatus("verified");
  }, []);

  const canSubmit =
    fullName.trim().length > 2 &&
    nidNumber.trim().length >= 6 &&
    frontFile &&
    backFile &&
    selfieFile &&
    status === "idle";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setTimeout(() => {
      localStorage.setItem("nessVerified", "1");
      window.dispatchEvent(new Event("ness:verified"));
      setStatus("verified");
    }, 1400);
  };

  if (status === "verified") {
    return (
      <div>
        <ScreenHeader title="Verification" />
        <div className="px-5">
          <Card className="p-6 text-center border-0 bg-gradient-soft">
            <div className="mx-auto h-16 w-16 rounded-full bg-[color:var(--success)]/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-9 w-9 text-[color:var(--success)]" />
            </div>
            <h2 className="text-section-title flex items-center justify-center gap-1.5">
              You're verified
              <ShieldCheck className="h-5 w-5 text-[color:var(--accent)]" />
            </h2>
            <p className="text-body-secondary mt-1">
              Your NID has been submitted and your account is marked as verified.
            </p>
            <div className="mt-5 grid gap-2">
              <button
                onClick={() => navigate({ to: "/profile" })}
                className="text-button h-12 rounded-md bg-gradient-brand text-primary-foreground shadow-glow active:scale-[0.98] transition"
              >
                Back to profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("nessVerified");
                  window.dispatchEvent(new Event("ness:verified"));
                  setStatus("idle");
                  setFullName(""); setNidNumber("");
                  setFrontFile(null); setBackFile(null); setSelfieFile(null);
                }}
                className="text-caption h-10 rounded-md"
              >
                Reset (testing)
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="Verify identity" />
      <form onSubmit={submit} className="px-5 pb-8 space-y-5">
        <Card className="p-4 border-0 bg-gradient-soft flex items-start gap-3">
          <div className="h-10 w-10 rounded-md bg-[color:var(--accent)]/15 flex items-center justify-center text-[color:var(--accent)]">
            <IdCard className="h-5 w-5" />
          </div>
          <div className="text-body-secondary leading-relaxed">
            Submit your National ID details to unlock full account features. This is a UI demo — no data is sent.
          </div>
        </Card>

        <Card className="p-4 border-0 space-y-3">
          <Field label="Full legal name">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As shown on your NID"
              className="text-input w-full h-11 rounded-md bg-muted px-3 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </Field>
          <Field label="NID number">
            <input
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="e.g. 1234567890"
              className="text-input w-full h-11 rounded-md bg-muted px-3 tracking-wider outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </Field>
        </Card>

        <Card className="p-4 border-0 space-y-3">
          <p className="text-eyebrow">Documents</p>
          <FileBox label="NID front" file={frontFile} onPick={setFrontFile} icon={Upload} />
          <FileBox label="NID back" file={backFile} onPick={setBackFile} icon={Upload} />
          <FileBox label="Selfie with NID" file={selfieFile} onPick={setSelfieFile} icon={Camera} capture />
        </Card>

        <button
          type="submit"
          disabled={!canSubmit}
          className="text-button w-full h-12 rounded-md bg-gradient-brand text-primary-foreground shadow-glow active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none inline-flex items-center justify-center gap-2"
        >
          {status === "submitting" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : (
            <><ShieldCheck className="h-4 w-4" /> Submit for verification</>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-label mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function FileBox({
  label, file, onPick, icon: Icon, capture,
}: {
  label: string; file: File | null; onPick: (f: File | null) => void;
  icon: React.ComponentType<{ className?: string }>; capture?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-md bg-muted/60 cursor-pointer hover:bg-muted transition">
      <div className={`h-10 w-10 rounded-md flex items-center justify-center ${file ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-background text-muted-foreground"}`}>
        {file ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label">{label}</p>
        <p className="text-caption truncate">
          {file ? file.name : "Tap to upload"}
        </p>
      </div>
      <input
        type="file"
        accept="image/*"
        {...(capture ? { capture: "user" as const } : {})}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
