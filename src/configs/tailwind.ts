// @ts-expect-error no typings
import eslingPluginTailwind from 'eslint-plugin-tailwindcss';
import {OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {genFlatConfigEntryName, warnUnlessForcedError} from '../utils';

export interface TailwindEslintConfigOptions extends ConfigSharedOptions<`tailwindcss/${string}`> {}

export const tailwindEslintConfig = (
  options: TailwindEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const rules: FlatConfigEntry['rules'] = {
    ...warnUnlessForcedError(internalOptions, 'tailwindcss/classnames-order'),
    ...warnUnlessForcedError(internalOptions, 'tailwindcss/enforces-negative-arbitrary-values'),
    ...warnUnlessForcedError(internalOptions, 'tailwindcss/enforces-shorthand'),
    ...warnUnlessForcedError(internalOptions, 'tailwindcss/migration-from-tailwind-2'),
    // 'tailwindcss/no-arbitrary-value': OFF,
    // 'tailwindcss/no-contradicting-classname': ERROR,
    'tailwindcss/no-custom-classname': OFF,
    ...warnUnlessForcedError(internalOptions, 'tailwindcss/no-unnecessary-arbitrary-value'),
  };

  return [
    {
      plugins: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tailwindcss: eslingPluginTailwind,
      },
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      rules: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...(eslingPluginTailwind.configs.recommended.rules as FlatConfigEntry['rules']),
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('tailwind'),
    },
  ];
};