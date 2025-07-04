declare module 'dompurify' {
  // Basic configuration object shape (partial)
  interface Config {
    USE_PROFILES?: Record<string, boolean>;
    [key: string]: unknown;
  }

  const DOMPurify: {
    sanitize(source: string, config?: Config): string;
  };

  export = DOMPurify;
  export default DOMPurify;
}