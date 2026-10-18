import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  ChangelogTimeline,
  CustomTimeline,
  FeedTimeline,
  GanttTimeline,
  HorizontalTimeline,
  RoadmapTimeline,
  StepperTimeline,
  Timeline,
  VerticalTimeline,
  type TimelineEvent,
} from '../src';
import { events, variants } from './fixtures';

const titles = events.map((e) => e.title as string);

describe('every variant', () => {
  it.each(variants)('%s renders all events', (variant) => {
    const { container } = render(<Timeline variant={variant} events={events} />);
    for (const title of titles) expect(container.textContent).toContain(title);
    const root = container.querySelector('.m2t')!;
    expect(root.getAttribute('data-layout')).toBeTruthy();
    expect(root.getAttribute('aria-label')).toBe('Timeline');
  });

  it.each(variants)('%s shows an empty state for no events', (variant) => {
    render(<Timeline variant={variant} events={[]} emptyState="Nothing here" />);
    expect(screen.getByRole('status')).toHaveTextContent('Nothing here');
  });

  it.each(variants)('%s survives invalid data', (variant) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bad = [{ title: 'No id', date: 'garbage' }, null, { id: 1, title: 'Fine', progress: -20 }] as never;
    const { container } = render(<Timeline variant={variant} events={bad} />);
    expect(container.textContent).toContain('Fine');
  });
});

describe('expansion', () => {
  it('toggles details with aria-expanded and reports ids', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(<VerticalTimeline events={events} onExpandedChange={onExpandedChange} />);
    const trigger = screen.getByRole('button', { name: /design system/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const region = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(region).toHaveAttribute('aria-hidden', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(region).not.toHaveAttribute('aria-hidden', 'true');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['design']);

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps a single item open in "single" mode', async () => {
    const user = userEvent.setup();
    const data: TimelineEvent[] = [
      { id: 1, title: 'One', details: 'd1' },
      { id: 2, title: 'Two', details: 'd2' },
    ];
    render(<VerticalTimeline events={data} expandable="single" />);
    await user.click(screen.getByRole('button', { name: /one/i }));
    await user.click(screen.getByRole('button', { name: /two/i }));
    expect(screen.getByRole('button', { name: /one/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /two/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders details inline when expandable is false', () => {
    render(<VerticalTimeline events={events} expandable={false} />);
    expect(screen.getByText('Tokens, components and documentation.')).toBeVisible();
    expect(screen.queryByRole('button', { name: /design system/i })).toBeNull();
  });
});

describe('clicks, active state and keyboard', () => {
  it('calls onEventClick and onActiveChange', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const onActiveChange = vi.fn();
    render(<VerticalTimeline events={events} onEventClick={onEventClick} onActiveChange={onActiveChange} />);
    await user.click(screen.getByRole('button', { name: /core build/i }));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'build' }), expect.objectContaining({ index: 2 }));
    expect(onActiveChange).toHaveBeenCalledWith('build', expect.objectContaining({ id: 'build' }));
    expect(document.querySelector('[data-m2t-key="build"]')).toHaveAttribute('data-active');
  });

  it('supports controlled activeId', () => {
    const { rerender } = render(<VerticalTimeline events={events} activeId="kickoff" />);
    expect(document.querySelector('[data-m2t-key="kickoff"]')).toHaveAttribute('data-active');
    rerender(<VerticalTimeline events={events} activeId="beta" />);
    expect(document.querySelector('[data-m2t-key="kickoff"]')).not.toHaveAttribute('data-active');
    expect(document.querySelector('[data-m2t-key="beta"]')).toHaveAttribute('data-active');
  });

  it('moves focus between events with arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    render(<VerticalTimeline events={events} onEventClick={() => {}} />);
    const buttons = titles.map((t) => screen.getByRole('button', { name: new RegExp(t, 'i') }));
    buttons[0].focus();
    await user.keyboard('{ArrowDown}');
    expect(buttons[1]).toHaveFocus();
    await user.keyboard('{End}');
    expect(buttons[3]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(buttons[2]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(buttons[0]).toHaveFocus();
  });

  it('does not activate disabled events', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    render(<VerticalTimeline events={[{ id: 1, title: 'Locked', disabled: true }]} onEventClick={onEventClick} />);
    expect(screen.queryByRole('button', { name: /locked/i })).toBeNull();
    await user.click(screen.getByText('Locked'));
    expect(onEventClick).not.toHaveBeenCalled();
  });
});

describe('toolbar', () => {
  it('searches and announces result counts', async () => {
    const user = userEvent.setup();
    render(<VerticalTimeline events={events} search />);
    const input = screen.getByRole('searchbox', { name: /search events/i });
    await user.type(input, 'beta');
    expect(await screen.findByText('1 of 4 events')).toBeInTheDocument();
    expect(screen.queryByText('Core build')).toBeNull();
    await user.clear(input);
    await user.type(input, 'zzz');
    expect(await screen.findByText(/no events match/i)).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /clear filters/i }).at(-1)!);
    expect(screen.getByText('Core build')).toBeInTheDocument();
  });

  it('filters by category chips', async () => {
    const user = userEvent.setup();
    const onCategoriesChange = vi.fn();
    render(<VerticalTimeline events={events} filters onCategoriesChange={onCategoriesChange} />);
    const group = screen.getByRole('group', { name: /filter by category/i });
    await user.click(within(group).getByRole('button', { name: 'Design' }));
    expect(within(group).getByRole('button', { name: 'Design' })).toHaveAttribute('aria-pressed', 'true');
    expect(onCategoriesChange).toHaveBeenLastCalledWith(['Design']);
    expect(screen.queryByText('Project kickoff')).toBeNull();
    await user.click(within(group).getByRole('button', { name: 'All' }));
    expect(screen.getByText('Project kickoff')).toBeInTheDocument();
  });

  it('renders jump-to navigation for groups', () => {
    render(<VerticalTimeline events={events} groupBy="group" jumpTo />);
    const nav = screen.getByRole('navigation', { name: /jump to/i });
    expect(
      within(nav)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Discovery', 'Delivery']);
  });
});

describe('data handling', () => {
  it('orders newest first with order="desc"', () => {
    const { container } = render(<VerticalTimeline events={events} order="desc" />);
    const keys = [...container.querySelectorAll('[data-m2t-key]')].map((el) => el.getAttribute('data-m2t-key'));
    expect(keys).toEqual(['beta', 'build', 'design', 'kickoff']);
  });

  it('paginates with pageSize', async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 25 }, (_, i) => ({ id: i, title: `Event ${i}` }));
    const { container } = render(<VerticalTimeline events={many} pageSize={10} />);
    expect(container.querySelectorAll('[data-m2t-key]')).toHaveLength(10);
    await user.click(screen.getByRole('button', { name: 'Show 15 more' }));
    expect(container.querySelectorAll('[data-m2t-key]')).toHaveLength(20);
    await user.click(screen.getByRole('button', { name: 'Show 5 more' }));
    expect(container.querySelectorAll('[data-m2t-key]')).toHaveLength(25);
    expect(screen.queryByRole('button', { name: /show .* more/i })).toBeNull();
  });

  it('updates when events change', async () => {
    function Live() {
      const [list, setList] = useState<TimelineEvent[]>(events.slice(0, 1));
      return (
        <>
          <button onClick={() => setList((l) => [...l, { id: 'new', title: 'Fresh event' }])}>add</button>
          <VerticalTimeline events={list} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Live />);
    await user.click(screen.getByText('add'));
    expect(screen.getByText('Fresh event')).toBeInTheDocument();
  });

  it('uses custom renderers', () => {
    render(
      <VerticalTimeline
        events={events}
        renderEvent={(e, ctx) => <p>{`${ctx.index + 1}/${ctx.total}: ${String(e.title)}`}</p>}
        renderMarker={(e) => <span data-testid={`m-${e.id}`}>★</span>}
        formatDate={(d) => `Y${d.getUTCFullYear()}`}
      />,
    );
    expect(screen.getByText('3/4: Core build')).toBeInTheDocument();
    expect(screen.getByTestId('m-build')).toBeInTheDocument();
  });

  it('allows overriding labels', () => {
    render(<VerticalTimeline events={events} search labels={{ search: 'Buscar', results: (n) => `${n} eventos` }} />);
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toBeInTheDocument();
    expect(screen.getByText('4 eventos')).toBeInTheDocument();
  });
});

describe('layout specifics', () => {
  it('stepper exposes the current step', () => {
    render(<StepperTimeline events={events} />);
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    expect(document.querySelector('[aria-current="step"]')).toHaveAttribute('data-m2t-key', 'build');
  });

  it('changelog detects version bumps and the latest release', () => {
    const { container } = render(<ChangelogTimeline events={events} />);
    const beta = container.querySelector('[data-m2t-key="beta"]')!;
    expect(beta).toHaveAttribute('data-latest');
    expect(beta.textContent).toContain('v2.0.0');
    expect(beta.textContent).toContain('Major');
    expect(container.querySelector('[data-m2t-key="build"]')!.textContent).toContain('Minor');
  });

  it('roadmap summarises phases', () => {
    render(<RoadmapTimeline events={events} />);
    expect(screen.getByRole('region', { name: 'Discovery' })).toBeInTheDocument();
    expect(screen.getByText('Now', { selector: '.m2t-lane .m2t-now' })).toBeInTheDocument();
  });

  it('gantt renders bars, milestones and an explicit today line', () => {
    const { container } = render(<GanttTimeline events={events} today="2025-04-01" />);
    expect(container.querySelectorAll('.m2t-gantt__bar')).toHaveLength(3);
    expect(container.querySelectorAll('.m2t-gantt__milestone')).toHaveLength(1);
    expect(container.querySelector('.m2t-gantt__today')).toBeInTheDocument();
  });

  it('horizontal timeline has navigation buttons', () => {
    render(<HorizontalTimeline events={events} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('feed shows relative times after mount', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2025-06-16T15:00:00Z'));
    try {
      render(<FeedTimeline events={[{ id: 1, title: 'Deployed', date: '2025-06-16T12:00:00Z' }]} />);
      await act(async () => {});
      expect(screen.getByText('3 hours ago')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('custom layout receives ready-made parts', () => {
    render(
      <CustomTimeline
        events={events}
        renderItem={(_item, ctx) => (
          <div data-testid="custom">
            {ctx.parts.title}
            <span>{ctx.dateText}</span>
          </div>
        )}
      />,
    );
    expect(screen.getAllByTestId('custom')).toHaveLength(4);
    expect(screen.getByText('Jan 6, 2025 – Jan 17, 2025')).toBeInTheDocument();
  });
});
