import { Timeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const events: TimelineEvent[] = [
  { id: 1, title: 'Company founded', date: '2018-03', description: 'Two founders and a big idea.' },
  { id: 2, title: 'First 100 customers', date: '2019-11', status: 'completed' },
  { id: 3, title: 'Series A', date: '2023-04', highlight: true, details: 'Led by Atlas Partners.' },
  { id: 4, title: 'Global launch', date: '2026-06', status: 'current', progress: 60 },
];

export function QuickStart() {
  return <Timeline events={events} variant="alternating" animation="reveal" />;
}
