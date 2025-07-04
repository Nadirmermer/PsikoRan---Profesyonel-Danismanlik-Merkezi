declare module 'react' {
  export type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactNode[];
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: string | number | null;
  }
  export interface FC<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement | null;
  }
  export type JSXElementConstructor<P> = ((props: P) => any) | (new (props: P) => any);
  export const Fragment: FC<{ children?: ReactNode }>;
}