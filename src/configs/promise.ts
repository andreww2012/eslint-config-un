// @ts-expect-error no typings
import eslintPluginPromise from 'eslint-plugin-promise';
import {ERROR} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {genFlatConfigEntryName, warnUnlessForcedError} from '../utils';

export interface PromiseEslintConfigOptions extends ConfigSharedOptions<'promise'> {}

export const promiseEslintConfig = (
  options: PromiseEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const rules: FlatConfigEntry['rules'] = {
    'promise/always-return': [ERROR, {ignoreLastCallback: true}],
    // 'avoid-new': OFF,
    'promise/catch-or-return': [
      ERROR,
      {
        allowThen: true,
        allowFinally: true,
      },
    ],
    'promise/no-callback-in-promise': ERROR, // Default: warn
    ...warnUnlessForcedError(internalOptions, 'promise/no-multiple-resolved'),
    // 'promise/no-native': OFF,
    ...warnUnlessForcedError(internalOptions, 'promise/no-nesting'),
    // 'promise/no-new-statics': ERROR,
    ...warnUnlessForcedError(internalOptions, 'promise/no-promise-in-callback'),
    'promise/no-return-in-finally': ERROR, // Default: warn
    'promise/no-return-wrap': [ERROR, {allowReject: true}],
    // 'promise/param-names': ERROR,
    // 'promise/prefer-await-to-callbacks': OFF,
    // 'promise/prefer-await-to-then': OFF,
    'promise/spec-only': ERROR,
    'promise/valid-params': ERROR, // Default: warn
  };

  return [
    {
      plugins: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        promise: eslintPluginPromise,
      },
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      rules: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...(eslintPluginPromise.configs.recommended.rules as FlatConfigEntry['rules']),
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('promise'),
    },
  ];
};
