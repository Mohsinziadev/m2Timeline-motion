'use client';

import { type CSSProperties, type ReactNode } from 'react';
import { clamp, cx } from '../core/env';
import { Check, rootProps, Tip, XIcon, type ProgressBaseProps } from './shared';

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export interface ProgressStep {
  label: ReactNode;
  /** Small text under the label, e.g. "Earn 10 points". */
  description?: ReactNode;
  /** Icon for the `icons` variant (or to replace the number). */
  icon?: ReactNode;
  /** Overrides the status derived from `current`. */
  status?: StepStatus;
  /** Tooltip content for this step. */
  tooltip?: ReactNode;
}

export interface StepProgressProps extends ProgressBaseProps {
  steps: ProgressStep[];
  /** Index of the current step; earlier steps are complete. Use `steps.length` when everything is done. @default 0 */
  current?: number;
  /** Marker style. @default 'numbered' */
  variant?: 'numbered' | 'dots' | 'icons';
  /** How far the connector after the current step is filled (0–1). @default 0 */
  connectorProgress?: number;
  /** Tooltip above the current step ("Step 3 · Verification"). @default false */
  showTooltip?: boolean;
  /** Show a chevron indicator above the current step. @default false */
  pointer?: boolean;
  /** Hide labels (markers only). @default false */
  hideLabels?: boolean;
  /** Makes steps clickable (e.g. to go back). */
  onStepClick?: (index: number) => void;
  /** Words for screen readers. */
  statusLabels?: Partial<Record<StepStatus, string>>;
  'aria-label'?: string;
}

const WORDS: Record<StepStatus, string> = {
  complete: 'completed',
  current: 'current step',
  upcoming: 'not started',
  error: 'needs attention',
};

/** Multi-step progress (checkout, onboarding, wizards) with connectors that fill as you advance. */
export function StepProgress(props: StepProgressProps) {
  const { steps, variant = 'numbered', showTooltip = false, pointer = false, hideLabels = false, onStepClick } = props;
  const current = clamp(Math.round(props.current ?? 0), 0, steps.length);
  const connector = clamp(props.connectorProgress ?? 0, 0, 1);
  const words = { ...WORDS, ...props.statusLabels };
  const root = rootProps(props);

  return (
    <div {...root} className={cx(root.className, 'm2t-steps')} data-variant={variant} data-labels={hideLabels ? undefined : ''}>
      <ol
        className="m2t-steps__list"
        aria-label={props['aria-label'] ?? 'Progress'}
        style={{ '--m2t-steps-n': steps.length } as CSSProperties}
      >
        {steps.map((step, i) => {
          const status: StepStatus = step.status ?? (i < current ? 'complete' : i === current ? 'current' : 'upcoming');
          const fill = i < current ? 1 : i === current ? connector : 0;
          const marker =
            variant === 'icons' && step.icon ? (
              step.icon
            ) : status === 'complete' && variant !== 'icons' ? (
              <Check />
            ) : status === 'error' ? (
              <XIcon />
            ) : variant === 'dots' ? null : (
              (step.icon ?? i + 1)
            );
          const tip =
            step.tooltip ??
            (showTooltip && status === 'current' ? (
              <>
                <span className="m2t-tip__line">Step {i + 1}</span>
                <strong className="m2t-tip__title">{step.label}</strong>
              </>
            ) : null);
          const Marker = onStepClick ? 'button' : 'span';
          return (
            <li
              key={i}
              className="m2t-steps__item"
              data-status={status}
              aria-current={status === 'current' ? 'step' : undefined}
              style={{ '--m2t-steps-fill': fill, '--m2t-steps-i': i } as CSSProperties}
            >
              <div className="m2t-steps__head">
                {pointer && status === 'current' && <span className="m2t-steps__pointer" aria-hidden="true" />}
                <Marker
                  className="m2t-steps__marker"
                  {...(onStepClick ? { type: 'button' as const, onClick: () => onStepClick(i) } : { 'aria-hidden': true })}
                >
                  <span className="m2t-steps__marker-content">{marker}</span>
                  {onStepClick && <span className="m2t-sr">{`Step ${i + 1}`}</span>}
                  {tip ? (
                    <Tip open={showTooltip && status === 'current'} className="m2t-steps__tip">
                      {tip}
                    </Tip>
                  ) : null}
                </Marker>
                {i < steps.length - 1 && (
                  <span className="m2t-steps__connector" aria-hidden="true">
                    <span />
                  </span>
                )}
              </div>
              <div className={hideLabels ? 'm2t-sr' : 'm2t-steps__text'}>
                <span className="m2t-steps__label">{step.label}</span>
                {step.description ? <span className="m2t-steps__desc">{step.description}</span> : null}
                <span className="m2t-sr">{`, ${words[status]}`}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
