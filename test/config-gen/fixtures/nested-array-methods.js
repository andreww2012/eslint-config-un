const values = [1, [2, 3]];

export const hasNoOnes = !values.some((value) => value === 1);
export const flatValues = values.flat();
