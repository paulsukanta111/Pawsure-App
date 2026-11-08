// Icon gallery: every Pawsure icon by category, sizes, variants, backgrounds and usage.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, color, NoticeBanner, radius, Screen, SectionHeader, space, Text } from '../design';
import {
  AddIcon, HomeIcon, ICON_CATEGORIES, ICON_COUNT, LikeIcon, ReminderCompletedIcon, SaveIcon, VaccinationIcon,
  type IconCategory,
} from '../icons';

const CATS = Object.keys(ICON_CATEGORIES) as IconCategory[];

export default function IconGallery() {
  const [bg, setBg] = useState<'cream' | 'white'>('cream');
  const [accent, setAccent] = useState(true);
  const surface = bg === 'cream' ? color.bg.card : color.bg.raised;
  return (
    <Screen title="Pawsure icons" subtitle={`${ICON_COUNT} icons · bold rounded outlines · flat Pawsure fills · 24 and 48 grids`}>
      <View style={st.row}>
        <Chip label="Cream" selected={bg === 'cream'} onPress={() => setBg('cream')} />
        <Chip label="White" selected={bg === 'white'} onPress={() => setBg('white')} />
        <Chip label={accent ? 'Fills on' : 'Outline only'} selected={accent} onPress={() => setAccent(!accent)} />
      </View>

      <SectionHeader title="Sizes" />
      <Card style={{ backgroundColor: surface }}>
        <View style={[st.row, { alignItems: 'flex-end' }]}>
          {[16, 20, 24, 32, 48].map((s) => (
            <View key={s} style={st.cell}><VaccinationIcon size={s} accent={accent} /><Text variant="small" tone="muted">{s}</Text></View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Variants" />
      <Card style={{ backgroundColor: surface }}>
        <View style={st.row}>
          <View style={st.cell}><HomeIcon size={32} /><Text variant="small" tone="muted">Tab</Text></View>
          <View style={st.cell}><HomeIcon size={32} filled /><Text variant="small" tone="muted">Selected</Text></View>
          <View style={st.cell}><LikeIcon size={32} /><Text variant="small" tone="muted">Like</Text></View>
          <View style={st.cell}><LikeIcon size={32} filled /><Text variant="small" tone="muted">Liked</Text></View>
          <View style={st.cell}><SaveIcon size={32} filled /><Text variant="small" tone="muted">Saved</Text></View>
          <View style={st.cell}><AddIcon size={40} /><Text variant="small" tone="muted">Primary</Text></View>
          <View style={st.cell}><ReminderCompletedIcon size={32} color={color.text.muted} /><Text variant="small" tone="muted">color=</Text></View>
        </View>
      </Card>

      {CATS.map((cat) => (
        <View key={cat} style={{ gap: space.sm }}>
          <SectionHeader title={`${cat === 'Illustration' ? 'Feature illustrations (48)' : `${cat}Icons`} · ${Object.keys(ICON_CATEGORIES[cat]).length}`} />
          <Card style={{ backgroundColor: surface }}>
            <View style={st.grid}>
              {Object.entries(ICON_CATEGORIES[cat]).map(([name, Icon]) => (
                <View key={name} style={[st.tile, cat === 'Illustration' && { width: 104 }]}>
                  <Icon size={cat === 'Illustration' ? 48 : 32} accent={accent} label={name.replace(/Icon$|Illustration$/, '')} />
                  <Text variant="small" tone="muted" align="center" numberOfLines={2}>{name.replace(/Icon$|Illustration$/, '')}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      ))}

      <SectionHeader title="Usage" />
      <Card>
        <Text variant="small" style={st.code}>{`import { HomeIcon, VaccinationIcon, ICONS } from '../icons';

<HomeIcon />                       // 24px, charcoal outline
<HomeIcon filled />                // selected tab (yellow fill)
<VaccinationIcon size={32} />      // larger
<VaccinationIcon accent={false} /> // outline only
<VaccinationIcon color={color.text.muted} />  // via currentColor
<AddIcon size={48} />              // primary action, yellow circle
<WarningIcon label="Warning" />    // meaningful: announced to screen readers
const Icon = ICONS[name];          // data-driven lookup`}</Text>
      </Card>
      <NoticeBanner icon="leaf" title="Rules" body="One stroke weight per grid (2 on 24, 2.5 on 48). Colour is never the only signal: status icons pair with a label. Decorative icons stay hidden from screen readers." />
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, alignItems: 'center' },
  cell: { alignItems: 'center', gap: 4, minWidth: 44 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: { width: 76, alignItems: 'center', gap: 4, paddingVertical: space.sm, borderRadius: radius.md },
  code: { fontFamily: 'monospace', color: color.text.primary },
});
