// Stubs for external libraries used only for type-satisfaction during CI/static analysis.
// These are NOT a replacement for the real types – when the actual `@types/*`
// packages are installed they will take precedence.

import * as React from 'react';

// Helper alias for generic icon component
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

declare module 'react-router-dom' {
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
}

export {};

// ----------------------------------------------------------------------------------

declare module 'framer-motion' {
  import * as React from 'react';

  // We expose motion as an object whose keys are html/svg tag names returning motion components.
  export const motion: Record<string, React.FC<any>> & {
    // fallback generic component
    <P extends {}>(component: React.ComponentType<P>): React.ComponentType<P>;
  };

  export interface AnimatePresenceProps {
    children?: React.ReactNode;
  }
  export const AnimatePresence: React.FC<AnimatePresenceProps>;
}

export {};

// ----------------------------------------------------------------------------------

declare module 'lucide-react' {
  export const ArrowLeft: IconComponent;
  export const Calendar: IconComponent;
  export const Clock: IconComponent;
  export const User: IconComponent;
  export const MapPin: IconComponent;
  export const Video: IconComponent;
  export const Edit: IconComponent;
  export const Trash2: IconComponent;
  export const AlertTriangle: IconComponent;
  export const Share2: IconComponent;
  export const FileText: IconComponent;
  export const Printer: IconComponent;
  export const Bell: IconComponent;
  export const X: IconComponent;
  export const ExternalLink: IconComponent;
  export const Phone: IconComponent;
  export const Clipboard: IconComponent;
  export const CheckCircle: IconComponent;
  export const XCircle: IconComponent;
  export const Users: IconComponent;
  export const MessageSquare: IconComponent;
  export const Paperclip: IconComponent;
  export const Layers: IconComponent;
  export const ChevronDown: IconComponent;
  export const BarChart: IconComponent;
  export const FileCheck: IconComponent;
  export const AlertCircle: IconComponent;
  export const Tag: IconComponent;
  export const Menu: IconComponent;
  export const Maximize2: IconComponent;
  export const Copy: IconComponent;
  export const Twitter: IconComponent;
  export const Facebook: IconComponent;
  export const Linkedin: IconComponent;
  export const Heart: IconComponent;
  export const ArrowRight: IconComponent;
  export const UserPlus: IconComponent;
}

export {};

// ----------------------------------------------------------------------------------

declare module 'react-helmet-async' {
  import * as React from 'react';
  export const Helmet: React.FC<{ children?: React.ReactNode }>;
  export const HelmetProvider: React.FC<{ children?: React.ReactNode }>;
}

export {};

// ----------------------------------------------------------------------------------

// Minimal NodeJS namespace to satisfy env references when @types/node is absent
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

// ----------------------------------------------------------------------------------

// React 17+ automatic JSX transform runtime modules (prevent missing-module errors)
declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  const jsxRuntime: any;
  export default jsxRuntime;
}

declare module 'react/jsx-dev-runtime' {
  export * from 'react/jsx-runtime';
}