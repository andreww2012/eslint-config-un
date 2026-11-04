declare const items: string[] | undefined;
declare const text: string | undefined;

const allItems = items ?? [];
const allText = text ?? '';

export {allItems, allText};
