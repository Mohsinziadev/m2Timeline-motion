import { ChangelogTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const releases: TimelineEvent[] = [
  {
    id: '3.2.0',
    version: '3.2.0',
    title: 'Workflow automations',
    date: '2026-10-12',
    changes: [
      { type: 'added', text: 'Visual workflow builder' },
      { type: 'fixed', text: 'Timezone offset in scheduled reports' },
    ],
  },
  { id: '3.1.2', version: '3.1.2', title: 'Stability fixes', date: '2026-09-18', changes: [{ type: 'fixed', text: 'CSV export crash' }] },
];

export function Changelog() {
  return <ChangelogTimeline events={releases} />;
}
