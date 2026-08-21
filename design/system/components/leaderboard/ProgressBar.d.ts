import * as React from 'react';

export type ProgressTone = 'brand' | 'up' | 'down' | 'gold' | 'sky';

/**
 * Rounded gradient progress bar — quota attainment, goal pacing, contest progress.
 */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. @default 0 */
  value?: number;
  /** Maximum. @default 100 */
  max?: number;
  /** Fill gradient tone. @default "brand" */
  tone?: ProgressTone;
  /** Track height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Optional label shown above-left. */
  label?: React.ReactNode;
  /** Override the auto percentage readout above-right. */
  valueLabel?: React.ReactNode;
  /** Show the percentage readout. @default false */
  showValue?: boolean;
}

export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
