import * as v from 'valibot';

export const UserSchema = v.looseObject({name: v.string()});
