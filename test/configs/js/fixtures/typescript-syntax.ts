export type Callback = (item: string) => unknown;

export function overloaded(value: string): string;
export function overloaded(value: number): number;
export function overloaded(value: string | number) {
  return value;
}

export const environment: NodeJS.ProcessEnv = process.env;
