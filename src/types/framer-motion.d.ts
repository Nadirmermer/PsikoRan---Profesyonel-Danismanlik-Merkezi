import * as React from 'react';

export const motion: Record<string, React.FC<any>> & {
  <P extends {}>(component: React.ComponentType<P>): React.ComponentType<P>;
};

export interface AnimatePresenceProps {
  children?: React.ReactNode;
}
export const AnimatePresence: React.FC<AnimatePresenceProps>;