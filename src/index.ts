import {eslintConfigInternal} from './config-un/config';
import type {EslintConfigUnOptions, ExtraPluginsType} from './config-un/shared';

export const eslintConfig = <const ExtraPlugins extends ExtraPluginsType = never>(
  options: EslintConfigUnOptions<ExtraPlugins> = {},
) => eslintConfigInternal(options);

export type {RuleOptions} from './eslint-types.gen';
export {DEFAULT_GLOBAL_IGNORES} from './constants';

export {default as globals} from 'globals';
export {isInCi, isInEditor} from './utils';
