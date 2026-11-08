/** Pet Crew character art (team-supplied illustrations) at its true aspect ratio. */
import { Image, View } from 'react-native';
import { CHARACTERS, type CharacterName } from './characters';
import { color, radius } from './theme';

export function Character({ name, height, width, label }: { name: CharacterName; height?: number; width?: number; label?: string }) {
  const art = CHARACTERS[name];
  const h = height ?? (width ? Math.round((width * art.height) / art.width) : 160);
  const w = width ?? Math.round((h * art.width) / art.height);
  return (
    <Image
      source={{ uri: art.uri }}
      style={{ width: w, height: h }}
      resizeMode="contain"
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    />
  );
}

/** Round avatar from the Pet Crew (Sparky for dogs, Kitto for cats). */
export function CrewAvatar({ species, size = 48 }: { species: 'dog' | 'cat'; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.pill, backgroundColor: color.action.primary, borderWidth: 1.5, borderColor: color.border.strong, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Character name={species === 'cat' ? 'avatarKitto' : 'avatarSparky'} width={Math.round(size * 0.86)} />
    </View>
  );
}

export type { CharacterName };
