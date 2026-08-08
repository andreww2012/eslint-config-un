import {parse} from 'zod/v4/core';

export const parseValue = (schema, value) => parse(schema, value);
