// O11 Stay updates and "Show me now" (P1 preview, PS-115).
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Card, IllustrationSlot, ListItem, NoticeBanner, Screen, SectionHeader, Text } from '../../design';
import { useProto } from '../../proto/store';

export default function Stay() {
  const { state } = useProto();
  const [asked, setAsked] = useState(false);
  return (
    <Screen title="Today's stay" subtitle={`${state.pet.name} · Happy Paws Powai`}>
      <NoticeBanner icon="leaf" title="Preview · planned for P1" />
      <SectionHeader title="Timed updates" />
      <ListItem icon="food" title="11:00 am · Snack and water" subtitle="Photo from staff app" meta="On time" metaTone="success" />
      <ListItem icon="activity" title="12:30 pm · Play group (small dogs)" subtitle="Free-roam yard" meta="On time" metaTone="success" />
      <ListItem icon="home" title="2:00 pm · Rest" subtitle="Quiet room, not a crate" meta="On time" metaTone="success" />
      <SectionHeader title="Show me now" />
      <Card>
        {!asked ? (
          <>
            <Text variant="caption">Ask for a 15-second clip. Staff have 5 minutes to reply; requests and replies count toward the live score.</Text>
            <Button label="Show me now" icon="search" onPress={() => setAsked(true)} />
          </>
        ) : (
          <>
            <Text variant="bodyStrong">Reply in 2 min 10 s</Text>
            <IllustrationSlot name="15-second clip" height={140} />
          </>
        )}
      </Card>
      <Button label="Pickup handover" onPress={() => router.push('/later/dc-handover')} full />
    </Screen>
  );
}
