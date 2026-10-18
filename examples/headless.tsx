import { TimelineCard, TimelineFrame, itemAttrs, useTimeline, type TimelineEvent } from 'm2timeline-motion';

export function Headless({ events }: { events: TimelineEvent[] }) {
  const timeline = useTimeline({ events, order: 'desc' });
  return (
    <TimelineFrame events={events} controller={timeline} layout="kanban" search>
      <ul className="my-columns">
        {timeline.visible.map((item, i) => (
          <li key={item.key} {...itemAttrs(item, i)}>
            <TimelineCard item={item} index={i} expanded={timeline.isExpanded(item.key)} />
          </li>
        ))}
      </ul>
    </TimelineFrame>
  );
}
