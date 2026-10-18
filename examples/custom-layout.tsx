import { CustomTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const sprints: TimelineEvent[] = [
  { id: 's1', title: 'Sprint 1 — Foundations', date: '2026-09-01', status: 'completed', progress: 100 },
  { id: 's2', title: 'Sprint 2 — Editor', date: '2026-09-15', status: 'completed', progress: 100 },
  { id: 's3', title: 'Sprint 3 — Collaboration', date: '2026-09-29', status: 'current', progress: 45 },
  { id: 's4', title: 'Sprint 4 — Polish', date: '2026-10-13', status: 'upcoming' },
];

/** Bring your own markup: the engine still handles ordering, search, expansion, motion and theming. */
export function SprintBoard() {
  return (
    <CustomTimeline
      events={sprints}
      search
      listClassName="sprint-grid"
      renderItem={(item, { parts, isActive }) => (
        <div className={isActive ? 'sprint sprint--active' : 'sprint'}>
          <div className="sprint__head">
            {parts.marker}
            {parts.date}
          </div>
          {parts.title}
          <progress max={100} value={item.progress ?? 0} aria-label={`${item.progress ?? 0}% complete`} />
        </div>
      )}
    />
  );
}
