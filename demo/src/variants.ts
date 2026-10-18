import type { LayoutVariant } from 'm2timeline-motion';
import type { DatasetKey } from './data';
import type { IconName, Pastel } from './icons';

/** Gallery filters, mapped to what each layout actually does. */
export const CATEGORIES = ['Vertical', 'Horizontal', 'Planning', 'Step-based', 'Editorial', 'Compact'] as const;
export type Category = (typeof CATEGORIES)[number];

export type OptionDef =
  | { key: string; label: string; type: 'select'; options: Array<string | number>; default: string | number }
  | { key: string; label: string; type: 'toggle'; default: boolean };

export interface VariantInfo {
  id: LayoutVariant;
  name: string;
  component: string;
  tagline: string;
  useFor: string;
  dataset: DatasetKey;
  /** Realistic scenario shown in the gallery preview. */
  scenario: string;
  categories: Category[];
  icon: IconName;
  tone: Pastel;
  options: OptionDef[];
  /** Props the gallery card adds to look its best. */
  galleryProps?: Record<string, unknown>;
}

export const variantInfo: VariantInfo[] = [
  {
    id: 'vertical',
    name: 'Vertical',
    component: 'VerticalTimeline',
    tagline: 'The classic: a single line with cards on the left or right.',
    useFor: 'Company milestones, docs, about pages',
    dataset: 'pipeline',
    scenario: 'CI/CD deployment pipeline',
    categories: ['Vertical'],
    icon: 'vertical',
    tone: 'purple',
    options: [
      { key: 'align', label: 'Align', type: 'select', options: ['left', 'right'], default: 'left' },
      { key: 'datePlacement', label: 'Date placement', type: 'select', options: ['card', 'opposite'], default: 'card' },
    ],
  },
  {
    id: 'alternating',
    name: 'Alternating',
    component: 'VerticalTimeline',
    tagline: 'Cards zig-zag around a centred line, dates on the opposite side.',
    useFor: 'Histories, landing pages, portfolios',
    dataset: 'space',
    scenario: 'Space exploration history',
    categories: ['Vertical', 'Editorial'],
    icon: 'alternating',
    tone: 'pink',
    options: [{ key: 'startSide', label: 'First card', type: 'select', options: ['right', 'left'], default: 'right' }],
    galleryProps: { groupBy: 'group' },
  },
  {
    id: 'horizontal',
    name: 'Horizontal',
    component: 'HorizontalTimeline',
    tagline: 'Scroll-snapping track with prev/next, drag, keyboard and touch.',
    useFor: 'Release trains, hero sections, compact overviews',
    dataset: 'orders',
    scenario: 'Order tracking',
    categories: ['Horizontal'],
    icon: 'horizontal',
    tone: 'blue',
    options: [
      { key: 'cardPosition', label: 'Cards', type: 'select', options: ['below', 'above', 'alternate'], default: 'below' },
      { key: 'startAt', label: 'Start at', type: 'select', options: ['start', 'current', 'end'], default: 'start' },
      { key: 'dragToScroll', label: 'Drag to scroll', type: 'toggle', default: true },
    ],
    galleryProps: { startAt: 'current' },
  },
  {
    id: 'roadmap',
    name: 'Roadmap',
    component: 'RoadmapTimeline',
    tagline: 'Quarter or phase lanes with completion, plus an overview track and “Now”.',
    useFor: 'Public roadmaps, planning, OKRs',
    dataset: 'roadmap',
    scenario: 'Product roadmap',
    categories: ['Planning'],
    icon: 'roadmap',
    tone: 'blue',
    options: [{ key: 'showOverview', label: 'Overview track', type: 'toggle', default: true }],
  },
  {
    id: 'gantt',
    name: 'Gantt / project',
    component: 'GanttTimeline',
    tagline: 'Phases, task bars with progress, milestones, owners and a today line.',
    useFor: 'Project plans, delivery schedules',
    dataset: 'project',
    scenario: 'Website redesign plan',
    categories: ['Planning'],
    icon: 'gantt',
    tone: 'orange',
    options: [
      { key: 'scale', label: 'Scale', type: 'select', options: ['auto', 'day', 'week', 'month', 'quarter'], default: 'auto' },
      { key: 'showPeople', label: 'Owners', type: 'toggle', default: true },
    ],
  },
  {
    id: 'career',
    name: 'Career',
    component: 'CareerTimeline',
    tagline: 'Roles nested under companies with tenure — promotions at a glance.',
    useFor: 'Résumés, portfolios, team bios',
    dataset: 'career',
    scenario: 'Engineering career',
    categories: ['Vertical', 'Editorial'],
    icon: 'career',
    tone: 'pink',
    options: [{ key: 'showDuration', label: 'Durations', type: 'toggle', default: true }],
  },
  {
    id: 'history',
    name: 'History',
    component: 'HistoryTimeline',
    tagline: 'Editorial eras with pinned headings, large media and serif type.',
    useFor: 'Company history, museums, long reads',
    dataset: 'space',
    scenario: 'Space exploration eras',
    categories: ['Editorial'],
    icon: 'history',
    tone: 'yellow',
    options: [{ key: 'stickyLabels', label: 'Sticky headings', type: 'toggle', default: true }],
  },
  {
    id: 'changelog',
    name: 'Changelog',
    component: 'ChangelogTimeline',
    tagline: 'Versions pinned aside, grouped changes and automatic Major/Minor/Patch.',
    useFor: 'Release notes, product updates',
    dataset: 'releases',
    scenario: 'Product release notes',
    categories: ['Vertical'],
    icon: 'changelog',
    tone: 'green',
    options: [
      { key: 'showBump', label: 'Detect bumps', type: 'toggle', default: true },
      { key: 'showLatest', label: '“Latest” badge', type: 'toggle', default: true },
    ],
  },
  {
    id: 'story',
    name: 'Story',
    component: 'StoryTimeline',
    tagline: 'Scrollytelling chapters with a chapter navigator and reading progress.',
    useFor: 'Brand stories, case studies, annual reports',
    dataset: 'story',
    scenario: 'Product launch story',
    categories: ['Editorial'],
    icon: 'story',
    tone: 'purple',
    options: [
      { key: 'mediaPosition', label: 'Media', type: 'select', options: ['alternate', 'left', 'right'], default: 'alternate' },
      { key: 'showNavigation', label: 'Chapter nav', type: 'toggle', default: true },
      { key: 'showProgress', label: 'Progress bar', type: 'toggle', default: true },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    component: 'MinimalTimeline',
    tagline: 'Typographic and quiet: a date column, a hairline and text.',
    useFor: 'Professional sites, CVs, footnotes',
    dataset: 'company',
    scenario: 'Company milestones',
    categories: ['Vertical', 'Compact'],
    icon: 'minimal',
    tone: 'blue',
    options: [],
  },
  {
    id: 'cards',
    name: 'Cards',
    component: 'CardTimeline',
    tagline: 'A responsive grid of rich cards joined by a timeline axis.',
    useFor: 'Events, case studies, media-rich updates',
    dataset: 'company',
    scenario: 'Company milestones',
    categories: ['Horizontal'],
    icon: 'cards',
    tone: 'orange',
    options: [{ key: 'minCardWidth', label: 'Min card width', type: 'select', options: ['15rem', '17rem', '20rem'], default: '17rem' }],
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    component: 'ZigzagTimeline',
    tagline: 'A serpentine path with rounded turns that snakes across rows.',
    useFor: 'Journeys, processes, infographics',
    dataset: 'workflow',
    scenario: 'Content workflow',
    categories: ['Horizontal', 'Step-based'],
    icon: 'zigzag',
    tone: 'green',
    options: [{ key: 'columns', label: 'Columns', type: 'select', options: [2, 3, 4], default: 3 }],
  },
  {
    id: 'stepper',
    name: 'Stepper',
    component: 'StepperTimeline',
    tagline: 'Numbered stages with animated fill and a pulsing current step.',
    useFor: 'Onboarding, order tracking, wizards',
    dataset: 'onboarding',
    scenario: 'Account onboarding',
    categories: ['Step-based', 'Compact'],
    icon: 'stepper',
    tone: 'purple',
    options: [
      { key: 'orientation', label: 'Orientation', type: 'select', options: ['horizontal', 'vertical'], default: 'horizontal' },
      { key: 'showSummary', label: 'Summary', type: 'toggle', default: true },
    ],
  },
  {
    id: 'feed',
    name: 'Activity feed',
    component: 'FeedTimeline',
    tagline: 'Dense rows, icon markers, relative times and day headings.',
    useFor: 'Dashboards, audit logs, notifications',
    dataset: 'activity',
    scenario: 'Team activity feed',
    categories: ['Vertical', 'Compact'],
    icon: 'feed',
    tone: 'yellow',
    options: [{ key: 'relativeTime', label: 'Relative times', type: 'toggle', default: true }],
  },
];

export const variantById = Object.fromEntries(variantInfo.map((v) => [v.id, v])) as Record<LayoutVariant, VariantInfo>;
