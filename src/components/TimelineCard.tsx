'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../core/env';
import type { TimelineItem } from '../types';
import { hasDetails, isInteractive, makeRenderContext, useTimelineConfig } from './context';
import {
  AvatarGroup,
  BadgeList,
  ChangeList,
  Details,
  LinksAndActions,
  Media,
  MetaList,
  InlineProgress,
  StatusBadge,
  TimelineDate,
  TimelineTitle,
} from './parts';

export type TimelineCardPart =
  'image' | 'date' | 'status' | 'subtitle' | 'description' | 'progress' | 'meta' | 'people' | 'changes' | 'badges' | 'links' | 'details';

export interface TimelineCardProps {
  item: TimelineItem;
  /** Position in the displayed list. */
  index: number;
  total?: number;
  active?: boolean;
  expanded?: boolean;
  /** Parts to omit. */
  hide?: ReadonlyArray<TimelineCardPart>;
  /** Visually hide the in-card date (still announced) — used when the layout shows it elsewhere. */
  dateVisuallyHidden?: boolean;
  /** Extra content rendered above the title. */
  eyebrow?: ReactNode;
  /** Extra content rendered after the body (before links/actions). */
  children?: ReactNode;
  /** Render the image inside the body (`inline`) or edge-to-edge on top (`cover`). @default 'cover' */
  imagePlacement?: 'cover' | 'inline' | 'none';
  /** Heading level override for the title. */
  titleLevel?: 2 | 3 | 4 | 5 | 6;
  /** Let the title button cover the whole card. @default true */
  stretch?: boolean;
  className?: string;
  as?: 'article' | 'div';
}

/**
 * The default event card. Renders every field that is present on the event; layouts hide parts
 * that they display differently. Supply `renderEvent` on the timeline to replace the body.
 */
export function TimelineCard({
  item,
  index,
  total = 0,
  active = false,
  expanded = false,
  hide,
  dateVisuallyHidden,
  eyebrow,
  children,
  imagePlacement = 'cover',
  titleLevel,
  stretch = true,
  className,
  as: Tag = 'article',
}: TimelineCardProps) {
  const config = useTimelineConfig();
  const { event } = item;
  const hidden = (part: TimelineCardPart) => hide?.includes(part) ?? false;
  const interactive = isInteractive(item, config);
  const style = event.color ? ({ '--m2t-item-accent': event.color } as CSSProperties) : undefined;

  const common = {
    className: cx('m2t-card', config.classNames.card, className),
    'data-status': item.status,
    'data-active': active ? '' : undefined,
    'data-highlight': event.highlight ? '' : undefined,
    'data-interactive': interactive ? '' : undefined,
    'data-expanded': expanded ? '' : undefined,
    'data-disabled': event.disabled ? '' : undefined,
    style,
  };

  if (config.renderEvent) {
    return (
      <Tag {...common} className={cx(common.className, 'm2t-card--custom')}>
        {config.renderEvent(event, makeRenderContext(item, index, total, active, expanded, config))}
      </Tag>
    );
  }

  const showImage = event.image && imagePlacement !== 'none' && !hidden('image');
  const showStatus = item.status && !hidden('status');
  const showDate = !hidden('date');

  return (
    <Tag {...common}>
      {showImage && imagePlacement === 'cover' ? <Media image={event.image!} className="m2t-card__cover" /> : null}
      <div className="m2t-card__body">
        {(showDate || showStatus || eyebrow) && (
          <div className="m2t-card__eyebrow">
            {eyebrow}
            {showDate && <TimelineDate item={item} index={index} total={total} className={cx(dateVisuallyHidden && 'm2t-date--sr')} />}
            {showStatus && <StatusBadge status={item.status!} />}
          </div>
        )}
        <TimelineTitle item={item} index={index} expanded={expanded} level={titleLevel} stretch={stretch} />
        {event.subtitle && !hidden('subtitle') ? <p className="m2t-card__subtitle">{event.subtitle}</p> : null}
        {showImage && imagePlacement === 'inline' ? <Media image={event.image!} className="m2t-card__media" /> : null}
        {event.description && !hidden('description') ? <div className="m2t-card__description">{event.description}</div> : null}
        {item.progress !== undefined && !hidden('progress') ? <InlineProgress value={item.progress} /> : null}
        {!hidden('meta') && <MetaList meta={event.meta} location={event.location} />}
        {event.people?.length && !hidden('people') ? <AvatarGroup people={event.people} /> : null}
        {event.changes?.length && !hidden('changes') ? <ChangeList changes={event.changes} /> : null}
        {!hidden('badges') && <BadgeList badges={event.badges} tags={event.tags} />}
        {children}
        {hasDetails(item) && !hidden('details') ? (
          config.expandable ? (
            <Details item={item} open={expanded} />
          ) : (
            <div className="m2t-card__details">{event.details}</div>
          )
        ) : null}
        {!hidden('links') && <LinksAndActions item={item} links={event.links} actions={event.actions} />}
      </div>
    </Tag>
  );
}
