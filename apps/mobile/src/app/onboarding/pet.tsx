// Onboarding 3/6: pet profile basics (PS-003, PS-006).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { BrunoFace, Button, Chip, PhotoPicker, Screen, space, StepHeader, Text, TextField } from '../../design';
import { useProto } from '../../proto/store';

export default function OnboardPet() {
  const { state, dispatch } = useProto();
  const [p, setP] = useState(state.pet);
  const [photo, setPhoto] = useState(false);
  return (
    <Screen>
      <StepHeader step={3} of={6} title="Your pet" body="Only the name is required now." />
      <PhotoPicker label="Add a photo" value={photo} onPick={() => setPhoto(true)} art={<BrunoFace size={120} />} />
      <TextField label="Pet's name" value={p.name} onChangeText={(v) => setP({ ...p, name: v })} />
      <Text variant="label">Species</Text>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Chip icon="dog" label="Dog" selected={p.species === 'dog'} onPress={() => setP({ ...p, species: 'dog', speciesLabel: 'Dog' })} />
        <Chip icon="cat" label="Cat" selected={p.species === 'cat'} onPress={() => setP({ ...p, species: 'cat', speciesLabel: 'Cat' })} />
      </View>
      <TextField label="Breed" value={p.breed} onChangeText={(v) => setP({ ...p, breed: v })} />
      <TextField label="Age" value={p.age} onChangeText={(v) => setP({ ...p, age: v })} />
      <Button label="Continue" disabled={!p.name.trim()} onPress={() => { dispatch({ type: 'pet', patch: p }); router.push('/onboarding/pet-care'); }} full />
    </Screen>
  );
}
