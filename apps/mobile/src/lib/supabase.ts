/**
 * Supabase client for the owner app (Android + web).
 *
 * The URL and publishable key are public by design: data is protected by the
 * row-level security policies in supabase/migrations, not by hiding the key.
 * Override per build with EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY.
 * Never put the service-role key in the app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Database } from './database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://kwuswszyhyulnlfsqzce.supabase.co';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_qHiNZ8vPZ6pAbDqjMLilVA_yOiVuXJP';

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/** PS-001: mobile number + OTP. Numbers are Indian mobiles, stored in E.164. */
export function toE164India(input: string): string | null {
  const digits = input.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export async function sendOtp(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}
