'use client';

import { VerticalTimeline, type TimelineEvent } from 'm2timeline-motion';

export function ReleaseTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <VerticalTimeline
      events={events}
      onEventClick={(event) => console.log('Opened release', event.id)}
      formatDate={(date) => date.toLocaleDateString('en-GB', { timeZone: 'UTC' })}
    />
  );
}
