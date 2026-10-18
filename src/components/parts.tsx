'use client';

import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { toISO } from '../core/date';
import { cx } from '../core/env';
import type {
  TimelineAction,
  TimelineBadge,
  TimelineChange,
  TimelineChangeType,
  TimelineItem,
  TimelineLink,
  TimelineMedia,
  TimelineMetaItem,
  TimelinePerson,
  TimelineStatus,
  TimelineTone,
} from '../types';
import { detailsId, getDateText, hasDetails, isInteractive, makeRenderContext, useTimelineConfig } from './context';
import { AlertIcon, CheckIcon, ChevronDownIcon, ClockIcon, CloseIcon, ExternalIcon, PinIcon } from './icons';

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="m2t-sr">{children}</span>;
}

/* ---- date ------------------------------------------------------------------------------------ */

export interface TimelineDateProps {
  item: TimelineItem;
  index?: number;
  total?: number;
  className?: string;
  /** Render as `aria-hidden` (when the same date is announced elsewhere). */
  decorative?: boolean;
}

export function TimelineDate({ item, index = item.index, total = 0, className, decorative }: TimelineDateProps) {
  const config = useTimelineConfig();
  const { event } = item;
  let content: ReactNode;
  if (config.renderDate) {
    content = config.renderDate(event, makeRenderContext(item, index, total, false, false, config));
  } else if (event.dateLabel !== undefined && event.dateLabel !== null) {
    content = event.dateLabel;
  } else {
    content = getDateText(item, config);
  }
  if (content === '' || content === null || content === undefined) return null;
  const cls = cx('m2t-date', config.classNames.date, className);
  const hidden = decorative ? true : undefined;
  return item.start ? (
    <time className={cls} dateTime={toISO(item.start)} aria-hidden={hidden}>
      {content}
    </time>
  ) : (
    <span className={cls} aria-hidden={hidden}>
      {content}
    </span>
  );
}

/* ---- status ---------------------------------------------------------------------------------- */

export function StatusIcon({ status }: { status: TimelineStatus | undefined }) {
  switch (status) {
    case 'completed':
      return <CheckIcon />;
    case 'cancelled':
      return <CloseIcon />;
    case 'blocked':
      return <AlertIcon />;
    case 'delayed':
      return <ClockIcon />;
    default:
      return null;
  }
}

export function StatusBadge({ status, className }: { status: TimelineStatus; className?: string }) {
  const { labels } = useTimelineConfig();
  return (
    <span className={cx('m2t-status', className)} data-status={status}>
      <span className="m2t-status__dot" aria-hidden="true" />
      {labels.status[status]}
    </span>
  );
}

/* ---- badges & tags --------------------------------------------------------------------------- */

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: TimelineTone; className?: string }) {
  return (
    <span className={cx('m2t-badge', className)} data-tone={tone}>
      {children}
    </span>
  );
}

export function BadgeList({ badges, tags }: { badges?: Array<TimelineBadge | string>; tags?: string[] }) {
  if (!badges?.length && !tags?.length) return null;
  return (
    <ul className="m2t-badges">
      {badges?.map((b, i) => {
        const badge = typeof b === 'string' ? { label: b } : b;
        return (
          <li key={`b${i}`}>
            <Badge tone={badge.tone ?? 'accent'}>{badge.label}</Badge>
          </li>
        );
      })}
      {tags?.map((tag) => (
        <li key={`t-${tag}`}>
          <span className="m2t-tag">{tag}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---- progress -------------------------------------------------------------------------------- */

export interface InlineProgressProps {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function InlineProgress({ value, label, showValue = true, className, size = 'md' }: InlineProgressProps) {
  const { labels } = useTimelineConfig();
  const v = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div className={cx('m2t-progress', className)} data-size={size}>
      <div
        className="m2t-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        aria-label={label ?? labels.complete(v)}
      >
        <span className="m2t-progress__fill" style={{ '--m2t-progress': v / 100 } as CSSProperties} />
      </div>
      {showValue && (
        <span className="m2t-progress__value" aria-hidden="true">
          {v}%
        </span>
      )}
    </div>
  );
}

/* ---- people ---------------------------------------------------------------------------------- */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Avatar({ person, size = 'md' }: { person: TimelinePerson; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className="m2t-avatar" data-size={size} title={person.role ? `${person.name} · ${person.role}` : person.name}>
      {person.avatar ? (
        <img src={person.avatar} alt="" loading="lazy" decoding="async" />
      ) : (
        <span aria-hidden="true">{initials(person.name)}</span>
      )}
    </span>
  );
}

export function AvatarGroup({ people, max = 4, size = 'md' }: { people: TimelinePerson[]; max?: number; size?: 'sm' | 'md' }) {
  if (!people.length) return null;
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="m2t-avatars">
      <VisuallyHidden>{people.map((p) => (p.role ? `${p.name} (${p.role})` : p.name)).join(', ')}</VisuallyHidden>
      <span className="m2t-avatars__stack" aria-hidden="true">
        {shown.map((p, i) => (
          <Avatar key={`${p.name}-${i}`} person={p} size={size} />
        ))}
        {extra > 0 && (
          <span className="m2t-avatar m2t-avatar--more" data-size={size}>
            +{extra}
          </span>
        )}
      </span>
    </span>
  );
}

/* ---- meta ------------------------------------------------------------------------------------ */

export function MetaList({ meta, location }: { meta?: TimelineMetaItem[]; location?: ReactNode }) {
  const { labels } = useTimelineConfig();
  if (!meta?.length && !location) return null;
  return (
    <dl className="m2t-meta">
      {location ? (
        <div className="m2t-meta__item">
          <dt>
            <PinIcon />
            <VisuallyHidden>{labels.location}</VisuallyHidden>
          </dt>
          <dd>{location}</dd>
        </div>
      ) : null}
      {meta?.map((m, i) => (
        <div className="m2t-meta__item" key={i}>
          <dt>
            {m.icon}
            <span className={m.icon ? 'm2t-sr' : undefined}>{m.label}</span>
          </dt>
          <dd>{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---- changelog entries ----------------------------------------------------------------------- */

const CHANGE_ORDER: TimelineChangeType[] = ['breaking', 'added', 'improved', 'changed', 'fixed', 'deprecated', 'removed', 'security'];

export function ChangeList({ changes, grouped = true }: { changes: TimelineChange[]; grouped?: boolean }) {
  const { labels } = useTimelineConfig();
  if (!changes.length) return null;
  if (!grouped) {
    return (
      <ul className="m2t-changes m2t-changes--flat">
        {changes.map((c, i) => (
          <li key={i} className="m2t-change">
            <span className="m2t-change__type" data-type={c.type}>
              {labels.changeTypes[c.type] ?? c.type}
            </span>
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
    );
  }
  const byType = new Map<TimelineChangeType, TimelineChange[]>();
  for (const c of changes) {
    const list = byType.get(c.type) ?? [];
    list.push(c);
    byType.set(c.type, list);
  }
  const types = [...byType.keys()].sort((a, b) => CHANGE_ORDER.indexOf(a) - CHANGE_ORDER.indexOf(b));
  return (
    <div className="m2t-changes">
      {types.map((type) => (
        <div className="m2t-changes__group" key={type} data-type={type}>
          <p className="m2t-changes__label">
            <span className="m2t-change__type" data-type={type}>
              {labels.changeTypes[type] ?? type}
            </span>
          </p>
          <ul aria-label={labels.changeTypes[type] ?? type}>
            {byType.get(type)!.map((c, i) => (
              <li key={i}>{c.text}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---- media ----------------------------------------------------------------------------------- */

export function toMedia(image: TimelineMedia | string | undefined): TimelineMedia | null {
  if (!image) return null;
  return typeof image === 'string' ? { src: image, alt: '' } : image;
}

export function Media({ image, className, eager }: { image: TimelineMedia | string; className?: string; eager?: boolean }) {
  const media = toMedia(image);
  if (!media) return null;
  return (
    <figure className={cx('m2t-media', className)}>
      <img src={media.src} alt={media.alt} width={media.width} height={media.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  );
}

/* ---- links & actions ------------------------------------------------------------------------- */

function isExternal(link: TimelineLink) {
  return link.external ?? /^https?:\/\//i.test(link.href);
}

export function LinksAndActions({ item, links, actions }: { item: TimelineItem; links?: TimelineLink[]; actions?: TimelineAction[] }) {
  const { labels } = useTimelineConfig();
  if (!links?.length && !actions?.length) return null;
  return (
    <div className="m2t-actions">
      {links?.map((link, i) => {
        const external = isExternal(link);
        return (
          <a key={`l${i}`} className="m2t-link" href={link.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}>
            {link.label}
            {external && (
              <>
                <ExternalIcon />
                <VisuallyHidden> {labels.opensInNewTab}</VisuallyHidden>
              </>
            )}
          </a>
        );
      })}
      {actions?.map((action, i) => {
        const cls = cx('m2t-button', `m2t-button--${action.variant ?? 'secondary'}`);
        const onClick = (e: MouseEvent<HTMLElement>) => action.onClick?.(item.event, e);
        return action.href ? (
          <a key={`a${i}`} className={cls} href={action.href} onClick={onClick} aria-label={action.ariaLabel}>
            {action.icon}
            {action.label}
          </a>
        ) : (
          <button key={`a${i}`} type="button" className={cls} onClick={onClick} aria-label={action.ariaLabel}>
            {action.icon}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- expandable details ---------------------------------------------------------------------- */

export function Details({ item, open, children }: { item: TimelineItem; open: boolean; children?: ReactNode }) {
  const config = useTimelineConfig();
  if (!hasDetails(item) && !children) return null;
  return (
    <div id={detailsId(config, item)} className="m2t-details" data-open={open ? '' : undefined} aria-hidden={!open}>
      <div className="m2t-details__inner">
        <div className="m2t-details__content">{children ?? item.event.details}</div>
      </div>
    </div>
  );
}

/* ---- title / trigger ------------------------------------------------------------------------- */

export interface TimelineTitleProps {
  item: TimelineItem;
  index: number;
  expanded: boolean;
  className?: string;
  /** Stretch the click target over the closest positioned ancestor (the card). @default true */
  stretch?: boolean;
  /** Heading level override (defaults to the timeline's `headingLevel`). */
  level?: 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

/**
 * The event title. Becomes a button (with `aria-expanded` when the event has details) whenever the
 * event is interactive; the button participates in arrow-key navigation.
 */
export function TimelineTitle({ item, index, expanded, className, stretch = true, level, children }: TimelineTitleProps) {
  const config = useTimelineConfig();
  const Heading = `h${level ?? config.headingLevel}` as 'h3';
  const title = children ?? item.event.title;
  const cls = cx('m2t-title', config.classNames.title, className);

  if (!isInteractive(item, config)) {
    return <Heading className={cls}>{title}</Heading>;
  }

  const expandable = config.expandable && hasDetails(item);
  return (
    <Heading className={cls}>
      <button
        type="button"
        className={cx('m2t-trigger', stretch && 'm2t-trigger--stretch')}
        data-m2t-nav=""
        aria-expanded={expandable ? expanded : undefined}
        aria-controls={expandable ? detailsId(config, item) : undefined}
        onClick={(e) => config.activate(item, index, e)}
      >
        <span className="m2t-trigger__text">{title}</span>
        {expandable && (
          <span className="m2t-chevron" aria-hidden="true">
            <ChevronDownIcon />
          </span>
        )}
        {expandable && <VisuallyHidden>{expanded ? `, ${config.labels.collapse}` : `, ${config.labels.expand}`}</VisuallyHidden>}
      </button>
    </Heading>
  );
}
