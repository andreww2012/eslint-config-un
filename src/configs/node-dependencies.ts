import {ERROR, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import {DEFAULT_FILES_PACKAGE_JSON} from './package-json';
import type {UnConfigFn} from './index';

export interface NodeDependenciesEslintConfigOptions extends UnConfigOptions<'node-dependencies'> {
  /**
   * - `true`: enforces to use the absolute version only on `dependencies` and `devDependencies`.
   * - `'never'`: enforces not to use the absolute version.
   * - `false`: do not enforce anything.
   * @default false
   */
  enforceAbsoluteVersion?:
    | boolean
    | 'never'
    | (GetRuleOptions<'node-dependencies', 'absolute-version'>[0] & object);
}

export const nodeDependenciesUnConfig: UnConfigFn<'nodeDependencies'> = async (context) => {
  const jsoncEslintParser = await interopDefault(import('jsonc-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.nodeDependencies;
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceAbsoluteVersion: false,
  } satisfies NodeDependenciesEslintConfigOptions);

  const {enforceAbsoluteVersion} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'node-dependencies');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'node-dependencies',
        {includeDefaultFilesAndIgnores: true, filesFallback: DEFAULT_FILES_PACKAGE_JSON},
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    /* Category: Possible Errors */
    .addRule('compat-engines', WARNING) // 🟢 >=0.5.0
    .addRule('no-dupe-deps', ERROR) // 🟢 >=0.8.0
    .addRule('valid-semver', ERROR) // 🟢 >=0.1.0
    /* Category: Best Practices */
    .addRule(
      'absolute-version',
      enforceAbsoluteVersion ? ERROR : OFF,
      enforceAbsoluteVersion
        ? [
            enforceAbsoluteVersion === true
              ? {
                  optionalDependencies: 'ignore',
                  peerDependencies: 'ignore',
                }
              : enforceAbsoluteVersion,
          ]
        : [],
    ) // >=0.7.0
    .addRule('no-deprecated', WARNING, [{devDependencies: true}]) // >=0.2.0
    // TODO option to restrict packages with modern alternatives?
    .addRule('no-restricted-deps', OFF) // >=0.8.0
    /* Category: Stylistic Issues */
    .addRule('prefer-caret-range-version', OFF) // >=0.8.0
    .addRule('prefer-tilde-range-version', OFF) // >=0.8.0
    /* Category: Deprecated */
    .addRule('valid-engines', OFF) // >=0.1.0
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
