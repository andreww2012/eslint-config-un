import * as z from 'zod';

export const user = z.object({
  name: z.string(),
});
