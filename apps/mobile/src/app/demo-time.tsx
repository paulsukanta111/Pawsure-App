// Demo time: move the simulated clock so check-ins, misses and alerts happen on cue.
// Lives under Me → Demo time so the Today screen looks like the real app.
import { Card, Screen, Text } from '../design';
import { DemoClock } from '../proto/DemoClock';
import { fmt, useProto } from '../proto/store';

export default function DemoTime() {
  const { now } = useProto();
  return (
    <Screen>
      <Text variant="h3">It's {fmt(now)} in the demo</Text>
      <Text variant="caption" tone="muted">Jump ahead to see check-ins arrive, tasks go missed and alerts fire. Only this device's demo day changes.</Text>
      <DemoClock compact />
      <Card>
        <Text variant="label">Good moments to try</Text>
        <Text variant="caption">3:45 pm: lunch and the walk have check-ins.</Text>
        <Text variant="caption">5:15 pm: the walk is overdue and you get an alert.</Text>
        <Text variant="caption">7:30 pm: the toilet pad is missed.</Text>
      </Card>
    </Screen>
  );
}
