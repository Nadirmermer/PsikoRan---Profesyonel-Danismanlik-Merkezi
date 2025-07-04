import * as React from 'react';

export interface NavigateProps {
  to: string;
  replace?: boolean;
}

export const Routes: React.FC<{ children?: React.ReactNode }>;
export const Route: React.FC<any>;
export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>;
export const Navigate: React.FC<NavigateProps>;
export function useLocation(): Location;
export function useNavigate(): (to: string, opts?: { replace?: boolean }) => void;
export function useParams<T = Record<string, string | undefined>>(): T;
export const BrowserRouter: React.FC<{ children?: React.ReactNode }>;