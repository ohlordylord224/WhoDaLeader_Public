import * as React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Primary action control. Pill-shaped, bold, candy-bright. Use `primary` (grape)
 * for the main action; `success`/`danger` map to the up/down direction colors;
 * `gold` celebrates a win.
 *
 * @startingPoint section="Core" subtitle="Pill buttons in every brand variant" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: ButtonVariant;
  /** Control height. @default "md" */
  size?: ButtonSize;
  /** Stretch to full container width. @default false */
  block?: boolean;
  /** Icon node rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  /** Render as a different element/component (e.g. "a"). @default "button" */
  as?: any;
  children?: React.ReactNode;
}

export declare function Button(props: ButtonProps): JSX.Element;
