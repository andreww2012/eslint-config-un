declare const sql: (strings: TemplateStringsArray) => unknown;

export const users = sql`SELECT id FROM users`;
