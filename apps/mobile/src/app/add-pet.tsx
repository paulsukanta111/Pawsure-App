// Add another pet (PS-003, PS-006). Each pet gets its own routine and covered-day result.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Chip, Screen, space, Text, TextField, useToast } from '../design';
import { useProto } from '../proto/store';

export default function AddPet() {
  const { dispatch } = useProto();
  const toast = useToast();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat'>('cat');
  return (
    <Screen title="Add a pet" subtitle="Cats and other pets use the same own-helper path.">
      <TextField label="Name" value={name} onChangeText={setName} placeholder="Mochi" />
      <Text variant="label">Species</Text>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Chip icon="dog" label="Dog" selected={species === 'dog'} onPress={() => setSpecies('dog')} />
        <Chip icon="cat" label="Cat" selected={species === 'cat'} onPress={() => setSpecies('cat')} />
      </View>
      <Button label="Add pet" disabled={!name.trim()} onPress={() => { dispatch({ type: 'add_pet', name: name.trim(), species }); toast(`${name.trim()} added`); router.back(); }} full />
    </Screen>
  );
}
