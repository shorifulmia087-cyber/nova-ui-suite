
-- Tiers table
CREATE TABLE public.video_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_views integer NOT NULL,
  reward_amount numeric NOT NULL,
  label text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active tiers"
  ON public.video_tiers FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert tiers"
  ON public.video_tiers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tiers"
  ON public.video_tiers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete tiers"
  ON public.video_tiers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_video_tiers_updated_at
  BEFORE UPDATE ON public.video_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Submissions table
CREATE TYPE public.video_submission_status AS ENUM ('pending', 'approved', 'rejected', 'paid');

CREATE TABLE public.video_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier_id uuid NOT NULL REFERENCES public.video_tiers(id),
  video_url text NOT NULL,
  channel_name text NOT NULL,
  channel_logo_url text NOT NULL,
  analytics_url text NOT NULL,
  status public.video_submission_status NOT NULL DEFAULT 'pending',
  reward_amount numeric NOT NULL,
  admin_note text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_video_submissions_user ON public.video_submissions(user_id, created_at DESC);
CREATE INDEX idx_video_submissions_status ON public.video_submissions(status, created_at DESC);

ALTER TABLE public.video_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own submissions"
  ON public.video_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own submissions"
  ON public.video_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update submissions"
  ON public.video_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_video_submissions_updated_at
  BEFORE UPDATE ON public.video_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('video-uploads', 'video-uploads', false);

CREATE POLICY "Users upload own video files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'video-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own video files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'video-uploads' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Users delete own video files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'video-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed default tiers
INSERT INTO public.video_tiers (min_views, reward_amount, label, sort_order) VALUES
  (500, 100, '৫০০+ ভিউ', 1),
  (1000, 250, '১০০০+ ভিউ', 2),
  (2000, 500, '২০০০+ ভিউ', 3),
  (3000, 700, '৩০০০+ ভিউ', 4),
  (5000, 1500, '৫০০০+ ভিউ', 5);
