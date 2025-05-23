import {ERROR, GLOB_TSX, OFF} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {PrettifyShallow} from '../types';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

type CheckedSyntax = 'enums' | 'importAliases' | 'namespaces' | 'parameterProperties';

export interface ErasableSyntaxOnlyEslintConfigOptions
  extends UnConfigOptions<'erasable-syntax-only'> {
  /**
   * By default, all syntaxes are disallowed. You can enable specific syntaxes by setting
   * their keys to `true` in this object.
   * - `enums`: allow using TypeScript's enums.
   * - `importAliases`: allow using TypeScript's import aliases.
   * - `namespaces`: allow using TypeScript's namespaces.
   * - `parameterProperties`: allow using TypeScript's class parameter properties.
   */
  allowedSyntax?: PrettifyShallow<Partial<Record<CheckedSyntax, boolean>>>;
}

export const erasableSyntaxOnlyUnConfig: UnConfigFn<'erasableSyntaxOnly'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.erasableSyntaxOnly;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies ErasableSyntaxOnlyEslintConfigOptions,
  );

  const {allowedSyntax = {}} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'erasable-syntax-only');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'erasable-syntax-only',
      {includeDefaultFilesAndIgnores: true, filesFallback: [GLOB_TSX]},
    ])
    .addRule('enums', allowedSyntax.enums ? OFF : ERROR) // 🟢
    .addRule('import-aliases', allowedSyntax.importAliases ? OFF : ERROR) // 🟢
    .addRule('namespaces', allowedSyntax.namespaces ? OFF : ERROR) // 🟢
    .addRule('parameter-properties', allowedSyntax.parameterProperties ? OFF : ERROR) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
