/**
 * Simple offline cache using localStorage.
 * Stores data with a timestamp so we can serve stale content when offline.
 */

const CACHE_PREFIX = "gg_offline_";

interface CachedData<T> {
  data: T;
  cachedAt: number;
}

export function setCacheData<T>(key: string, data: T): void {
  try {
    const entry: CachedData<T> = { data, cachedAt: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function getCacheData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CachedData<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function clearCacheData(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Silently fail
  }
}

/** Build a user-scoped cache key */
export function userCacheKey(userId: string, domain: string): string {
  return `${userId}_${domain}`;
}
