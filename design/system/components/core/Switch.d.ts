import * as React from 'react';

/**
 * Toggle switch with a candy spring on the thumb. Controlled or uncontrolled.
 */
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Controlled on/off state. */
  checked?: boolean;
  /** Uncontrolled initial state. */
  defaultChecked?: boolean;
  /** Change handler. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Inline label text. */
  label?: React.ReactNode;
  /** On-state color. @default "brand" */
  tone?: 'brand' | 'up';
  disabled?: boolean;
}

export declare function Switch(props: SwitchProps): JSX.Element;
