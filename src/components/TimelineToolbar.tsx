'use client';

import { cx } from '../core/env';
import type { TimelineFilterOptions, TimelineGroup, TimelineLabels, TimelineSearchOptions } from '../types';
import type { TimelineController } from '../hooks/useTimeline';
import { CloseIcon, SearchIcon } from './icons';

export interface TimelineToolbarProps<TData = unknown> {
  controller: TimelineController<TData>;
  labels: TimelineLabels;
  idPrefix: string;
  search?: boolean | TimelineSearchOptions;
  filters?: boolean | TimelineFilterOptions;
  jumpTo?: boolean;
  onJump?: (group: TimelineGroup<TData>) => void;
  className?: string;
}

/** Search field, category chips and a "jump to" strip. Rendered automatically by the layouts. */
export function TimelineToolbar<TData>({
  controller,
  labels,
  idPrefix,
  search,
  filters,
  jumpTo,
  onJump,
  className,
}: TimelineToolbarProps<TData>) {
  const searchOpts = typeof search === 'object' ? search : {};
  const filterOpts = typeof filters === 'object' ? filters : {};
  const categories = filterOpts.categories ?? controller.categories;
  const jumpGroups = jumpTo ? controller.groups.filter((g) => g.label && g.items.length) : [];
  const inputId = `${idPrefix}-search`;

  return (
    <div className={cx('m2t-toolbar', className)}>
      {(search || (filters && categories.length > 0)) && (
        <div className="m2t-toolbar__row">
          {search && (
            <div className="m2t-search" role="search">
              <label htmlFor={inputId} className="m2t-sr">
                {searchOpts.label ?? labels.search}
              </label>
              <SearchIcon className="m2t-search__icon" />
              <input
                id={inputId}
                type="search"
                className="m2t-search__input"
                value={controller.query}
                placeholder={searchOpts.placeholder ?? labels.searchPlaceholder}
                autoComplete="off"
                onChange={(e) => controller.setQuery(e.target.value)}
              />
              {controller.query && (
                <button
                  type="button"
                  className="m2t-search__clear"
                  aria-label={labels.clearFilters}
                  onClick={() => controller.setQuery('')}
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}
          {filters && categories.length > 0 && (
            <div className="m2t-chips" role="group" aria-label={filterOpts.label ?? labels.filterBy}>
              <button
                type="button"
                className="m2t-chip"
                aria-pressed={controller.selectedCategories.length === 0}
                onClick={() => controller.setSelectedCategories([])}
              >
                {labels.allCategories}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="m2t-chip"
                  aria-pressed={controller.selectedCategories.includes(category)}
                  onClick={() => controller.toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
          <p className="m2t-count" aria-live="polite">
            {labels.results(controller.filtered.length, controller.items.length)}
          </p>
        </div>
      )}
      {jumpGroups.length > 1 && (
        <nav className="m2t-jump" aria-label={labels.jumpTo}>
          <ul>
            {jumpGroups.map((group) => (
              <li key={group.key}>
                <button type="button" className="m2t-jump__item" onClick={() => onJump?.(group)}>
                  {group.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
