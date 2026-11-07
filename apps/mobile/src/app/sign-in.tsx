// O1 Mobile + OTP + consent (PS-001, PS-002). In demo mode the code is shown on screen.
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Button, Card, Checkbox, Chip, ProgressDots, Screen, space, Text, TextField } from '../design';
import { DEMO_CODE, useAuth } from '../lib/auth';

type Lang = 'en' | 'hi' | 'mr';
const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'mr', label: 'मराठी' },
];

export default function SignIn() {
  const auth = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPhone = async () => {
    setBusy(true);
    setError(null);
    const r = await auth.requestCode(phoneInput);
    setBusy(false);
    if (!r.ok) return setError(r.message);
    setPhone(r.phone!);
    setStep('code');
  };

  const submitCode = async () => {
    setBusy(true);
    setError(null);
    const r = await auth.confirmCode(phone, code, lang);
    setBusy(false);
    if (!r.ok) setError(r.message);
    // On success the auth listener switches to the app automatically.
  };

  return (
    <Screen title={step === 'phone' ? 'Sign in' : 'Enter your code'} subtitle={step === 'phone' ? 'We use your mobile number. No password needed.' : `Sent to ${phone.replace(/^\+91/, '+91 ')}`}>
      <ProgressDots count={3} index={step === 'phone' ? 1 : 2} />

      {auth.mode === 'demo' ? (
        <Card tone="brand">
          <Text variant="bodyStrong">Demo mode</Text>
          <Text variant="caption">
            {step === 'phone'
              ? 'No SMS is sent. Enter any 10-digit Indian mobile number to try the app with a sample household.'
              : `Your demo code is ${DEMO_CODE}.`}
          </Text>
        </Card>
      ) : null}

      {step === 'phone' ? (
        <>
          <TextField
            label="Mobile number"
            placeholder="98765 43210"
            value={phoneInput}
            onChangeText={setPhoneInput}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={16}
            onSubmitEditing={submitPhone}
          />
          <Text variant="label">Language</Text>
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            {LANGS.map((l) => <Chip key={l.value} label={l.label} selected={lang === l.value} onPress={() => setLang(l.value)} />)}
          </View>
          <Checkbox label="I agree to the Terms and Privacy Notice" checked={agreed} onChange={setAgreed} />
          <View style={{ flexDirection: 'row', gap: space.lg }}>
            <Text variant="label" accessibilityRole="link" style={{ textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://example.com/pawsure/terms')}>Terms</Text>
            <Text variant="label" accessibilityRole="link" style={{ textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://example.com/pawsure/privacy')}>Privacy Notice</Text>
          </View>
          {error ? <Text variant="caption" tone="alert" accessibilityLiveRegion="polite">{error}</Text> : null}
          <Button label={busy ? 'Please wait…' : 'Get code'} onPress={submitPhone} disabled={busy || !agreed || !phoneInput.trim()} full />
        </>
      ) : (
        <>
          <TextField
            label="6-digit code"
            placeholder="••••••"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={6}
            autoFocus
            onSubmitEditing={submitCode}
          />
          {error ? <Text variant="caption" tone="alert" accessibilityLiveRegion="polite">{error}</Text> : null}
          <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={submitCode} disabled={busy || code.length < 6} full />
          <Button label="Change number" kind="outlined" onPress={() => { setStep('phone'); setCode(''); setError(null); }} full />
        </>
      )}
    </Screen>
  );
}
