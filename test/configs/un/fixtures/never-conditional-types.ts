export type IsNever<Type> = Type extends never ? true : false;

export type IsNeverDistributionFree<Type> = [Type] extends [never] ? true : false;
