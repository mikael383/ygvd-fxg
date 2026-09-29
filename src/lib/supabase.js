import { createClient } from '@supabase/supabase-js';

// Local storage key for dynamic configuration via UI
const STORAGE_KEY = 'pulse_surveys_supabase_config';

export function getStoredSupabaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.key) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored Supabase config:', e);
  }
  return null;
}

export function saveStoredSupabaseConfig(url, key) {
  if (!url || !key) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), key: key.trim() }));
}

export function clearStoredSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getActiveSupabaseCredentials() {
  // Check localStorage first (allows user to connect directly from the UI modal without server restart)
  const stored = getStoredSupabaseConfig();
  if (stored && stored.url && stored.key) {
    return { url: stored.url, key: stored.key, source: 'custom' };
  }

  // Fallback to Vite environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('placeholder') && !envKey.includes('placeholder')) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  return null;
}

export function isSupabaseConfigured() {
  return getActiveSupabaseCredentials() !== null;
}

let supabaseInstance = null;
let currentKey = null;

export function getSupabaseClient() {
  const creds = getActiveSupabaseCredentials();
  if (!creds) return null;

  const keySignature = `${creds.url}_${creds.key}`;
  if (!supabaseInstance || currentKey !== keySignature) {
    supabaseInstance = createClient(creds.url, creds.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentKey = keySignature;
  }

  return supabaseInstance;
}

export const supabase = getSupabaseClient();
