declare const value: unknown;

const text = value as string;
const textOrNumber = 'text' as string | number;

export {text, textOrNumber};
