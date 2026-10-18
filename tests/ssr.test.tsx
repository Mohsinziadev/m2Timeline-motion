// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CircularProgress, ProgressBar, SegmentedProgress, StepProgress, Timeline } from '../src';
import { events, variants } from './fixtures';

describe('server rendering (no DOM available)', () => {
  it('has no window/document during this test', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it.each(variants)('%s renders to a string', (variant) => {
    const html = renderToString(<Timeline variant={variant} events={events} search filters animation="rise" />);
    expect(html).toContain('Core build');
    expect(html).toContain('data-animation="rise"');
  });

  it('produces identical markup on repeated renders (deterministic dates, ids)', () => {
    const a = renderToString(<Timeline variant="feed" events={events} />);
    const b = renderToString(<Timeline variant="feed" events={events} />);
    expect(a).toBe(b);
  });

  it('renders progress components without a DOM', () => {
    const html = renderToString(
      <>
        <ProgressBar label="Upload" value={40} status="loading" variant="chevron" milestones={[50]} onCancel={() => {}} />
        <SegmentedProgress segments={[{ status: 'complete', label: 'A' }, { status: 'missed' }]} />
        <StepProgress steps={[{ label: 'A' }, { label: 'B' }]} current={1} showTooltip />
        <CircularProgress value={70} variant="gauge" />
      </>,
    );
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-current="step"');
  });
});
