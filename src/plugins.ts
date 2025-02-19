import eslintPluginMarkdown from '@eslint/markdown';
// @ts-expect-error no typings
import eslintPluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintPluginVitest from '@vitest/eslint-plugin';
import eslintPluginCss from 'eslint-plugin-css';
import eslintPluginImportX from 'eslint-plugin-import-x';
import eslintPluginJest from 'eslint-plugin-jest';
// @ts-expect-error no typings
import eslintPluginJestExtended from 'eslint-plugin-jest-extended';
import eslintPluginJsDoc from 'eslint-plugin-jsdoc';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import eslintPluginNode from 'eslint-plugin-n';
// @ts-expect-error no typings
import eslintPluginNoTypeAssertion from 'eslint-plugin-no-type-assertion';
import eslintPluginPackageJson from 'eslint-plugin-package-json';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPinia from 'eslint-plugin-pinia';
import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
// @ts-expect-error no typings
import eslintPluginPromise from 'eslint-plugin-promise';
import * as eslintPluginRegexp from 'eslint-plugin-regexp';
import eslintPluginSecurity from 'eslint-plugin-security';
import eslintPluginSonar from 'eslint-plugin-sonarjs';
import eslintPluginTailwind from 'eslint-plugin-tailwindcss';
import eslintPluginToml from 'eslint-plugin-toml';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import eslintPluginYaml from 'eslint-plugin-yml';
import {plugin as typescriptEslintPlugin} from 'typescript-eslint';
import type {EslintPlugin, FlatConfigEntry} from './eslint';

export const ALL_ESLINT_PLUGINS: FlatConfigEntry['plugins'] & {} = {
  unicorn: eslintPluginUnicorn,
  '@stylistic': eslintPluginStylistic,
  // @ts-expect-error types mismatch
  '@typescript-eslint': typescriptEslintPlugin,
  // @ts-expect-error types mismatch
  'css-in-js': eslintPluginCss,
  '@eslint-community/eslint-comments': eslintPluginEslintComments as EslintPlugin, // No typings
  // @ts-expect-error types mismatch
  import: eslintPluginImportX,
  jest: eslintPluginJest,
  'jest-extended': eslintPluginJestExtended as EslintPlugin, // No typings
  'unused-imports': eslintPluginUnusedImports,
  jsdoc: eslintPluginJsDoc,
  // @ts-expect-error types mismatch
  jsonc: eslintPluginJsonc,
  markdown: eslintPluginMarkdown,
  node: eslintPluginNode,
  // @ts-expect-error types mismatch
  'package-json': eslintPluginPackageJson,
  perfectionist: eslintPluginPerfectionist,
  // @ts-expect-error types mismatch
  'prefer-arrow-functions': eslintPluginPreferArrowFunctions,
  promise: eslintPluginPromise as EslintPlugin, // No typings
  regexp: eslintPluginRegexp,
  // @ts-expect-error types mismatch
  security: eslintPluginSecurity,
  sonarjs: eslintPluginSonar,
  // @ts-expect-error types mismatch
  tailwindcss: eslintPluginTailwind,
  // @ts-expect-error types mismatch
  toml: eslintPluginToml,
  'no-type-assertion': eslintPluginNoTypeAssertion as EslintPlugin, // No typings
  vitest: eslintPluginVitest,
  vue: eslintPluginVue,
  'vuejs-accessibility': eslintPluginVueA11y,
  // @ts-expect-error types mismatch
  pinia: eslintPluginPinia,
  // @ts-expect-error types mismatch
  yml: eslintPluginYaml,
};
