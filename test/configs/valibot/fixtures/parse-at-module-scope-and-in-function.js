import * as v from 'valibot';

export const port = v.parse(v.number(), Number(process.env.PORT));

export const parseName = (input) => v.parse(v.string(), input);
