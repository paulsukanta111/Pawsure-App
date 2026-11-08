// Onboarding 4/6: food, allergies, medication, vet, nearest 24x7 clinic (PS-003, PS-004).
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Screen, SectionHeader, StepHeader, Text, TextField } from '../../design';
import { useProto } from '../../proto/store';

export default function OnboardPetCare() {
  const { state, dispatch } = useProto();
  const [p, setP] = useState(state.pet);
  const phoneOk = !p.vet.phone || p.vet.phone.replace(/\D/g, '').length >= 10;
  return (
    <Screen>
      <StepHeader step={4} of={6} title={`${p.name}'s care`} body="Your helper and friends see what they need for the task. Shown as owner-provided." />
      <TextField label="Food" value={p.food} onChangeText={(v) => setP({ ...p, food: v })} multiline />
      <TextField label="Allergies" value={p.allergies} onChangeText={(v) => setP({ ...p, allergies: v })} />
      <TextField label="Medicines" value={p.medicines} onChangeText={(v) => setP({ ...p, medicines: v })} multiline />
      <SectionHeader title="Vet and emergency" />
      <TextField label="Vet or clinic" value={p.vet.name} onChangeText={(v) => setP({ ...p, vet: { ...p.vet, name: v } })} />
      <TextField label="Vet phone" value={p.vet.phone} keyboardType="phone-pad" onChangeText={(v) => setP({ ...p, vet: { ...p.vet, phone: v } })} />
      {!phoneOk ? <Text variant="caption" tone="alert">Enter a full phone number so the call button works.</Text> : null}
      <TextField label="Nearest 24x7 clinic" value={p.clinic24x7} onChangeText={(v) => setP({ ...p, clinic24x7: v })} />
      <Button label="Continue" disabled={!phoneOk} onPress={() => { dispatch({ type: 'pet', patch: p }); router.push('/onboarding/routine'); }} full />
      <Button label="Skip for now" kind="outlined" onPress={() => router.push('/onboarding/routine')} full />
    </Screen>
  );
}
