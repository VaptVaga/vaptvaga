import type { Database } from '../types/database';

export type AuthProfile = Database['public']['Tables']['profiles']['Row'] & {
  subscriber?: string | null;
  titulo_profissional?: string | null;
  bio?: string | null;
  instagram?: string | null;
  experiencias?: unknown;
  banner_url?: string | null;
  aceita_email?: boolean;
  aceita_whatsapp?: boolean;
};

const PROFILE_CACHE_PREFIX = 'vaptvaga_profile_';

export const getCachedProfile = (userId: string): Partial<AuthProfile> | null => {
  try {
    const raw = localStorage.getItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AuthProfile>;
  } catch {
    return null;
  }
};

export const setCachedProfile = (userId: string, data: Record<string, unknown>): void => {
  try {
    const existing = getCachedProfile(userId) || {};
    const merged = { ...existing, ...data };
    localStorage.setItem(`${PROFILE_CACHE_PREFIX}${userId}`, JSON.stringify(merged));
  } catch {
    // Ignore storage quota/access errors
  }
};

export const mergeProfileData = (
  dbRow: Record<string, unknown> | null,
  cached: Partial<AuthProfile> | null
): AuthProfile | null => {
  if (!dbRow && !cached) return null;
  const base = { ...(cached || {}), ...(dbRow || {}) } as Record<string, unknown>;

  const extendedKeys = [
    'titulo_profissional',
    'bio',
    'instagram',
    'experiencias',
    'banner_url',
    'subscriber',
  ];

  if (cached) {
    for (const key of extendedKeys) {
      const dbVal = dbRow?.[key];
      const cachedVal = (cached as Record<string, unknown>)[key];
      if ((dbVal === undefined || dbVal === null) && cachedVal !== undefined && cachedVal !== null) {
        base[key] = cachedVal;
      }
    }
  }

  return base as AuthProfile;
};
