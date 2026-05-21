
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile_number text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  referral_code text NOT NULL UNIQUE,
  referred_by text,
  main_balance numeric(18,2) NOT NULL DEFAULT 0,
  dp_balance numeric(18,2) NOT NULL DEFAULT 0,
  total_withdrawal_balance numeric(18,2) NOT NULL DEFAULT 0,
  is_deleted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mobile_format CHECK (mobile_number ~ '^[0-9]{10,15}$'),
  CONSTRAINT full_name_len CHECK (char_length(full_name) BETWEEN 2 AND 100),
  CONSTRAINT referral_code_format CHECK (referral_code ~ '^[A-Z0-9]{6,12}$')
);

CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id AND is_deleted = false);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id AND is_deleted = false)
  WITH CHECK (auth.uid() = id);

-- Lock down sensitive financial fields: prevent direct user updates to balances/status
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = NEW.id AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.main_balance := OLD.main_balance;
    NEW.dp_balance := OLD.dp_balance;
    NEW.total_withdrawal_balance := OLD.total_withdrawal_balance;
    NEW.is_verified := OLD.is_verified;
    NEW.is_active := OLD.is_active;
    NEW.is_deleted := OLD.is_deleted;
    NEW.referral_code := OLD.referral_code;
    NEW.referred_by := OLD.referred_by;
    NEW.email := OLD.email;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- Auto-create profile on signup using metadata from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_mobile text;
  v_referral text;
  v_referred_by text;
BEGIN
  v_full_name := NEW.raw_user_meta_data ->> 'full_name';
  v_mobile := NEW.raw_user_meta_data ->> 'mobile_number';
  v_referral := NEW.raw_user_meta_data ->> 'referral_code';
  v_referred_by := NULLIF(NEW.raw_user_meta_data ->> 'referred_by', '');

  INSERT INTO public.profiles (id, full_name, mobile_number, email, referral_code, referred_by)
  VALUES (NEW.id, v_full_name, v_mobile, NEW.email, v_referral, v_referred_by);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Rate limit table for signup attempts
CREATE TABLE public.signup_attempts (
  id bigserial PRIMARY KEY,
  ip text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signup_attempts_ip_time ON public.signup_attempts(ip, created_at DESC);
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;
-- no policies: only service role accesses it
