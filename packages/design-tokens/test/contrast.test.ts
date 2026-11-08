// Every foreground/background pairing the component library uses, checked against WCAG AA.
import { describe, expect, it } from 'vitest';
import { chatSim, color, contrastRatio, palette } from '../src';

const TEXT: [string, string, string][] = [
  ['primary text on canvas', color.text.primary, color.bg.canvas],
  ['primary text on card', color.text.primary, color.bg.card],
  ['primary text on stone', color.text.primary, color.bg.brand],
  ['primary text on paper', color.text.primary, color.bg.paper],
  ['muted text on paper', color.text.muted, color.bg.paper],
  ['muted text on card', color.text.muted, color.bg.card],
  ['muted text on canvas', color.text.muted, color.bg.canvas],
  ['muted text on raised', color.text.muted, color.bg.raised],
  ['label on yellow button', color.text.onAction, color.action.primary],
  ['label on pressed yellow', color.text.onAction, color.action.primaryPressed],
  ['text on selected tint', color.text.primary, color.bg.selected],
  ['inverse text on charcoal (Confirmed pill)', color.text.inverse, color.bg.inverse],
  ['alert text on card', color.text.alert, color.bg.card],
  ['alert text on alert tint', color.text.alert, color.status.alertTint],
  ['white on alert (Missed pill)', palette.white, color.status.alert],
  ['success text on card', color.text.success, color.bg.card],
  ['link text on canvas', color.text.link, color.bg.canvas],
  ['link text on card', color.text.link, color.bg.card],
  ['primary text on sunken track', color.text.primary, color.bg.sunken],
  ['success text on canvas', color.text.success, color.bg.canvas],
  ['chat sim: header text', chatSim.onHeader, chatSim.header],
  ['chat sim: text on incoming bubble', chatSim.text, chatSim.bubbleIn],
  ['chat sim: text on outgoing bubble', chatSim.text, chatSim.bubbleOut],
  ['chat sim: muted on incoming bubble', chatSim.muted, chatSim.bubbleIn],
  ['chat sim: muted on outgoing bubble', chatSim.muted, chatSim.bubbleOut],
  ['chat sim: text on wallpaper', chatSim.text, chatSim.wallpaper],
  ['chat sim: reply button text', chatSim.action, chatSim.surface],
  ['chat sim: unread badge', chatSim.onBadge, chatSim.badge],
  ['success text on success tint', color.text.success, color.status.successTint],
];

const UI: [string, string, string][] = [
  ['control border on card', color.border.control, color.bg.card],
  ['control border on canvas', color.border.control, color.bg.canvas],
  ['control border on raised', color.border.control, color.bg.raised],
  ['strong border on paper', color.border.strong, color.bg.paper],
  ['strong border on yellow', color.border.strong, color.action.primary],
  ['alert boundary on card', color.status.alert, color.bg.card],
];

describe('WCAG AA contrast', () => {
  it.each(TEXT)('%s >= 4.5:1', (_, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(UI)('%s >= 3:1 (non-text)', (_, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(3);
  });
  it('Golden Yellow is not a text colour on light surfaces', () => {
    expect(contrastRatio(palette.goldenYellow, palette.cream)).toBeLessThan(4.5);
  });
  it('matches the moodboard figure for charcoal on cream (12.6:1 or better)', () => {
    expect(contrastRatio(palette.charcoal, palette.cream)).toBeGreaterThan(12.6);
  });
});
