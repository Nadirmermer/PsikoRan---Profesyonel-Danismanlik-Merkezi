export namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare const jsxRuntime: any;
export default jsxRuntime;