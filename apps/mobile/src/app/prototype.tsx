// Prototype map: every wireframe screen (Appendix A) plus guided demo scripts.
import { router, type Href } from 'expo-router';
import { Button, Card, ListItem, NoticeBanner, Screen, SectionHeader, Text, type IconName } from '../design';
import { DemoClock } from '../proto/DemoClock';
import { useProto } from '../proto/store';

type Entry = [id: string, title: string, href: Href, icon: IconName];
/** Tab screens already exist under the stack; go back to them instead of stacking a copy. */
const TAB_ROUTES = ['/', '/find-cover', '/friends', '/pet', '/me'];

const OWNER: Entry[] = [
  ['O1', 'Welcome and sign-in', '/welcome', 'paw'],
  ['O2', 'Pet profile', '/pet-edit', 'dog'],
  ['O3', 'Routine and alone window', '/routine', 'clock'],
  ['O4', 'Care circle', '/care-circle', 'care'],
  ['O5', "Who's caring today", '/', 'home'],
  ['O6', 'Task detail and evidence', '/task/t-lunch', 'check'],
  ['O7', 'Missed check-in and ladder', '/missed/t-walk', 'alert'],
  ['O12', 'Return check', '/return-check', 'smile'],
  ['O13', 'Day report', '/day-report', 'stats'],
  ['O14', 'Emergency and incidents', '/emergency', 'alert'],
  ['O15', 'Wallet and health', '/wallet', 'health'],
  ['PS-109', 'Food-box code card', '/code-card', 'key'],
  ['PS-102', "Backup's look-in link", '/look-in?task=t-walk', 'friends'],
  ['—', 'Alerts', '/notifications', 'reminder'],
];
const HELPER: Entry[] = [
  ['W1–W3, W5', 'Helper on WhatsApp', '/helper', 'community'],
  ['W4', 'Basic phone: missed call + code', '/basic-phone', 'phone'],
];
const FRIENDS: Entry[] = [
  ['F1', 'What friends see about me', '/privacy-profile', 'shield'],
  ['F2', 'Friends list', '/friends', 'friends'],
  ['F3', 'Friend profile', '/friend/f-priya', 'profile'],
  ['F4–F5', 'Ask Pawsure and suggestions', '/find-cover', 'search'],
  ['F6', 'Friend gets the request', '/friend-request', 'community'],
  ['F7', 'My help settings', '/friend-settings', 'settings'],
];
const P1: Entry[] = [
  ['O8', 'Day-care cards', '/later/daycares', 'home'],
  ['O9', 'Day-care detail and booking', '/later/daycare', 'calendar'],
  ['O10', 'Drop-off card', '/later/dropoff', 'paw'],
  ['O11', 'Stay and show me now', '/later/stay', 'search'],
  ['P1', 'Staff day view', '/later/dc-today', 'stats'],
  ['P2', 'Pickup handover', '/later/dc-handover', 'check'],
  ['P3', 'Staff show-me reply', '/later/dc-showme', 'search'],
  ['P4', 'Private audit result', '/later/dc-audit', 'shield'],
];
const P2: Entry[] = [
  ['P5 / O8', 'Carer levels and cards', '/later/carers', 'shield'],
  ['P6', 'Carer visit', '/later/carer-visit', 'activity'],
];

function Group({ title, items }: { title: string; items: Entry[] }) {
  return (
    <>
      <SectionHeader title={title} />
      {items.map(([id, t, href, icon]) => href === '/welcome'
        ? <ListItem key={id + t} icon={icon} title={t} subtitle={`${id} · sign out from Me to see it`} />
        : <ListItem key={id + t} icon={icon} title={t} subtitle={id} onPress={() => (TAB_ROUTES.includes(href as string) ? router.dismissTo(href) : router.push(href))} />)}
    </>
  );
}

export default function Prototype() {
  const { dispatch } = useProto();
  return (
    <Screen title="All screens" subtitle="Every wireframe in the PRD, connected to one simulated household.">
      <DemoClock compact />
      <SectionHeader title="Guided demos" />
      <Card>
        <Text variant="bodyStrong">1. A normal day</Text>
        <Text variant="caption">Open Helper on WhatsApp → send "Photo with code" for the walk → back on Today the walk turns Likely. Add arrival and leaving calls in Basic phone to make it Confirmed.</Text>
      </Card>
      <Card>
        <Text variant="bodyStrong">2. A missed walk</Text>
        <Text variant="caption">Jump the clock to 4:45 → Today shows the alert → 5:15 the backup's look-in link goes out → 5:30 cover is suggested. Tap "I'm on it" earlier to stop steps 2 and 3.</Text>
      </Card>
      <Card>
        <Text variant="bodyStrong">3. Sunita can't come</Text>
        <Text variant="caption">Today → "Sunita can't come today" → Find cover for 6 pm → Ask all → open the friend's WhatsApp and reply Yes → Confirm. Address details appear only after confirmation.</Text>
      </Card>
      <Card>
        <Text variant="bodyStrong">4. Something's wrong</Text>
        <Text variant="caption">Helper on WhatsApp → Report a problem → Hurt. Today shows an urgent alert; Emergency shows who is called and when.</Text>
      </Card>
      <Button label="Reset the demo day" kind="outlined" onPress={() => dispatch({ type: 'reset' })} full />

      <Group title="Owner app (P0)" items={OWNER} />
      <Group title="Helper (P0, no app needed)" items={HELPER} />
      <Group title="AI Friend Finder (P0)" items={FRIENDS} />
      <NoticeBanner icon="leaf" title="Later releases" body="Previews with sample data. Not part of the pilot." />
      <Group title="Graded day cares (P1)" items={P1} />
      <Group title="Verified carers (P2)" items={P2} />
      <SectionHeader title="Design" />
      <ListItem icon="leaf" title="Style guide" onPress={() => router.push('/styleguide')} />
    </Screen>
  );
}
