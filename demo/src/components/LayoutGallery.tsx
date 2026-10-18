import { Timeline, type LayoutVariant, type TimelineProps } from 'm2timeline-motion';
import { useMemo, useState } from 'react';
import { previewEvents, snippet } from '../layout-preview';
import { Icon, Tile } from '../icons';
import { CATEGORIES, variantInfo, type Category, type VariantInfo } from '../variants';
import { CodeBlock } from './ui';

/** Layouts that need the full row to read well. */
const WIDE = new Set<LayoutVariant>([
  'horizontal',
  'roadmap',
  'gantt',
  'story',
  'cards',
  'zigzag',
  'alternating',
  'history',
  'stepper',
  'feed',
]);
function LayoutCard({
  v,
  wide,
  theme,
  onCustomize,
}: {
  v: VariantInfo;
  wide: boolean;
  theme: 'light' | 'dark';
  onCustomize: (id: LayoutVariant) => void;
}) {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const code = useMemo(() => (view === 'code' ? snippet(v) : ''), [view, v]);
  const props = { variant: v.id, events: previewEvents(v), theme, ...v.galleryProps } as TimelineProps;
  const tag = `<${v.component}${v.id === 'alternating' ? ' align="alternate"' : ''} />`;
  return (
    <article id={`layout-${v.id}`} className="lcard" data-wide={wide ? '' : undefined} aria-labelledby={`lcard-${v.id}`}>
      <header className="lcard__head">
        <Tile name={v.icon} tone={v.tone} size="sm" />
        <div className="lcard__titles">
          <h3 id={`lcard-${v.id}`} className="lcard__name">
            {v.name}
          </h3>
          <p className="lcard__desc">{v.tagline}</p>
        </div>
        <div className="seg seg--sm" role="radiogroup" aria-label={`${v.name} view`}>
          {(['preview', 'code'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={view === m} className="seg__btn" onClick={() => setView(m)}>
              {m === 'preview' ? 'Preview' : 'Code'}
            </button>
          ))}
        </div>
      </header>
      <div className="lcard__body">
        {view === 'preview' ? (
          <div className="lcard__preview">
            <Timeline {...props} />
          </div>
        ) : (
          <div className="lcard__code">
            <CodeBlock code={code} title={`${v.component}.tsx`} maxHeight={340} />
          </div>
        )}
      </div>
      <footer className="lcard__foot">
        <div className="lcard__meta">
          <span className="lcard__use">
            <Icon name="layers" size={14} />
            {v.scenario}
          </span>
          <code className="lcard__tag">{tag}</code>
        </div>
        <button type="button" className="btn btn--sm btn--accent" onClick={() => onCustomize(v.id)}>
          <Icon name="sliders" size={14} />
          Customize
        </button>
      </footer>
    </article>
  );
}

export function LayoutGallery({ theme, onCustomize }: { theme: 'light' | 'dark'; onCustomize: (id: LayoutVariant) => void }) {
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () =>
      Object.fromEntries(CATEGORIES.map((c) => [c, variantInfo.filter((v) => v.categories.includes(c)).length])) as Record<
        Category,
        number
      >,
    [],
  );
  const shown = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return variantInfo.filter((v) => {
      if (category !== 'All' && !v.categories.includes(category)) return false;
      const hay = `${v.name} ${v.component} ${v.tagline} ${v.useFor} ${v.scenario}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [category, query]);
  // Half-width cards pair up; an unpaired one takes the full row so the grid never has a hole.
  const narrow = shown.filter((v) => !WIDE.has(v.id));
  const loner = narrow.length % 2 === 1 ? narrow[narrow.length - 1].id : null;

  return (
    <div className="gallery2">
      <div className="gallery2__bar">
        <div className="chips" role="group" aria-label="Filter layouts by category">
          <button type="button" className="chip2" aria-pressed={category === 'All'} onClick={() => setCategory('All')}>
            All <span>{variantInfo.length}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="chip2" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c} <span>{counts[c]}</span>
            </button>
          ))}
        </div>
        <label className="fsearch">
          <Icon name="search" size={15} />
          <span className="sr-only">Search layouts</span>
          <input type="search" placeholder="Filter layouts…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <p className="gallery2__count" aria-live="polite">
        {shown.length === variantInfo.length ? `Showing all ${shown.length} layouts` : `${shown.length} of ${variantInfo.length} layouts`}
      </p>
      {shown.length === 0 ? (
        <div className="gallery2__empty">
          <p>No layouts match “{query}”.</p>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="gallery2__grid">
          {shown.map((v) => (
            <LayoutCard key={v.id} v={v} wide={WIDE.has(v.id) || v.id === loner} theme={theme} onCustomize={onCustomize} />
          ))}
        </div>
      )}
    </div>
  );
}
