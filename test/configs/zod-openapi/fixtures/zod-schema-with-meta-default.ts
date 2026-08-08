import {z} from 'zod';

export const schema = z.string().meta({default: 'fallback'});
