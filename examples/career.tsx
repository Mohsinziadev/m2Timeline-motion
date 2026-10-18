import { CareerTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const career: TimelineEvent[] = [
  { id: 'staff', title: 'Staff Engineer', group: 'Lumen Health', date: '2023-04', endDate: 'present', location: 'Remote' },
  { id: 'senior', title: 'Senior Engineer', group: 'Lumen Health', date: '2021-01', endDate: '2023-03' },
  {
    id: 'swe',
    title: 'Software Engineer',
    group: 'Bright Commerce',
    subtitle: 'Bright Commerce',
    date: '2018-06',
    endDate: '2020-12',
    tags: ['Node.js'],
  },
];

export function Experience() {
  return <CareerTimeline events={career} />;
}
