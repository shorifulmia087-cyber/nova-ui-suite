import { useSyncExternalStore } from "react";
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

const STORAGE_PREFIX = "ness:profile:";

// Warm the in-memory cache from sessionStorage so that even on a fresh
// page load (or route transition that remounts the component) the cached
// identity fields are available synchronously — no skeleton flash.
function hydrateFromStorage(userId: string): Profile | null {
  if (cache.has(userId)) return cache.get(userId) ?? null;
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Profile;
    cache.set(userId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function persist(userId: string, profile: Profile | null) {
  if (typeof window === "undefined") return;
  try {
    if (profile) sessionStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(profile));
    else sessionStorage.removeItem(STORAGE_PREFIX + userId);
  } catch {
    /* ignore quota errors */
  }
}

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
    persist(userId, profile);
    inflight.delete(userId);
    notify();
    return profile;
  });
  inflight.set(userId, p);
  return p;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useProfile() {
  const { user } = useAuth();

  // Synchronous read — same reference between renders when cache hasn't
  // changed, so React skips re-rendering consumers that didn't actually
  // change.
  const profile = useSyncExternalStore(
    subscribe,
    () => (user ? hydrateFromStorage(user.id) : null),
    () => null,
  );

  // Kick off a background fetch the first time we see this user, or refresh
  // in the background to keep balance fresh. The cached profile keeps
  // showing during the request — no flicker.
  if (user && !inflight.has(user.id) && !cache.has(user.id)) {
    fetchProfile(user.id);
  }

  const loading = !!user && !cache.has(user.id);

  return {
    profile,
    loading,
    refreshProfile: () =>
      user ? fetchProfile(user.id) : Promise.resolve(null),
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
  const next = { ...current, ...patch };
  cache.set(userId, next);
  persist(userId, next);
  notify();
}
