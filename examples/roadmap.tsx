import { RoadmapTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const roadmap: TimelineEvent[] = [
  { id: 'sso', title: 'SSO & SCIM provisioning', date: '2026-01-20', status: 'completed', category: 'Enterprise' },
  { id: 'workflows', title: 'Workflow builder', date: '2026-08-10', status: 'current', progress: 65, category: 'Product' },
  { id: 'mobile', title: 'Mobile apps', date: '2026-09-01', status: 'delayed', progress: 35, category: 'Product' },
  { id: 'api', title: 'Public API v2', date: '2026-12-15', status: 'upcoming', category: 'Platform' },
];

export function Roadmap() {
  return <RoadmapTimeline events={roadmap} search filters />;
}
