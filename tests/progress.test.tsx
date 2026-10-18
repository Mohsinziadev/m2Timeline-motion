import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CircularProgress, ProgressBar, SegmentedProgress, StepProgress, type ProgressSegment } from '../src';

const segments: ProgressSegment[] = [
  { status: 'complete', label: 'Session 1', description: 'Jan 2' },
  { status: 'complete', label: 'Session 2', description: 'Jan 9' },
  { status: 'scheduled', label: 'Session 3', description: 'Jan 16' },
  { status: 'missed', label: 'Session 4', description: 'Jan 23' },
  { status: 'empty' },
];

describe('ProgressBar', () => {
  it('exposes an accessible progressbar labelled by its label', () => {
    render(<ProgressBar label="Uploading" value={27} max={60} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar).toHaveAttribute('aria-valuenow', '45');
    expect(bar).toHaveAttribute('aria-valuetext', '45%');
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('clamps values and handles invalid numbers', () => {
    const { rerender } = render(<ProgressBar aria-label="x" value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar aria-label="x" value={-5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    rerender(<ProgressBar aria-label="x" value={Number.NaN} max={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders status icons, helper text and announces completion', () => {
    const { container, rerender } = render(<ProgressBar label="Upload" value={50} status="loading" helperText="27MB of 60MB" />);
    expect(container.querySelector('.m2t-p__spinner')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-busy', 'true');
    rerender(<ProgressBar label="Upload" value={100} status="success" />);
    expect(screen.getByRole('status')).toHaveTextContent('Complete');
    expect(container.querySelector('.m2t-pb')).toHaveAttribute('data-tone', 'success');
    rerender(<ProgressBar label="Upload" value={100} status="error" helperText="Oops" />);
    expect(screen.getByRole('status')).toHaveTextContent('Failed');
    expect(screen.getByText('Oops')).toHaveAttribute('data-status', 'error');
  });

  it('calls onCancel', async () => {
    const onCancel = vi.fn();
    render(<ProgressBar aria-label="Download" value={50} onCancel={onCancel} cancelLabel="Stop download" />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Stop download' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('splits the value across units for segmented variants', () => {
    const { container } = render(<ProgressBar aria-label="x" variant="segmented" segments={4} value={60} />);
    const units = [...container.querySelectorAll<HTMLElement>('.m2t-pb__unit')].map((u) => u.style.getPropertyValue('--m2t-pb-u'));
    expect(units.map(Number)).toEqual([1, 1, expect.closeTo(0.4, 5), 0]);
  });

  it.each(['top', 'start', 'end', 'inside', 'tooltip'] as const)('places the value at %s', (pos) => {
    const { container } = render(<ProgressBar label="L" value={30} valuePosition={pos} />);
    expect(container.textContent).toContain('30%');
  });

  it('supports indeterminate, buffer, milestones and custom formatting', () => {
    const { container, rerender } = render(<ProgressBar label="Loading" indeterminate />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    rerender(
      <ProgressBar label="Points" value={30} max={150} buffer={90} milestones={[50, 100, 150]} formatValue={(v, m) => `${v}/${m} pts`} />,
    );
    expect(screen.getByText('30/150 pts')).toBeInTheDocument();
    expect(container.querySelector('.m2t-pb__buffer')).toBeInTheDocument();
    expect(container.querySelectorAll('.m2t-pb__milestones span')).toHaveLength(3);
  });
});

describe('SegmentedProgress', () => {
  it('counts complete segments and ignores empty ones', () => {
    render(<SegmentedProgress label="Your Progress" segments={segments} />);
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
  });

  it('shows status tooltips on interactive segments', () => {
    render(<SegmentedProgress label="Your Progress" segments={segments} />);
    const group = screen.getByRole('group', { name: 'Your Progress' });
    const scheduled = within(group).getByRole('button', { name: /Session 3, 3: Scheduled/ });
    const tip = document.getElementById(scheduled.getAttribute('aria-describedby')!)!;
    expect(tip).toHaveAttribute('role', 'tooltip');
    expect(tip).toHaveTextContent('Session 3Jan 16Scheduled');
  });

  it('is a plain progressbar when segments are not interactive', () => {
    render(<SegmentedProgress aria-label="Chunks" segments={10} value={3} />);
    expect(screen.getByRole('progressbar', { name: 'Chunks' })).toHaveAttribute('aria-valuetext', '3 of 10');
  });

  it('reports clicks', async () => {
    const onSegmentClick = vi.fn();
    render(<SegmentedProgress aria-label="s" segments={segments} onSegmentClick={onSegmentClick} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Session 4/ }));
    expect(onSegmentClick).toHaveBeenCalledWith(3, segments[3]);
  });
});

describe('StepProgress', () => {
  const steps = [{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment' }];

  it('derives statuses from current and marks the current step', () => {
    const { container } = render(<StepProgress steps={steps} current={1} />);
    const items = container.querySelectorAll('.m2t-steps__item');
    expect([...items].map((i) => i.getAttribute('data-status'))).toEqual(['complete', 'current', 'upcoming']);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0].textContent).toContain('completed');
  });

  it('marks everything complete when current equals the step count', () => {
    const { container } = render(<StepProgress steps={steps} current={3} />);
    expect([...container.querySelectorAll('.m2t-steps__item')].every((i) => i.getAttribute('data-status') === 'complete')).toBe(true);
  });

  it('makes steps clickable', async () => {
    const onStepClick = vi.fn();
    render(<StepProgress steps={steps} current={2} onStepClick={onStepClick} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Step 1/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('shows a tooltip for the current step', () => {
    render(<StepProgress steps={steps} current={2} variant="dots" showTooltip />);
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('Step 3Payment');
  });
});

describe('CircularProgress', () => {
  it('renders a ring with label and sublabel', () => {
    render(<CircularProgress value={70} sublabel="Grade Rating" />);
    const ring = screen.getByRole('progressbar', { name: 'Grade Rating' });
    expect(ring).toHaveAttribute('aria-valuenow', '70');
    expect(ring).toHaveTextContent('70%Grade Rating');
  });

  it('renders gauges with a cropped viewBox and gradients', () => {
    const { container } = render(<CircularProgress value={40} variant="gauge" arc={180} color={['#000', '#fff']} aria-label="Score" />);
    const vb = container.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number);
    expect(vb[3]).toBeLessThan(60);
    expect(container.querySelector('linearGradient')).toBeInTheDocument();
  });
});

const all: Array<[string, ReactElement]> = [
  [
    'ProgressBar',
    <ProgressBar
      key="a"
      label="Upload"
      info="Details"
      value={40}
      status="loading"
      helperText="Help"
      onCancel={() => {}}
      milestones={[50]}
    />,
  ],
  ['ProgressBar variants', <ProgressBar key="b" label="Dots" variant="dots" valuePosition="tooltip" value={40} />],
  ['SegmentedProgress', <SegmentedProgress key="c" label="Sessions" segments={segments} />],
  ['StepProgress', <StepProgress key="d" steps={[{ label: 'A' }, { label: 'B' }]} current={1} showTooltip onStepClick={() => {}} />],
  ['CircularProgress', <CircularProgress key="e" value={70} variant="gauge" sublabel="Score" />],
];

describe('progress accessibility, SSR and hydration', () => {
  it.each(all)('%s has no axe violations', async (_, element) => {
    const { container } = render(<main>{element}</main>);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations.map((v) => v.id)).toEqual([]);
  });

  it.each(all)('%s hydrates without mismatches', async (_, element) => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    const errors: unknown[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args));
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    spy.mockRestore();
    act(() => root?.unmount());
    container.remove();
  });
});
