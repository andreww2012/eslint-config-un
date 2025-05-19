import {eslintConfigInternal} from './config';
import type {EslintConfigUnOptions} from './configs';

export const eslintConfig = (options: EslintConfigUnOptions = {}) => eslintConfigInternal(options);

export {isInEditor} from 'is-in-editor';

export type {RuleOptions} from './eslint-types';

export {DEFAULT_GLOBAL_IGNORES} from './constants';
