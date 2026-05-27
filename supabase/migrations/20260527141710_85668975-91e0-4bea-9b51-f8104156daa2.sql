
-- 1) Add txn_id_length to payment_methods (default 10, range 4-32)
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS txn_id_length integer NOT NULL DEFAULT 10;

ALTER TABLE public.payment_methods
  DROP CONSTRAINT IF EXISTS payment_methods_txn_id_length_check;
ALTER TABLE public.payment_methods
  ADD CONSTRAINT payment_methods_txn_id_length_check
  CHECK (txn_id_length BETWEEN 4 AND 32);

-- Sensible defaults for known methods
UPDATE public.payment_methods SET txn_id_length = 10 WHERE lower(name) LIKE '%bkash%';
UPDATE public.payment_methods SET txn_id_length = 8  WHERE lower(name) LIKE '%nagad%';

-- 2) verification_payments table
CREATE TABLE IF NOT EXISTS public.verification_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payment_method_id uuid NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  txn_id text NOT NULL,
  sender_number text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Globally unique transaction ID (case-insensitive) — same txn ID can't be reused at all
CREATE UNIQUE INDEX IF NOT EXISTS verification_payments_txn_id_unique
  ON public.verification_payments (upper(txn_id));

CREATE INDEX IF NOT EXISTS verification_payments_user_idx
  ON public.verification_payments (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.verification_payments TO authenticated;
GRANT ALL ON public.verification_payments TO service_role;

ALTER TABLE public.verification_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own verification payments"
  ON public.verification_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own verification payments"
  ON public.verification_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update verification payments"
  ON public.verification_payments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_verification_payments_updated_at
  BEFORE UPDATE ON public.verification_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
