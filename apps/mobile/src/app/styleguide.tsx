// Living style guide: every token and component, rendered with the real code.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button, Card, Checkbox, Chip, color, contrastRatio, Icon, icons, IllustrationSlot, ListItem, Logo, MetricCard, palette,
  ProgressDots, radius, Screen, SectionHeader, SegmentedTabs, space, StatusPill, Text, TextField, Toggle, type, type IconName,
} from '../design';

const SWATCHES: { name: string; hex: string; use: string }[] = [
  { name: 'Stone', hex: palette.stone, use: 'Background surfaces' },
  { name: 'Golden Yellow', hex: palette.goldenYellow, use: 'Primary actions & highlights' },
  { name: 'Cream', hex: palette.cream, use: 'Cards & panels' },
  { name: 'Soft Beige', hex: palette.softBeige, use: 'Screen background' },
  { name: 'Charcoal', hex: palette.charcoal, use: 'Text & icons' },
  { name: 'Alert', hex: palette.alert, use: 'Missed / not confirmed' },
  { name: 'Success', hex: palette.success, use: 'Good / covered' },
];

export default function StyleGuide() {
  const [tab, setTab] = useState<'all' | 'health' | 'nutrition' | 'activity'>('all');
  const [remind, setRemind] = useState(true);
  const [on, setOn] = useState(true);
  return (
    <Screen header={<Logo tagline />}>
      <Section n="01" title="Colour tokens">
        <View style={st.grid}>
          {SWATCHES.map((sw) => (
            <View key={sw.name} style={st.swatch}>
              <View style={[st.chipColor, { backgroundColor: sw.hex }]} />
              <Text variant="label">{sw.name}</Text>
              <Text variant="small" tone="muted">{sw.hex}</Text>
              <Text variant="small" tone="muted">{sw.use}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section n="02" title="Typography">
        {(Object.keys(type) as (keyof typeof type)[]).map((k) => (
          <View key={k} style={st.typeRow}>
            <Text variant="small" tone="muted" style={{ width: 92 }}>{k} {type[k].fontSize}/{type[k].lineHeight}</Text>
            <Text variant={k} style={{ flex: 1 }} numberOfLines={1}>{k.startsWith('h') ? 'Be sure' : 'Bruno ate lunch'}</Text>
          </View>
        ))}
        <Text variant="body">हिंदी · मराठी: ब्रूनोला जेवण दिले</Text>
      </Section>

      <Section n="03" title="Spacing and radius">
        <View style={st.scale}>
          {Object.entries(space).map(([k, v]) => (
            <View key={k} style={{ alignItems: 'center', gap: 4 }}>
              <View style={{ width: v, height: v * 1.5 + 4, backgroundColor: color.action.primary, borderRadius: 2 }} />
              <Text variant="small" tone="muted">{v}</Text>
            </View>
          ))}
        </View>
        <View style={st.scale}>
          {Object.entries(radius).filter(([k]) => k !== 'pill').map(([k, v]) => (
            <View key={k} style={{ alignItems: 'center', gap: 4 }}>
              <View style={{ width: 40, height: 40, backgroundColor: color.bg.selected, borderRadius: v, borderWidth: 1, borderColor: color.border.subtle }} />
              <Text variant="small" tone="muted">{v}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section n="04" title="Iconography">
        <View style={st.grid}>
          {(Object.keys(icons) as IconName[]).map((n) => (
            <View key={n} style={st.iconCell}>
              <Icon name={n} />
              <Text variant="small" tone="muted">{n}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section n="05" title="Component library">
        <Text variant="label">Buttons</Text>
        <Button label="Get started" onPress={() => {}} />
        <Button label="Learn more" kind="secondary" onPress={() => {}} />
        <Button label="View details" kind="outlined" onPress={() => {}} />
        <Button label="Call vet" kind="danger" icon="phone" onPress={() => {}} />
        <Text variant="label">Input field</Text>
        <TextField icon="search" placeholder="Search pets, reminders…" />
        <Text variant="label">Checkbox and toggle</Text>
        <Checkbox label="Remind me" checked={remind} onChange={setRemind} />
        <Toggle label="Alerts for Bruno" value={on} onChange={setOn} />
        <Text variant="label">Tabs</Text>
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          options={[{ value: 'all', label: 'All' }, { value: 'health', label: 'Health' }, { value: 'nutrition', label: 'Nutrition' }, { value: 'activity', label: 'Activity' }]}
        />
        <Text variant="label">Progress dots</Text>
        <ProgressDots count={5} index={0} />
        <Text variant="label">Chips</Text>
        <View style={st.row}>
          <Chip label="Feed" selected onPress={() => {}} />
          <Chip label="Walk" onPress={() => {}} />
          <Chip label="Indoor" />
        </View>
        <Text variant="label">Card / list item</Text>
        <ListItem icon="vaccine" title="Vaccination due" subtitle="Rabies vaccine" meta="Due in 5 days" metaTone="alert" onPress={() => {}} />
        <Text variant="label">Health metric card</Text>
        <MetricCard icon="health" label="Weight" value="12.4 kg" delta="+0.3 kg" series={[11.8, 11.9, 12.0, 11.9, 12.1, 12.3, 12.4]} />
        <Text variant="label">Confidence labels (PRD 5.1)</Text>
        <View style={st.row}>
          {(['confirmed', 'likely', 'not_confirmed', 'missed', 'matched', 'pending'] as const).map((v) => <StatusPill key={v} value={v} />)}
        </View>
      </Section>

      <Section n="07" title="Illustration style">
        <Text variant="caption" tone="muted">Simple, playful, hand-drawn. Final artwork slots in here; nothing in the UI depends on it.</Text>
        <IllustrationSlot name="onboarding hero" />
      </Section>

      <Section n="08" title="Design principles">
        {[
          ['health', 'Pet first', 'Designed around the real needs of pets and their humans.'],
          ['friends', 'Simple and clear', 'Easy to use, low effort, works for basic-phone helpers too.'],
          ['smile', 'Warm and playful', 'Friendly illustrations and a positive tone.'],
          ['shield', 'Honest evidence', 'Never say "done" without evidence. Show what we know.'],
        ].map(([i, t, d]) => (
          <ListItem key={t} icon={i as IconName} title={t!} subtitle={d} />
        ))}
      </Section>

      <Section n="09" title="Accessibility">
        <View style={st.row}>
          <Ratio fg={color.text.onAction} bg={color.action.primary} />
          <Ratio fg={color.text.inverse} bg={color.bg.inverse} />
          <Ratio fg={color.text.primary} bg={color.bg.card} />
          <Ratio fg={color.text.muted} bg={color.bg.card} />
        </View>
        <Text variant="caption" tone="muted">
          WCAG AA for all text and controls (checked by automated tests). 48px touch targets. Labels on every status, so colour is never the only cue.
        </Text>
      </Section>
    </Screen>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <SectionHeader title={`${n}. ${title}`} />
      {children}
    </Card>
  );
}

function Ratio({ fg, bg }: { fg: string; bg: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={[st.ratio, { backgroundColor: bg }]}>
        <Text variant="h3" style={{ color: fg }}>Aa</Text>
      </View>
      <Text variant="small" tone="muted">{contrastRatio(fg, bg).toFixed(1)}:1</Text>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  swatch: { width: 96, gap: 2 },
  chipColor: { width: 96, height: 64, borderRadius: radius.md, borderWidth: 1, borderColor: color.border.subtle },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  scale: { flexDirection: 'row', alignItems: 'flex-end', gap: space.lg, flexWrap: 'wrap' },
  iconCell: { width: 72, alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  ratio: { width: 64, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.border.subtle },
});
