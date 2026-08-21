import * as React from 'react';

export type DeltaDirection = 'up' | 'down' | 'flat';

/**
 * The up/down/flat change indicator — arrow + value in the direction color.
 * Direction is inferred from a numeric `value`'s sign unless you set it explicitly.
 */
export interface StatDeltaProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric or preformatted value. Sign of a number sets direction + arrow. */
  value?: number | string;
  /** Force direction (overrides inference). */
  direction?: DeltaDirection;
  /** `text` (inline colored) or `pill` (soft background). @default "text" */
  variant?: 'text' | 'pill';
  /** Size. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Show the ▲▼— arrow. @default true */
  showArrow?: boolean;
  /** Appended to numeric values, e.g. "%". */
  suffix?: string;
  children?: React.ReactNode;
}

export declare function StatDelta(props: StatDeltaProps): JSX.Element;
