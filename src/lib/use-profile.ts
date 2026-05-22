import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type Profile = {
  id: string;
  full_name: string | null;
  mobile_number: string | null;
  email: string | null;
  referral_code: string | null;
  referred_by: string | null;
  main_balance: number;
  dp_balance: number;
  total_withdrawal_balance: number;
  is_verified: boolean;
  is_active: boolean;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile(data as Profile | null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, loading };
}
