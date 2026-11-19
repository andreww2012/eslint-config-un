declare const name: string | undefined;
declare const value: unknown;

const hasName = name !== undefined;
const isMissing = value === null || value === undefined;

export {hasName, isMissing};
