import * as React from 'react';

export type BadgeTone =
  | 'neutral' | 'brand' | 'up' | 'down' | 'gold' | 'info'
  | 'solid-up' | 'solid-down' | 'solid-gold';

/**
 * Small status pill. Soft tones for quiet labels, `solid-*` for loud ones,
 * `live` for a pulsing red "on air" indicator.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. @default "neutral" */
  tone?: BadgeTone;
  /** Size. @default "md" */
  size?: 'md' | 'lg';
  /** Show a leading status dot. @default false */
  dot?: boolean;
  /** Pulsing red "LIVE" treatment (overrides tone). @default false */
  live?: boolean;
  children?: React.ReactNode;
}

export declare function Badge(props: BadgeProps): JSX.Element;
