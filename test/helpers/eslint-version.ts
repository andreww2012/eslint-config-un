import {ESLint} from 'eslint';

const eslintMajorVersion = Number.parseInt(ESLint.version, 10);

export const isEslint10OrLater = eslintMajorVersion >= 10;
