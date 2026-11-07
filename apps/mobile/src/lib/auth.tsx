/**
 * Sign-in (PS-001, PS-002).
 *
 * Two modes behind one interface, chosen by EXPO_PUBLIC_AUTH_MODE:
 *  - 'demo' (default): no SMS is sent. Any valid Indian mobile number is accepted,
 *    the screen shows the demo code, and the app signs in to the shared demo
 *    owner account in Supabase (supabase/seed/demo_account.sql). Real RLS applies.
 *  - 'otp': real phone OTP through Supabase Auth; needs an SMS provider (DLT for India).
 *
 * The demo credentials ship in the app bundle on purpose: they only unlock the
 * demo household on the dev project. Never seed this account on the pilot project.
 */
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { sendOtp, supabase, toE164India, verifyOtp } from './supabase';

export type AuthMode = 'demo' | 'otp';
export const AUTH_MODE: AuthMode = process.env.EXPO_PUBLIC_AUTH_MODE === 'otp' ? 'otp' : 'demo';
export const DEMO_CODE = '123456';
const DEMO_ACCOUNT = { email: 'demo.owner@example.com', password: 'pawsure-demo-2026' };
export const CONSENT_VERSION = 'terms-privacy-2026-11-v1';

type Result = { ok: true } | { ok: false; message: string };

interface AuthValue {
  session: Session | null;
  /** True until the stored session has been restored on launch. */
  restoring: boolean;
  mode: AuthMode;
  requestCode(phoneInput: string): Promise<Result & { phone?: string }>;
  confirmCode(phone: string, code: string, language: 'en' | 'hi' | 'mr'): Promise<Result>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setRestoring(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      restoring,
      mode: AUTH_MODE,
      async requestCode(phoneInput) {
        const phone = toE164India(phoneInput);
        if (!phone) return { ok: false, message: 'Enter a 10-digit Indian mobile number.' };
        if (AUTH_MODE === 'demo') return { ok: true, phone };
        const { error } = await sendOtp(phone);
        return error ? { ok: false, message: friendly(error.message) } : { ok: true, phone };
      },
      async confirmCode(phone, code, language) {
        const clean = code.replace(/\D/g, '');
        if (clean.length !== 6) return { ok: false, message: 'Enter the 6-digit code.' };
        if (AUTH_MODE === 'demo') {
          if (clean !== DEMO_CODE) return { ok: false, message: 'That code is not right. In demo mode the code is shown above.' };
          const { error } = await supabase.auth.signInWithPassword(DEMO_ACCOUNT);
          if (error) return { ok: false, message: friendly(error.message) };
        } else {
          const { error } = await verifyOtp(phone, clean);
          if (error) return { ok: false, message: friendly(error.message) };
        }
        await recordConsent(language);
        return { ok: true };
      },
      async signOut() {
        // This device only: the demo account is shared, and signing out on one phone
        // should not end a user's sessions elsewhere.
        await supabase.auth.signOut({ scope: 'local' });
      },
    }),
    [session, restoring],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}

/** PS-002: store the accepted terms/privacy version with language and timestamp. */
async function recordConsent(language: 'en' | 'hi' | 'mr') {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  // Filter by our own auth id: RLS also returns people in our care circle.
  const { data: me } = await supabase.from('people').select('id').eq('auth_user_id', auth.user.id).maybeSingle();
  if (!me) return; // First-time real sign-ups create their profile in onboarding (next step).
  await supabase.from('consent_records').insert({
    person_id: me.id,
    purpose: 'terms_privacy',
    consent_text_version: CONSENT_VERSION,
    language,
    status: 'given',
    channel: 'app',
  });
}

function friendly(message: string): string {
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a minute and try again.';
  if (/expired|invalid/i.test(message)) return 'That code has expired or is not right. Request a new one.';
  if (/network|fetch/i.test(message)) return 'No connection. Check your internet and try again.';
  return 'Something went wrong. Please try again.';
}
