// P1 Day-care staff day view (P1 preview, PS-074).
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, ListItem, NoticeBanner, Screen, SectionHeader, space, Stat, Text } from '../../design';

export default function DcToday() {
  return (
    <Screen title="Happy Paws · today" subtitle="Staff view">
      <NoticeBanner icon="leaf" title="Preview · planned for P1" body="What day-care staff see on their own phone." />
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Stat value="11" label="Dogs in" icon="dog" /><Stat value="2" label="Updates due" icon="clock" /><Stat value="1" label="Show-me request" icon="search" />
      </View>
      <SectionHeader title="Due now" />
      <ListItem icon="search" title="Bruno · Show me now" subtitle="Requested 2:41 pm · reply by 2:46 pm" meta="Record 15 seconds" metaTone="alert" onPress={() => router.push('/later/dc-showme')} />
      <ListItem icon="food" title="Luna · 3:00 pm update" subtitle="Snack and water photo" onPress={() => {}} />
      <SectionHeader title="Pickups" />
      <ListItem icon="paw" title="Bruno · 6:00 pm" subtitle="Compare with drop-off card" onPress={() => router.push('/later/dc-handover')} />
      <Text variant="small" tone="muted">On-time updates and clean pickups earn points for the named staff member. Points never change the grade.</Text>
      <Button label="Audit result" kind="outlined" onPress={() => router.push('/later/dc-audit')} full />
    </Screen>
  );
}
