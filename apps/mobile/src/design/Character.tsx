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

/**
 * Round avatar on white. The avatar crops are square with a pure white backdrop, so the
 * face fills the circle cleanly with no coloured corners showing.
 */
export function CharacterAvatar({ name, size = 48, label }: { name: CharacterName; size?: number; label?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.pill, backgroundColor: color.bg.raised, borderWidth: 1, borderColor: color.border.subtle, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Character name={name} width={Math.round(size * 0.92)} height={Math.round(size * 0.92)} label={label} />
    </View>
  );
}

/** Round avatar from the Pet Crew (Sparky for dogs, Kitto for cats). */
export function CrewAvatar({ species, size = 48 }: { species: 'dog' | 'cat'; size?: number }) {
  return <CharacterAvatar name={species === 'cat' ? 'avatarKitto' : 'avatarSparky'} size={size} />;
}

export type { CharacterName };
