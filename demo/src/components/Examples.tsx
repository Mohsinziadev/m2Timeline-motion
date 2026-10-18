import { CareerTimeline, ChangelogTimeline, FeedTimeline, GanttTimeline, HistoryTimeline, RoadmapTimeline } from 'm2timeline-motion';
import { useState, type ReactNode } from 'react';
import { datasets } from '../data';
import { CodeBlock } from './ui';
import roadmapCode from '../../../examples/roadmap.tsx?raw';
import projectCode from '../../../examples/project.tsx?raw';
import careerCode from '../../../examples/career.tsx?raw';
import releasesCode from '../../../examples/releases.tsx?raw';
import historyCode from '../../../examples/history.tsx?raw';
import feedCode from '../../../examples/feed.tsx?raw';

interface Example {
  id: string;
  label: string;
  title: string;
  blurb: string;
  render: (theme: 'light' | 'dark') => ReactNode;
  code: string;
}

const examples: Example[] = [
  {
    id: 'roadmap',
    label: 'Product roadmap',
    title: 'A public roadmap with search and filters',
    blurb: 'Quarter lanes are derived from dates automatically. Status drives colors, progress bars and the “Now” lane.',
    render: (theme) => <RoadmapTimeline events={datasets.roadmap} theme={theme} search filters />,
    code: roadmapCode,
  },
  {
    id: 'project',
    label: 'Project plan',
    title: 'A Gantt chart with phases, owners and a today line',
    blurb: 'Tasks with `endDate` become bars; tasks without one become milestones. `group` creates phases.',
    render: (theme) => <GanttTimeline events={datasets.project} theme={theme} />,
    code: projectCode,
  },
  {
    id: 'career',
    label: 'Career history',
    title: 'Promotions grouped by company',
    blurb: 'Consecutive roles with the same `group` nest under one company. Tenure is computed (ongoing roles after hydration).',
    render: (theme) => <CareerTimeline events={datasets.career} theme={theme} />,
    code: careerCode,
  },
  {
    id: 'releases',
    label: 'Product releases',
    title: 'A changelog with automatic version bumps',
    blurb: 'Give each release a `version` and `changes`; Major/Minor/Patch and the “Latest” badge are worked out for you.',
    render: (theme) => <ChangelogTimeline events={datasets.releases} theme={theme} />,
    code: releasesCode,
  },
  {
    id: 'history',
    label: 'Company history',
    title: 'An editorial history with pinned eras',
    blurb: 'Use `group` for eras (or let it group by year). Headings stay pinned while their events scroll by.',
    render: (theme) => <HistoryTimeline events={datasets.space} theme={theme} appearance="editorial" jumpTo />,
    code: historyCode,
  },
  {
    id: 'feed',
    label: 'Activity feed',
    title: 'A dashboard activity feed',
    blurb: 'Grouped by day with “Today / Yesterday”, relative times after hydration and paginated with `pageSize`.',
    render: (theme) => <FeedTimeline events={datasets.activity} theme={theme} order="desc" pageSize={6} filters />,
    code: feedCode,
  },
];

export function Examples({ theme }: { theme: 'light' | 'dark' }) {
  const [active, setActive] = useState(examples[0].id);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const ex = examples.find((e) => e.id === active)!;
  return (
    <div className="examples">
      <div className="tabs tabs--pills" role="tablist" aria-label="Examples">
        {examples.map((e) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            id={`ex-tab-${e.id}`}
            aria-selected={active === e.id}
            aria-controls="ex-panel"
            className="tabs__btn"
            onClick={() => setActive(e.id)}
          >
            {e.label}
          </button>
        ))}
      </div>
      <div className="examples__panel" role="tabpanel" id="ex-panel" aria-labelledby={`ex-tab-${ex.id}`}>
        <div className="examples__head">
          <div>
            <h3 className="examples__title">{ex.title}</h3>
            <p className="examples__blurb">{ex.blurb}</p>
          </div>
          <div className="segmented" role="radiogroup" aria-label="View">
            {(['preview', 'code'] as const).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={view === v} className="segmented__btn" onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
        {view === 'preview' ? (
          <div className="examples__preview">{ex.render(theme)}</div>
        ) : (
          <CodeBlock code={ex.code} title={`${ex.label}.tsx`} />
        )}
      </div>
    </div>
  );
}
