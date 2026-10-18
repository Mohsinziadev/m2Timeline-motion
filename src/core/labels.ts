import type { TimelineLabels } from '../types';

export const defaultLabels: TimelineLabels = {
  region: 'Timeline',
  search: 'Search events',
  searchPlaceholder: 'Search…',
  filterBy: 'Filter by category',
  allCategories: 'All',
  jumpTo: 'Jump to',
  clearFilters: 'Clear filters',
  empty: 'No events to show yet.',
  noResults: 'No events match your search or filters.',
  expand: 'Show details',
  collapse: 'Hide details',
  previous: 'Previous',
  next: 'Next',
  present: 'Present',
  today: 'Today',
  yesterday: 'Yesterday',
  latest: 'Latest',
  now: 'Now',
  location: 'Location',
  chapters: 'Chapters',
  opensInNewTab: '(opens in a new tab)',
  showMore: (remaining) => `Show ${remaining} more`,
  results: (shown, total) => (shown === total ? `${total} events` : `${shown} of ${total} events`),
  roles: (count) => `${count} roles`,
  step: (current, total) => `Step ${current} of ${total}`,
  duration: (years, months) => {
    const parts: string[] = [];
    if (years) parts.push(`${years} yr${years === 1 ? '' : 's'}`);
    if (months) parts.push(`${months} mo${months === 1 ? '' : 's'}`);
    return parts.join(' ') || '1 mo';
  },
  complete: (percent) => `${percent}% complete`,
  status: {
    completed: 'Completed',
    current: 'In progress',
    upcoming: 'Upcoming',
    delayed: 'Delayed',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
  },
  changeTypes: {
    added: 'Added',
    changed: 'Changed',
    improved: 'Improved',
    fixed: 'Fixed',
    removed: 'Removed',
    deprecated: 'Deprecated',
    security: 'Security',
    breaking: 'Breaking',
  },
  versionBump: {
    major: 'Major',
    minor: 'Minor',
    patch: 'Patch',
    prerelease: 'Pre-release',
  },
};

export function resolveLabels(overrides?: Partial<TimelineLabels>): TimelineLabels {
  if (!overrides) return defaultLabels;
  return {
    ...defaultLabels,
    ...overrides,
    status: { ...defaultLabels.status, ...overrides.status },
    changeTypes: { ...defaultLabels.changeTypes, ...overrides.changeTypes },
    versionBump: { ...defaultLabels.versionBump, ...overrides.versionBump },
  };
}
