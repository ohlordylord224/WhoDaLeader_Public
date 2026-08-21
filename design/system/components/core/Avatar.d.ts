import * as React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarRing = 'gold' | 'silver' | 'bronze' | 'brand' | 'up' | 'down' | string;

/**
 * Player avatar. Shows `src` photo, else deterministic candy-colored initials.
 * Add a podium `ring` to crown the top three.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials when absent. */
  src?: string;
  /** Full name — drives initials and the auto color. */
  name?: string;
  /** Size. @default "md" */
  size?: AvatarSize;
  /** Podium/brand ring, or any CSS color string. */
  ring?: AvatarRing | null;
}

export declare function Avatar(props: AvatarProps): JSX.Element;
