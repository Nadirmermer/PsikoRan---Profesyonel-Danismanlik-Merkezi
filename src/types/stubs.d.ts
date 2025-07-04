// Stubs for external libraries used only for type-satisfaction during CI/static analysis.
// These are NOT a replacement for the real types – when the actual `@types/*`
// packages are installed they will take precedence.

declare module 'react-router-dom' {
  import { ComponentType } from 'react';
  export const Routes: ComponentType<any>;
  export const Route: ComponentType<any>;
  export const Link: ComponentType<any>;
  export const Navigate: ComponentType<any>;
  export function useLocation(): any;
  export function useNavigate(): any;
  export function useParams<T = any>(): T;
  export const BrowserRouter: ComponentType<any>;
  const reactRouterDom: any;
  export default reactRouterDom;
}

declare module 'framer-motion' {
  import { ComponentType } from 'react';
  export const motion: any;
  export const AnimatePresence: ComponentType<any>;
  const framerMotion: any;
  export default framerMotion;
}

declare module 'lucide-react' {
  import { ComponentType } from 'react';
  // In practise lucide-react exports hundreds of icons. We expose a generic one
  // so TS doesn\'t fail when the full type package isn\'t present yet.
  export const ArrowLeft: ComponentType<any>;
  export const Calendar: ComponentType<any>;
  export const Clock: ComponentType<any>;
  export const User: ComponentType<any>;
  export const MapPin: ComponentType<any>;
  export const Video: ComponentType<any>;
  export const Edit: ComponentType<any>;
  export const Trash2: ComponentType<any>;
  export const AlertTriangle: ComponentType<any>;
  export const Share2: ComponentType<any>;
  export const FileText: ComponentType<any>;
  export const Printer: ComponentType<any>;
  export const Bell: ComponentType<any>;
  export const X: ComponentType<any>;
  export const ExternalLink: ComponentType<any>;
  export const Phone: ComponentType<any>;
  export const Clipboard: ComponentType<any>;
  export const CheckCircle: ComponentType<any>;
  export const XCircle: ComponentType<any>;
  export const Users: ComponentType<any>;
  export const MessageSquare: ComponentType<any>;
  export const Paperclip: ComponentType<any>;
  export const Layers: ComponentType<any>;
  export const ChevronDown: ComponentType<any>;
  export const BarChart: ComponentType<any>;
  export const FileCheck: ComponentType<any>;
  export const AlertCircle: ComponentType<any>;
  export const Tag: ComponentType<any>;
  export const Menu: ComponentType<any>;
  export const Maximize2: ComponentType<any>;
  export default {};
}

declare module 'react-helmet-async' {
  import { ComponentType } from 'react';
  export const Helmet: ComponentType<any>;
  export const HelmetProvider: ComponentType<any>;
}