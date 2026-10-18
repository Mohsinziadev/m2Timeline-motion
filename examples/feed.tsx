import { FeedTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const activity: TimelineEvent[] = [
  { id: 1, icon: '🚀', title: 'Maya deployed web@4.12.0', date: '2026-10-18T09:12:00Z', status: 'completed', category: 'Deploys' },
  { id: 2, icon: '💬', title: 'Leo commented on “Q4 pricing”', date: '2026-10-18T08:01:00Z', category: 'Comments' },
  { id: 3, icon: '⚠️', title: 'Error rate above 2% on checkout-api', date: '2026-10-17T22:40:00Z', status: 'blocked', category: 'Alerts' },
];

export function Activity() {
  return <FeedTimeline events={activity} order="desc" pageSize={20} filters />;
}
