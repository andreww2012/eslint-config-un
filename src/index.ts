import {eslintConfigInternal} from './config';
import type {EslintConfigUnOptions} from './configs';

export const eslintConfig = (options: EslintConfigUnOptions = {}) => eslintConfigInternal(options);

export type {RuleOptions} from './eslint-types';
export {DEFAULT_GLOBAL_IGNORES} from './constants';

export {default as globals} from 'globals';
export {isInEditor} from 'is-in-editor';
