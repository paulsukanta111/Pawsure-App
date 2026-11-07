// P4 Private audit result, fix list, registration and publish toggle (P1 preview, PS-073, PS-113, 11.1, 11.2).
import { useState } from 'react';
import { Card, Checkbox, KeyValue, NoticeBanner, Screen, SectionHeader, Text, Toggle } from '../../design';

const FIXES = ['Add a second gate at the yard entrance', 'Keep a written medicine log', 'Publish prices on the notice board', 'Register with the State Animal Welfare Board if it applies'];

export default function DcAudit() {
  const [done, setDone] = useState<string[]>([]);
  const [publish, setPublish] = useState(false);
  return (
    <Screen title="Your audit result" subtitle="Tails & Trails Andheri · private to you">
      <NoticeBanner icon="leaf" title="Preview · planned for P1" body="What a day-care owner sees after the free audit." />
      <Card tone="brand">
        <Text variant="label">Private result</Text>
        <Text variant="h1">B · 76</Text>
        <Text variant="caption">No red-line failures. You have 30 days to fix items before a re-check.</Text>
      </Card>
      <SectionHeader title="Fix list" />
      <Card>
        {FIXES.map((f) => <Checkbox key={f} label={f} checked={done.includes(f)} onChange={(v) => setDone((d) => (v ? [...d, f] : d.filter((x) => x !== f)))} />)}
      </Card>
      <Card>
        <KeyValue k="Registration status" v="Declared (not yet verified)" />
        <KeyValue k="Health findings" v="Vet sign-off pending" tone="alert" />
        <KeyValue k="Auditor" v="Two-person review, 28 Sep 2026" />
      </Card>
      <Card>
        <Toggle label="Publish my grade" value={publish} onChange={setPublish} />
        <Text variant="small" tone="muted">Only you decide. Publishing gives a free certificate with a QR code to your live score, valid 3 months. It is not a government approval.</Text>
      </Card>
    </Screen>
  );
}
