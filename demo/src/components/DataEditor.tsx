import type { TimelineEvent } from 'm2timeline-motion';
import { useId, useState } from 'react';

const IMAGE_TOKEN = '[image]';

/** JSON for editing: inline data-URI images are replaced by a short token and restored on apply. */
function toEditable(events: TimelineEvent[]): string {
  const clean = events.map((e) => (e.image ? { ...e, image: IMAGE_TOKEN } : e));
  return JSON.stringify(clean, null, 2);
}

function parse(text: string, original: TimelineEvent[]): { events?: TimelineEvent[]; error?: string } {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return { error: `Invalid JSON: ${(e as Error).message}` };
  }
  if (!Array.isArray(value)) return { error: 'The data must be an array of events.' };
  for (const [i, item] of value.entries()) {
    if (!item || typeof item !== 'object') return { error: `Item ${i + 1} is not an object.` };
    const ev = item as Record<string, unknown>;
    if (ev.id === undefined || ev.id === null || ev.id === '') return { error: `Item ${i + 1} needs an "id".` };
    if (typeof ev.title !== 'string' || !ev.title) return { error: `Item ${i + 1} needs a "title" string.` };
  }
  const images = new Map(original.map((e) => [String(e.id), e.image]));
  const events = (value as TimelineEvent[]).map((e) => (e.image === IMAGE_TOKEN ? { ...e, image: images.get(String(e.id)) } : e));
  return { events };
}

/** Edits the playground's sample events. The timeline itself repairs anything still unusual. */
export function DataEditor({
  events,
  original,
  onApply,
  onReset,
}: {
  events: TimelineEvent[];
  original: TimelineEvent[];
  onApply: (events: TimelineEvent[]) => void;
  onReset: () => void;
}) {
  const id = useId();
  const [text, setText] = useState(() => toEditable(events));
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const apply = () => {
    const result = parse(text, original);
    if (result.error) {
      setError(result.error);
      setApplied(false);
      return;
    }
    setError(null);
    setApplied(true);
    onApply(result.events!);
  };

  return (
    <div className="data-editor">
      <label className="field__label" htmlFor={id}>
        Events (JSON)
      </label>
      <p className="field__hint">
        Edit titles, dates, statuses or add events, then apply. <code>{IMAGE_TOKEN}</code> keeps the sample image.
      </p>
      <textarea
        id={id}
        className="data-editor__text"
        spellCheck={false}
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          setApplied(false);
        }}
      />
      {error && (
        <p className="data-editor__error" id={`${id}-err`} role="alert">
          {error}
        </p>
      )}
      {applied && !error && (
        <p className="data-editor__ok" role="status">
          Applied {JSON.parse(text).length} events.
        </p>
      )}
      <div className="data-editor__actions">
        <button type="button" className="btn btn--accent btn--sm" onClick={apply}>
          Apply data
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setText(toEditable(original));
            setError(null);
            setApplied(false);
            onReset();
          }}
        >
          Reset sample
        </button>
      </div>
    </div>
  );
}
