import {ERROR, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface SecurityEslintConfigOptions extends UnConfigOptions<'security'> {}

export const securityUnConfig: UnConfigFn<'security'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.security;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies SecurityEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'security');

  // Legend:
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['security', {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true}])
    .addRule('detect-bidi-characters', ERROR) // 🟡
    .addRule('detect-buffer-noassert', ERROR) // 🟡
    .addRule('detect-child-process', WARNING) // 🟡
    .addRule('detect-disable-mustache-escape', ERROR) // 🟡
    .addRule('detect-eval-with-expression', ERROR) // 🟡
    .addRule('detect-new-buffer', ERROR) // 🟡
    .addRule('detect-no-csrf-before-method-override', WARNING) // 🟡
    .addRule('detect-non-literal-fs-filename', OFF) // 🟡
    .addRule('detect-non-literal-regexp', OFF) // 🟡
    .addRule('detect-non-literal-require', OFF) // 🟡
    .addRule('detect-object-injection', OFF) // 🟡
    .addRule('detect-possible-timing-attacks', OFF) // 🟡
    .addRule('detect-pseudoRandomBytes', WARNING) // 🟡
    .addRule('detect-unsafe-regex', WARNING) // 🟡
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
