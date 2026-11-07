// P3 Staff answers "Show me now" with a 15-second clip within 5 minutes (P1 preview, PS-115).
import { useState } from 'react';
import { Button, Card, IllustrationSlot, NoticeBanner, Screen, Text } from '../../design';

export default function DcShowMe() {
  const [sent, setSent] = useState(false);
  return (
    <Screen title="Show me now" subtitle="Bruno's owner asked at 2:41 pm">
      <NoticeBanner icon="leaf" title="Preview · planned for P1" />
      <Card tone={sent ? 'calm' : 'brand'}>
        <Text variant="h3">{sent ? 'Sent at 2:43 pm' : '3:12 left'}</Text>
        <Text variant="caption">{sent ? 'Logged to the stay record and live score.' : 'Record 15 seconds of Bruno where he is now. No editing, no gallery.'}</Text>
      </Card>
      <IllustrationSlot name="camera viewfinder" height={220} />
      {!sent ? <Button label="Record 15 seconds" icon="search" onPress={() => setSent(true)} full /> : null}
      <Text variant="small" tone="muted">Late or missing replies are also logged.</Text>
    </Screen>
  );
}
