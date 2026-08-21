import * as React from 'react';

export type CardGlow = 'brand' | 'gold' | 'up' | 'down';

/**
 * Rounded surface container — the default home for grouped content. Optional
 * colored `glow` to spotlight a winning/rising panel; `interactive` adds a hover lift.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Colored emphasis glow. */
  glow?: CardGlow | null;
  /** Hover-lift affordance for clickable cards. @default false */
  interactive?: boolean;
  /** Remove padding & clip children (for full-bleed media/tables). @default false */
  flush?: boolean;
  /** Optional header title. */
  title?: React.ReactNode;
  /** Optional header action node (right side). */
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export declare function Card(props: CardProps): JSX.Element;
