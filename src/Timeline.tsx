'use client';

import { CardTimeline, type CardTimelineProps } from './layouts/CardTimeline';
import { CareerTimeline, type CareerTimelineProps } from './layouts/CareerTimeline';
import { ChangelogTimeline, type ChangelogTimelineProps } from './layouts/ChangelogTimeline';
import { CustomTimeline, type CustomTimelineProps } from './layouts/CustomTimeline';
import { FeedTimeline, type FeedTimelineProps } from './layouts/FeedTimeline';
import { GanttTimeline, type GanttTimelineProps } from './layouts/GanttTimeline';
import { HistoryTimeline, type HistoryTimelineProps } from './layouts/HistoryTimeline';
import { HorizontalTimeline, type HorizontalTimelineProps } from './layouts/HorizontalTimeline';
import { MinimalTimeline, type MinimalTimelineProps } from './layouts/MinimalTimeline';
import { RoadmapTimeline, type RoadmapTimelineProps } from './layouts/RoadmapTimeline';
import { StepperTimeline, type StepperTimelineProps } from './layouts/StepperTimeline';
import { StoryTimeline, type StoryTimelineProps } from './layouts/StoryTimeline';
import { VerticalTimeline, type VerticalTimelineProps } from './layouts/VerticalTimeline';
import { ZigzagTimeline, type ZigzagTimelineProps } from './layouts/ZigzagTimeline';
import { warnOnce } from './core/env';

export type TimelineVariant =
  | 'vertical'
  | 'alternating'
  | 'horizontal'
  | 'roadmap'
  | 'gantt'
  | 'career'
  | 'history'
  | 'changelog'
  | 'story'
  | 'minimal'
  | 'cards'
  | 'zigzag'
  | 'stepper'
  | 'feed'
  | 'custom';

/** Every built-in layout (all variants except `custom`). Handy for runtime layout switchers. */
export type LayoutVariant = Exclude<TimelineVariant, 'custom'>;

/**
 * Props for `<Timeline>`, discriminated by `variant` so each variant's own options autocomplete.
 */
export type TimelineProps<TData = unknown> =
  | ({ variant?: 'vertical' } & VerticalTimelineProps<TData>)
  | ({ variant: 'alternating' } & Omit<VerticalTimelineProps<TData>, 'align'>)
  | ({ variant: 'horizontal' } & HorizontalTimelineProps<TData>)
  | ({ variant: 'roadmap' } & RoadmapTimelineProps<TData>)
  | ({ variant: 'gantt' } & GanttTimelineProps<TData>)
  | ({ variant: 'career' } & CareerTimelineProps<TData>)
  | ({ variant: 'history' } & HistoryTimelineProps<TData>)
  | ({ variant: 'changelog' } & ChangelogTimelineProps<TData>)
  | ({ variant: 'story' } & StoryTimelineProps<TData>)
  | ({ variant: 'minimal' } & MinimalTimelineProps<TData>)
  | ({ variant: 'cards' } & CardTimelineProps<TData>)
  | ({ variant: 'zigzag' } & ZigzagTimelineProps<TData>)
  | ({ variant: 'stepper' } & StepperTimelineProps<TData>)
  | ({ variant: 'feed' } & FeedTimelineProps<TData>)
  | ({ variant: 'custom' } & CustomTimelineProps<TData>);

/**
 * One component for every layout. Convenient for playgrounds and apps that switch layouts at
 * runtime. If you only need one layout, import it directly (e.g. `VerticalTimeline`) so your
 * bundler can drop the others.
 *
 * @example
 * <Timeline events={events} variant="alternating" animation="reveal" />
 */
export function Timeline<TData = unknown>(props: TimelineProps<TData>) {
  switch (props.variant) {
    case undefined:
    case 'vertical':
      return <VerticalTimeline {...props} />;
    case 'alternating':
      return <VerticalTimeline {...props} align="alternate" />;
    case 'horizontal':
      return <HorizontalTimeline {...props} />;
    case 'roadmap':
      return <RoadmapTimeline {...props} />;
    case 'gantt':
      return <GanttTimeline {...props} />;
    case 'career':
      return <CareerTimeline {...props} />;
    case 'history':
      return <HistoryTimeline {...props} />;
    case 'changelog':
      return <ChangelogTimeline {...props} />;
    case 'story':
      return <StoryTimeline {...props} />;
    case 'minimal':
      return <MinimalTimeline {...props} />;
    case 'cards':
      return <CardTimeline {...props} />;
    case 'zigzag':
      return <ZigzagTimeline {...props} />;
    case 'stepper':
      return <StepperTimeline {...props} />;
    case 'feed':
      return <FeedTimeline {...props} />;
    case 'custom':
      return <CustomTimeline {...props} />;
    default: {
      const unknown = (props as { variant?: unknown }).variant;
      warnOnce(`Unknown variant "${String(unknown)}". Falling back to "vertical".`);
      return <VerticalTimeline {...(props as VerticalTimelineProps<TData>)} />;
    }
  }
}
