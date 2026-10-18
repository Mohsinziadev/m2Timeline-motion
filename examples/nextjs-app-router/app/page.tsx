// app/page.tsx — a React Server Component. No 'use client' needed here:
// every timeline component is already a client component, and the data is plain serialisable JSON.
import { ChangelogTimeline, type TimelineEvent } from 'm2timeline-motion';
import { ReleaseTimeline } from './release-timeline';

async function getReleases(): Promise<TimelineEvent[]> {
  // e.g. `await fetch('https://api.example.com/releases', { next: { revalidate: 3600 } })`
  return [
    { id: '2.1.0', version: '2.1.0', title: 'Dark mode', date: '2026-10-01', changes: [{ type: 'added', text: 'System theme' }] },
    { id: '2.0.0', version: '2.0.0', title: 'New API', date: '2026-08-12', changes: [{ type: 'breaking', text: 'v1 removed' }] },
  ];
}

export default async function Page() {
  const releases = await getReleases();
  return (
    <main>
      {/* Serialisable props only → render directly from the server component */}
      <ChangelogTimeline events={releases} />
      {/* Function props (callbacks, render functions) → wrap in your own client component */}
      <ReleaseTimeline events={releases} />
    </main>
  );
}
