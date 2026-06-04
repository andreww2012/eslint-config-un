import {eslintConfigInternal} from './config-un/config';
import type {EslintConfigUnOptions, ExtraPluginsType} from './config-un/shared';

export const eslintConfig = <
  const ExtraPlugins extends ExtraPluginsType = never,
  NoWarnings extends boolean = false,
>(
  options: EslintConfigUnOptions<ExtraPlugins, {noWarnings: NoWarnings}> & {
    noWarnings?: NoWarnings;
  } = {},
) =>
  // Casting is in place here merely to avoid a prohibitively expensive structural relate of the
  // two huge config types here (it would make the type checker instantiate the per-key
  // warn-stripping for every config)
  eslintConfigInternal(options as EslintConfigUnOptions<ExtraPlugins>);

export type {RuleOptions} from './eslint-types.gen';
export {DEFAULT_GLOBAL_IGNORES} from './constants';

export {default as globals} from 'globals';
export {isInCi, isInEditor} from './utils';
