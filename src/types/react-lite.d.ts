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
  export const Suspense: FC<{ fallback?: ReactNode, children?: ReactNode }>;

  // Basic hook stubs
  export function useState<S = any>(initialState: S | (() => S)): [S, (value: S) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T = any>(initialValue: T | null): { current: T | null };
  export function useContext<T>(ctx: any): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(cb: T, deps: readonly any[]): T;
  export function useReducer<R extends (state: any, action: any) => any, S = any, I = any>(
    reducer: R,
    initialState: S,
    initializer?: (arg: I) => S
  ): [S, (action: any) => void];
}