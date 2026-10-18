'use client';

import { memo, useMemo } from 'react';
import { useTimelineConfig } from '../components/context';
import { Badge, TimelineDate } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { detectBump, type VersionBump } from '../core/semver';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem } from '../types';

export interface ChangelogTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Label releases as Major / Minor / Patch by comparing `version` with the previous release. @default true */
  showBump?: boolean;
  /** Badge the newest release. @default true */
  showLatest?: boolean;
}

const BUMP_TONE: Record<VersionBump, 'danger' | 'accent' | 'neutral' | 'warning'> = {
  major: 'danger',
  minor: 'accent',
  patch: 'neutral',
  prerelease: 'warning',
};

/** Previous (older) release for each version, by date when available, otherwise by list order (newest first). */
function computeBumps(items: TimelineItem[]): Map<string, VersionBump | null> {
  const versioned = items.filter((i) => i.event.version);
  const allDated = versioned.every((i) => i.start);
  const chronological = allDated ? [...versioned].sort((a, b) => a.start!.time - b.start!.time) : [...versioned].reverse();
  const out = new Map<string, VersionBump | null>();
  chronological.forEach((item, i) => out.set(item.key, detectBump(item.event.version, chronological[i - 1]?.event.version)));
  return out;
}

function findLatest(items: TimelineItem[]): string | null {
  let best: TimelineItem | null = null;
  for (const item of items) {
    if (item.start && (!best?.start || item.start.time > best.start.time)) best = item;
  }
  return (best ?? items[0])?.key ?? null;
}

const Release = memo(function Release({
  item,
  index,
  total,
  active,
  expanded,
  bump,
  latest,
}: {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
  bump: VersionBump | null;
  latest: boolean;
}) {
  const { labels, classNames } = useTimelineConfig();
  const { event } = item;
  const version = event.version ? (/^\d/.test(event.version) ? `v${event.version}` : event.version) : null;
  return (
    <li className={cx('m2t-release', classNames.item)} data-latest={latest ? '' : undefined} {...itemAttrs(item, index, { active })}>
      <div className="m2t-release__aside">
        {version && <span className="m2t-release__version">{version}</span>}
        <TimelineDate item={item} index={index} total={total} className="m2t-release__date" />
      </div>
      <div className="m2t-release__rail">
        <TimelineMarker item={item} index={index} total={total} active={active} />
      </div>
      <div className="m2t-release__body">
        <TimelineCard
          item={item}
          index={index}
          total={total}
          active={active}
          expanded={expanded}
          hide={['date']}
          eyebrow={
            latest || bump ? (
              <>
                {latest && <Badge tone="success">{labels.latest}</Badge>}
                {bump && <Badge tone={BUMP_TONE[bump]}>{labels.versionBump[bump]}</Badge>}
              </>
            ) : undefined
          }
        />
      </div>
    </li>
  );
});

/**
 * A product changelog / release-notes timeline: version and date pinned in a side column, grouped
 * change lists (Added, Fixed, Breaking...), automatic Major/Minor/Patch detection and a "Latest" badge.
 */
export function ChangelogTimeline<TData = unknown>(props: ChangelogTimelineProps<TData>) {
  const { showBump = true, showLatest = true } = props;
  const tl = useTimeline(props, { groupBy: false });
  const bumps = useMemo(() => (showBump ? computeBumps(tl.items) : new Map<string, VersionBump | null>()), [tl.items, showBump]);
  const latestKey = useMemo(() => (showLatest ? findLatest(tl.items) : null), [tl.items, showLatest]);
  const total = tl.visible.length;

  return (
    <TimelineFrame {...props} controller={tl} layout="changelog">
      <ol className="m2t-releases">
        {tl.visible.map((item, i) => (
          <Release
            key={item.key}
            item={item}
            index={i}
            total={total}
            active={tl.activeKey === item.key}
            expanded={tl.isExpanded(item.key)}
            bump={bumps.get(item.key) ?? null}
            latest={item.key === latestKey}
          />
        ))}
      </ol>
    </TimelineFrame>
  );
}
