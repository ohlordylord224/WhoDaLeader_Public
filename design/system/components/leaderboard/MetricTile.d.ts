import * as React from 'react';

/**
 * KPI tile — big number, label, optional icon and a pill delta. The building
 * block of the dashboard stat strip.
 */
export interface MetricTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase label, e.g. "Revenue won". */
  label: React.ReactNode;
  /** The headline value (preformatted), e.g. "£128.4k". */
  value: React.ReactNode;
  /** Numeric change; sign drives the delta color/arrow. */
  delta?: number;
  /** Suffix on the delta. @default "%" */
  deltaSuffix?: string;
  /** Muted caption beside the delta, e.g. "vs last week". */
  caption?: React.ReactNode;
  /** Icon node (top-right). */
  icon?: React.ReactNode;
  /** Icon chip tone. @default "brand" */
  iconTone?: 'brand' | 'up' | 'gold' | 'sky';
}

export declare function MetricTile(props: MetricTileProps): JSX.Element;
