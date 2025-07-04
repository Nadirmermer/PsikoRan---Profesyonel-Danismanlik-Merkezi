declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  type Timeout = number;
}