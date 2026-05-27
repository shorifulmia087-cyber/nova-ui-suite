
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text NOT NULL,
  address text NOT NULL,
  min_amount numeric NOT NULL CHECK (min_amount >= 0),
  max_amount numeric NOT NULL CHECK (max_amount >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (max_amount >= min_amount)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active methods"
  ON public.payment_methods FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert methods"
  ON public.payment_methods FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update methods"
  ON public.payment_methods FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete methods"
  ON public.payment_methods FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-method-logos', 'payment-method-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read payment method logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-method-logos');

CREATE POLICY "Admins upload payment method logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-method-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update payment method logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-method-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete payment method logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-method-logos' AND public.has_role(auth.uid(), 'admin'));
