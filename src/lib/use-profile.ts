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

// Module-level cache so navigating between pages doesn't refetch
// and cause a flicker. Keyed by user id.
const cache = new Map<string, Profile | null>();
const inflight = new Map<string, Promise<Profile | null>>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const existing = inflight.get(userId);
  if (existing) return existing;
  const p = Promise.resolve(
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
  ).then(({ data }) => {
    const profile = (data as Profile | null) ?? null;
    cache.set(userId, profile);
    inflight.delete(userId);
    notify();
    return profile;
  });
  inflight.set(userId, p);
  return p;
}

export function useProfile() {
  const { user } = useAuth();
  const cached = user ? cache.get(user.id) ?? null : null;
  const [profile, setProfile] = useState<Profile | null>(cached);
  const [loading, setLoading] = useState(user ? !cache.has(user.id) : false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const update = () => {
      setProfile(cache.get(user.id) ?? null);
      setLoading(false);
    };
    listeners.add(update);

    if (cache.has(user.id)) {
      setProfile(cache.get(user.id) ?? null);
      setLoading(false);
    } else {
      setLoading(true);
      fetchProfile(user.id);
    }

    return () => {
      listeners.delete(update);
    };
  }, [user]);

  return {
    profile,
    loading,
    refreshProfile: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
  };
}

// Force-refresh the cached profile from the server. UI updates instantly
// via listeners — no flicker because old data stays visible until new arrives.
export function invalidateProfile(userId: string) {
  inflight.delete(userId);
  return fetchProfile(userId);
}

// Optimistically patch the cached profile and notify all subscribers.
// Use right after a successful mutation for zero-latency UI updates.
export function setCachedProfile(userId: string, patch: Partial<Profile>) {
  const current = cache.get(userId);
  if (!current) return;
  cache.set(userId, { ...current, ...patch });
  notify();
}
