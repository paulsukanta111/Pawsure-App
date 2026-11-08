// What this prototype covers (master prompt deliverable 10).
import { Card, NoticeBanner, Screen, SectionHeader, Text } from '../design';
import { COVERED, NOT_YET } from '../proto/coverage';

export default function Coverage() {
  return (
    <Screen title="What this prototype covers" subtitle="Pawsure PRD v1.3, P0 first. Simulated parts are labelled in the app.">
      <SectionHeader title="Represented" />
      {COVERED.map(([k, v]) => (
        <Card key={k}><Text variant="bodyStrong">{k}</Text><Text variant="caption">{v}</Text></Card>
      ))}
      <SectionHeader title="Not yet represented" />
      {NOT_YET.map(([k, v]) => (
        <Card key={k}><Text variant="bodyStrong">{k}</Text><Text variant="caption" tone="muted">{v}</Text></Card>
      ))}
      <NoticeBanner icon="shield" title="Nothing real is sent" body="No SMS, WhatsApp message, phone call or AI request leaves this prototype." />
    </Screen>
  );
}
