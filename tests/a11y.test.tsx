import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../src';
import { events, variants } from './fixtures';

async function violations(container: HTMLElement) {
  const result = await axe.run(container, {
    // jsdom has no layout engine, so contrast cannot be computed here (checked manually in the demo).
    rules: { 'color-contrast': { enabled: false } },
  });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

describe('accessibility (axe-core)', () => {
  it.each(variants)('%s has no detectable violations', async (variant) => {
    const { container } = render(
      <main>
        <Timeline variant={variant} events={events} search filters jumpTo onEventClick={() => {}} />
      </main>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
