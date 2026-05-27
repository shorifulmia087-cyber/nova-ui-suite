import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card, ActionButton } from "@/components/mobile/Primitives";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListPaymentMethods,
  adminCreatePaymentMethod,
  adminUpdatePaymentMethod,
  adminDeletePaymentMethod,
  type PaymentMethodRow,
} from "@/lib/payment-methods.functions";
import { isCurrentUserAdmin } from "@/lib/tasks.functions";
import { useAuth } from "@/lib/auth-context";
import { Trash2, Plus, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/payment-methods")({
  head: () => ({ meta: [{ title: "Admin · Payment methods — Ness" }] }),
  component: AdminPaymentMethods,
});

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_LOGO = 2 * 1024 * 1024; // 2MB

type FormErrors = Partial<Record<"name" | "logo" | "address" | "min" | "max", string>>;

function AdminPaymentMethods() {
  const { user, loading: authLoading } = useAuth();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const fetchAll = useServerFn(adminListPaymentMethods);
  const createFn = useServerFn(adminCreatePaymentMethod);
  const updateFn = useServerFn(adminUpdatePaymentMethod);
  const deleteFn = useServerFn(adminDeletePaymentMethod);

  const [authorized, setAuthorized] = useState<"checking" | "yes" | "no">("checking");
  const [rows, setRows] = useState<PaymentMethodRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return setAuthorized("no");
    checkAdmin()
      .then((r) => setAuthorized(r.isAdmin ? "yes" : "no"))
      .catch(() => setAuthorized("no"));
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (authorized === "yes") reload();
  }, [authorized]);

  async function reload() {
    try {
      setLoading(true);
      const data = await fetchAll();
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function handlePickLogo(f: File | null) {
    setErrors((p) => ({ ...p, logo: undefined }));
    if (!f) {
      setLogoFile(null);
      setLogoPreview("");
      return;
    }
    if (!ACCEPTED.includes(f.type)) {
      setErrors((p) => ({ ...p, logo: "PNG, JPG, WEBP, or SVG only" }));
      return;
    }
    if (f.size > MAX_LOGO) {
      setErrors((p) => ({ ...p, logo: "Max 2MB" }));
      return;
    }
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  }

  function validate(): { ok: boolean; min: number; max: number } {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!address.trim()) next.address = "Address/number is required";
    if (!logoFile) next.logo = "Logo is required";
    const min = parseFloat(minAmt);
    const max = parseFloat(maxAmt);
    if (!isFinite(min) || min < 0) next.min = "Enter a valid minimum";
    if (!isFinite(max) || max < 0) next.max = "Enter a valid maximum";
    if (isFinite(min) && isFinite(max) && max < min) next.max = "Max must be ≥ min";
    setErrors(next);
    return { ok: Object.keys(next).length === 0, min, max };
  }

  async function uploadLogo(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "png";
    const path = `${user!.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("payment-method-logos")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("payment-method-logos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (!v.ok) return;
    setCreating(true);
    try {
      setUploading(true);
      const logo_url = await uploadLogo(logoFile!);
      setUploading(false);
      await createFn({
        data: {
          name: name.trim(),
          logo_url,
          address: address.trim(),
          min_amount: v.min,
          max_amount: v.max,
          is_active: true,
        },
      });
      toast.success("Method added");
      setName("");
      setAddress("");
      setMinAmt("");
      setMaxAmt("");
      setLogoFile(null);
      setLogoPreview("");
      setErrors({});
      if (fileRef.current) fileRef.current.value = "";
      await reload();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create");
    } finally {
      setCreating(false);
      setUploading(false);
    }
  }

  async function toggleActive(row: PaymentMethodRow) {
    try {
      await updateFn({ data: { id: row.id, is_active: !row.is_active } });
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  }

  async function remove(row: PaymentMethodRow) {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try {
      await deleteFn({ data: { id: row.id } });
      toast.success("Deleted");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  if (authorized === "checking" || authLoading) {
    return (
      <div>
        <ScreenHeader title="Admin · Payment methods" />
        <div className="px-4">
          <Card className="p-card text-center text-caption text-muted-foreground">Checking access…</Card>
        </div>
      </div>
    );
  }

  if (authorized === "no") {
    return (
      <div>
        <ScreenHeader title="Admin · Payment methods" />
        <div className="px-4">
          <Card className="p-card text-center">
            <p className="text-label mb-3">Admin access required.</p>
            <Link to="/"><ActionButton variant="outline">Go home</ActionButton></Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="Admin · Payment methods" />

      <div className="px-4">
        <Card className="p-card">
          <h2 className="text-section-title mb-3 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New method
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label>Method name</Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="bKash, Nagad, …"
                maxLength={80}
                className={errors.name ? "ring-1 ring-destructive" : ""}
              />
              {errors.name && <p className="text-caption text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label>Logo</Label>
              <div className="mt-1 flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED.join(",")}
                  onChange={(e) => handlePickLogo(e.target.files?.[0] ?? null)}
                  className="text-caption flex-1"
                />
              </div>
              {errors.logo && <p className="text-caption text-destructive mt-1">{errors.logo}</p>}
            </div>

            <div>
              <Label>Address / Number</Label>
              <Input
                value={address}
                onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: undefined })); }}
                placeholder="01XXXXXXXXX"
                maxLength={200}
                className={errors.address ? "ring-1 ring-destructive" : ""}
              />
              {errors.address && <p className="text-caption text-destructive mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min amount (৳)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={minAmt}
                  onChange={(e) => { setMinAmt(e.target.value); setErrors((p) => ({ ...p, min: undefined })); }}
                  className={errors.min ? "ring-1 ring-destructive" : ""}
                />
                {errors.min && <p className="text-caption text-destructive mt-1">{errors.min}</p>}
              </div>
              <div>
                <Label>Max amount (৳)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={maxAmt}
                  onChange={(e) => { setMaxAmt(e.target.value); setErrors((p) => ({ ...p, max: undefined })); }}
                  className={errors.max ? "ring-1 ring-destructive" : ""}
                />
                {errors.max && <p className="text-caption text-destructive mt-1">{errors.max}</p>}
              </div>
            </div>

            <ActionButton variant="brand" disabled={creating}>
              {creating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploading ? "Uploading…" : "Saving…"}
                </span>
              ) : "Add method"}
            </ActionButton>
          </form>
        </Card>
      </div>

      <div className="px-4 mt-5 space-y-2">
        <h2 className="text-section-title">All methods</h2>
        {loading ? (
          <Card className="p-card text-center text-caption text-muted-foreground">Loading…</Card>
        ) : rows.length === 0 ? (
          <Card className="p-card text-center text-caption text-muted-foreground">No methods yet.</Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id} className="p-card">
              <div className="flex items-start gap-3">
                <img
                  src={r.logo_url}
                  alt={r.name}
                  className="h-12 w-12 rounded-lg object-cover bg-muted shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-label truncate">{r.name}</p>
                  <p className="text-caption text-muted-foreground truncate">{r.address}</p>
                  <p className="text-caption text-muted-foreground mt-0.5">
                    ৳{r.min_amount} – ৳{r.max_amount}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Label className="text-caption">{r.is_active ? "On" : "Off"}</Label>
                    <Switch checked={r.is_active} onCheckedChange={() => toggleActive(r)} />
                  </div>
                  <button
                    onClick={() => remove(r)}
                    className="text-destructive hover:bg-destructive/10 p-1.5 rounded"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
