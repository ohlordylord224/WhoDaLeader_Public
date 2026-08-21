import * as React from 'react';

/**
 * The rank position chip. Ranks 1–3 render in gold/silver/bronze metal;
 * everything else is a neutral numbered tile.
 */
export interface RankBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 1-based position. */
  rank: number;
  /** Size. @default "md" */
  size?: 'sm' | 'md' | 'lg';
}

export declare function RankBadge(props: RankBadgeProps): JSX.Element;
