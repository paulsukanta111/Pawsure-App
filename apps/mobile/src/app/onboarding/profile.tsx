// Onboarding 1/6: registration (name, photo, language).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Chip, PhotoPicker, Screen, space, StepHeader, Text, TextField } from '../../design';
import { useProto, type Lang } from '../../proto/store';

const LANGS: { value: Lang; label: string }[] = [{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' }, { value: 'mr', label: 'मराठी' }];

export default function OnboardProfile() {
  const { state, dispatch } = useProto();
  const [name, setName] = useState(state.profile.name);
  const [touched, setTouched] = useState(false);
  const invalid = name.trim().length < 2;
  return (
    <Screen>
      <StepHeader step={1} of={6} title="About you" body="Friends see your first name and society, never your flat number." />
      <PhotoPicker label="Add your photo" value={state.profile.photo} onPick={() => dispatch({ type: 'profile', patch: { photo: true } })}
        art={<Avatar label={name || 'N'} tone="yellow" size={128} />} />
      <TextField label="Your name" value={name} onChangeText={setName} onBlur={() => setTouched(true)} autoComplete="name" />
      {touched && invalid ? <Text variant="caption" tone="alert">Enter your name (at least 2 letters).</Text> : null}
      <Text variant="label">App language</Text>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {LANGS.map((l) => <Chip key={l.value} label={l.label} selected={state.profile.language === l.value} onPress={() => dispatch({ type: 'profile', patch: { language: l.value } })} />)}
      </View>
      {state.profile.language !== 'en' ? <Text variant="small" tone="muted">Owner screens in Hindi and Marathi are coming; helper and friend messages already use them.</Text> : null}
      <Button label="Continue" disabled={invalid} onPress={() => { dispatch({ type: 'profile', patch: { name: name.trim() } }); router.push('/onboarding/consent'); }} full />
    </Screen>
  );
}
