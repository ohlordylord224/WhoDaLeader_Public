import * as React from 'react';

/**
 * A single leaderboard row - rank chip, rank-movement arrow, avatar (with podium
 * ring for 1-3), name/team, optional progress bar, and the metric value + delta.
 * The composite that defines the product.
 *
 * @startingPoint section="Leaderboard" subtitle="Full leaderboard row with rank, movement and metric" viewport="700x150"
 */
export interface LeaderRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 1-based position. */
  rank: number;
  /** Player/rep name. */
  name: string;
  /** Secondary line (team, region). */
  team?: string;
  /** Avatar image URL (falls back to initials). */
  avatarSrc?: string;
  /** Preformatted headline metric, e.g. "£42.1k". */
  value: React.ReactNode;
  /** Percentage change; sign drives the delta. */
  delta?: number;
  /** Rank positions moved since last period (+up / -down / 0). @default 0 */
  movement?: number;
  /** Optional inline progress (quota/goal). */
  progress?: LeaderRowProgress;
  /** Leader emphasis (gold glow + larger). @default false */
  lead?: boolean;
}

export interface LeaderRowProgress {
  value: number;
  max?: number;
  tone?: 'brand' | 'up' | 'down' | 'gold' | 'sky';
}

export declare function LeaderRow(props: LeaderRowProps): JSX.Element;
