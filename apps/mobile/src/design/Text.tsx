import type { ReactNode } from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { color, type } from './theme';

export type TextVariant = keyof typeof type;
type Tone = 'primary' | 'muted' | 'inverse' | 'alert' | 'success';

const toneColor: Record<Tone, string> = {
  primary: color.text.primary,
  muted: color.text.muted,
  inverse: color.text.inverse,
  alert: color.text.alert,
  success: color.text.success,
};

export interface PTextProps extends TextProps {
  variant?: TextVariant;
  tone?: Tone;
  align?: TextStyle['textAlign'];
  children: ReactNode;
}

/** The only text component screens should use. Headings get the header role automatically. */
export function Text({ variant = 'body', tone = 'primary', align, style, children, ...rest }: PTextProps) {
  const isHeading = variant === 'h1' || variant === 'h2' || variant === 'h3';
  return (
    <RNText
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[type[variant], { color: toneColor[tone], textAlign: align }, style]}
    >
      {children}
    </RNText>
  );
}
