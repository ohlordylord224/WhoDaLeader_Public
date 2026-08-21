import * as React from 'react';

export type IconButtonVariant = 'soft' | 'solid' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * Square (or round) button holding a single icon. Always pass `label` for
 * accessibility — it becomes the aria-label and tooltip.
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "soft" */
  variant?: IconButtonVariant;
  /** Control size. @default "md" */
  size?: IconButtonSize;
  /** Use a fully round pill shape. @default false */
  round?: boolean;
  /** Accessible label + tooltip text. Required. */
  label: string;
  /** The icon node (e.g. a Lucide <svg>). */
  children?: React.ReactNode;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
