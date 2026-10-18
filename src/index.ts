/**
 * m2timeline-motion — motion-rich, accessible React timelines.
 *
 * Import the stylesheet once:  import 'm2timeline-motion/styles.css';
 */

// All-in-one component
export { Timeline } from './Timeline';
export type { TimelineProps, TimelineVariant, LayoutVariant } from './Timeline';

// Layouts (import individually for the smallest bundles)
export { VerticalTimeline } from './layouts/VerticalTimeline';
export type { VerticalTimelineProps } from './layouts/VerticalTimeline';
export { HorizontalTimeline } from './layouts/HorizontalTimeline';
export type { HorizontalTimelineProps } from './layouts/HorizontalTimeline';
export { RoadmapTimeline } from './layouts/RoadmapTimeline';
export type { RoadmapTimelineProps } from './layouts/RoadmapTimeline';
export { GanttTimeline } from './layouts/GanttTimeline';
export type { GanttTimelineProps, GanttScale } from './layouts/GanttTimeline';
export { CareerTimeline } from './layouts/CareerTimeline';
export type { CareerTimelineProps } from './layouts/CareerTimeline';
export { HistoryTimeline } from './layouts/HistoryTimeline';
export type { HistoryTimelineProps } from './layouts/HistoryTimeline';
export { ChangelogTimeline } from './layouts/ChangelogTimeline';
export type { ChangelogTimelineProps } from './layouts/ChangelogTimeline';
export { StoryTimeline } from './layouts/StoryTimeline';
export type { StoryTimelineProps } from './layouts/StoryTimeline';
export { MinimalTimeline } from './layouts/MinimalTimeline';
export type { MinimalTimelineProps } from './layouts/MinimalTimeline';
export { CardTimeline } from './layouts/CardTimeline';
export type { CardTimelineProps } from './layouts/CardTimeline';
export { ZigzagTimeline } from './layouts/ZigzagTimeline';
export type { ZigzagTimelineProps } from './layouts/ZigzagTimeline';
export { StepperTimeline } from './layouts/StepperTimeline';
export type { StepperTimelineProps } from './layouts/StepperTimeline';
export { FeedTimeline } from './layouts/FeedTimeline';
export type { FeedTimelineProps } from './layouts/FeedTimeline';
export { CustomTimeline } from './layouts/CustomTimeline';
export type { CustomTimelineProps, CustomItemContext } from './layouts/CustomTimeline';

// Building blocks for custom layouts
export { TimelineFrame, itemAttrs } from './components/TimelineFrame';
export type { TimelineFrameProps } from './components/TimelineFrame';
export { TimelineCard } from './components/TimelineCard';
export type { TimelineCardProps, TimelineCardPart } from './components/TimelineCard';
export { TimelineMarker } from './components/TimelineMarker';
export type { TimelineMarkerProps } from './components/TimelineMarker';
export { TimelineToolbar } from './components/TimelineToolbar';
export type { TimelineToolbarProps } from './components/TimelineToolbar';
export {
  TimelineDate,
  TimelineTitle,
  StatusBadge,
  Badge,
  InlineProgress,
  AvatarGroup,
  MetaList,
  ChangeList,
  Media,
  Details,
  LinksAndActions,
  VisuallyHidden,
} from './components/parts';
export type { TimelineDateProps, TimelineTitleProps, InlineProgressProps } from './components/parts';
export { useTimelineConfig, getDateText } from './components/context';
export type { TimelineConfig } from './components/context';

// Progress components
export { ProgressBar } from './progress/ProgressBar';
export type {
  ProgressBarProps,
  ProgressBarVariant,
  ProgressBarStatus,
  ProgressValuePosition,
  ProgressMilestone,
} from './progress/ProgressBar';
export { CircularProgress } from './progress/CircularProgress';
export type { CircularProgressProps } from './progress/CircularProgress';
export { SegmentedProgress } from './progress/SegmentedProgress';
export type { SegmentedProgressProps, ProgressSegment, SegmentStatus } from './progress/SegmentedProgress';
export { StepProgress } from './progress/StepProgress';
export type { StepProgressProps, ProgressStep, StepStatus } from './progress/StepProgress';
export type { ProgressBaseProps, ProgressTone, ProgressSize } from './progress/shared';

// Hooks
export { useTimeline } from './hooks/useTimeline';
export type { UseTimelineOptions, TimelineController, ActiveSource } from './hooks/useTimeline';
export { useNow, useReducedMotion } from './hooks/utils';

// Pure utilities (safe to call from React Server Components)
export { parseDate, formatParsedDate, formatRelative } from './core/date';
export { resolveEvents, sortItems, filterItems, groupItems } from './core/resolve';
export { detectBump, parseVersion } from './core/semver';
export type { VersionBump } from './core/semver';
export { defaultLabels } from './core/labels';

// Types
export type * from './types';
