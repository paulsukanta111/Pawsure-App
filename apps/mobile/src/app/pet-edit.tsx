// O2 Pet profile and vet details (PS-003, PS-004, PS-006). Optional fields never block saving.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Chip, PetAvatar, Screen, SectionHeader, space, Text, TextField } from '../design';
import { useProto } from '../proto/store';

export default function PetEdit() {
  const { state, dispatch } = useProto();
  const [p, setP] = useState(state.pet);
  const set = (k: keyof typeof p) => (v: string) => setP((x) => ({ ...x, [k]: v }));
  return (
    <Screen title="Pet profile" subtitle="Only the name is required. Add the rest when you can.">
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <PetAvatar species={p.species} size={88} />
        <Button label="Add photo" kind="outlined" onPress={() => {}} />
      </View>
      <TextField label="Name" value={p.name} onChangeText={set('name')} />
      <Text variant="label">Species</Text>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Chip icon="dog" label="Dog" selected={p.species === 'dog'} onPress={() => setP((x) => ({ ...x, species: 'dog', speciesLabel: 'Dog' }))} />
        <Chip icon="cat" label="Cat" selected={p.species === 'cat'} onPress={() => setP((x) => ({ ...x, species: 'cat', speciesLabel: 'Cat' }))} />
      </View>
      <TextField label="Breed" value={p.breed} onChangeText={set('breed')} />
      <TextField label="Age" value={p.age} onChangeText={set('age')} />
      <SectionHeader title="Care" />
      <TextField label="Food" value={p.food} onChangeText={set('food')} multiline />
      <TextField label="Allergies" value={p.allergies} onChangeText={set('allergies')} />
      <TextField label="Medicines" value={p.medicines} onChangeText={set('medicines')} multiline />
      <TextField label="Fears and habits" value={p.fears} onChangeText={set('fears')} multiline />
      <SectionHeader title="Vet and emergency" />
      <TextField label="Vet / clinic" value={p.vet.name} onChangeText={(v) => setP((x) => ({ ...x, vet: { ...x.vet, name: v } }))} />
      <TextField label="Vet phone" value={p.vet.phone} keyboardType="phone-pad" onChangeText={(v) => setP((x) => ({ ...x, vet: { ...x.vet, phone: v } }))} />
      <TextField label="Nearest 24x7 clinic" value={p.clinic24x7} onChangeText={set('clinic24x7')} />
      <Text variant="small" tone="muted">Shown as owner-provided information with the date you last updated it.</Text>
      <Button label="Save" onPress={() => { dispatch({ type: 'pet', patch: p }); router.back(); }} disabled={!p.name.trim()} full />
    </Screen>
  );
}
