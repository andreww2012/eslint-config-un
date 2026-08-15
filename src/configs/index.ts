import type {ExtraPluginsType} from '../config-un/shared';
import type {UnConfigsGenerated} from './index.gen';

export {defineUnConfig} from '../config-un/define-config';
export {eslintToUnRuleSeverity, getRuleUnSeverityAndOptionsFromEntry} from '../eslint/eslint-utils';
export type {
  UnAllRuleNames,
  GetRuleOptions,
  GetRuleNamesInPlugin,
  UnRuleOptionsByPlugin,
  UnRulesConfigPartial,
  UnFlatConfigEntryBase,
} from '../eslint/eslint-types';
export type {FlatConfigEntryForBuilder} from '../config-un/config-entry-builder';
export {assignDefaults} from '../utils';
export type {ExtraPluginsType} from '../config-un/shared';

export type ArrayOrBooleanRecord<
  T extends PropertyKey = string,
  Mode extends 'boolean' | 'booleanOrMessage' | 'message' = 'boolean',
> =
  | T[]
  | Partial<
      Record<
        T,
        Mode extends 'boolean'
          ? boolean
          : Mode extends 'booleanOrMessage'
            ? boolean | string
            : string
      >
    >;

export interface UnConfigs<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigsGenerated<ExtraPlugins> {}
