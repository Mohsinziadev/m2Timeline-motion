import { GanttTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const plan: TimelineEvent[] = [
  {
    id: 'research',
    title: 'Stakeholder interviews',
    group: 'Discovery',
    date: '2026-09-01',
    endDate: '2026-09-12',
    status: 'completed',
    people: [{ name: 'Ava Chen' }],
  },
  { id: 'design', title: 'Visual design', group: 'Design', date: '2026-09-15', endDate: '2026-10-10', status: 'completed' },
  { id: 'build', title: 'Component library', group: 'Build', date: '2026-10-08', endDate: '2026-11-01', status: 'current', progress: 55 },
  { id: 'launch', title: 'Go live', group: 'Launch', date: '2026-11-20', status: 'upcoming' },
];

export function ProjectPlan() {
  // Pass `today` from the server for a fully deterministic SSR render.
  return <GanttTimeline events={plan} />;
}
