import {fixupPluginRules} from '@eslint/compat';
import eslintPluginCss from '@eslint/css';
import eslintPluginMarkdown from '@eslint/markdown';
import eslintPluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import eslintPluginReactX from '@eslint-react/eslint-plugin';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintPluginVitest from '@vitest/eslint-plugin';
import eslintPluginCssInJs from 'eslint-plugin-css';
import eslintPluginDeMorgan from 'eslint-plugin-de-morgan';
import eslintPluginImportX from 'eslint-plugin-import-x';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginJestExtended from 'eslint-plugin-jest-extended';
import eslintPluginJsDoc from 'eslint-plugin-jsdoc';
import eslintPluginJsonSchemaValidator from 'eslint-plugin-json-schema-validator';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import eslintPluginNode from 'eslint-plugin-n';
import eslintPluginNoTypeAssertion from 'eslint-plugin-no-type-assertion';
import eslintPluginPackageJson from 'eslint-plugin-package-json';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPinia from 'eslint-plugin-pinia';
import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import eslintPluginPromise from 'eslint-plugin-promise';
// TODO it returns undefined without `* as` syntax for some reason
import * as eslintPluginQwik from 'eslint-plugin-qwik';
import eslintPluginReact from 'eslint-plugin-react';
import * as eslintPluginReactCompiler from 'eslint-plugin-react-compiler';
import * as eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
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
import type {FlatConfigEntry} from './eslint';

export const ALL_ESLINT_PLUGINS: FlatConfigEntry['plugins'] & {} = {
  unicorn: eslintPluginUnicorn,
  '@stylistic': eslintPluginStylistic,
  // @ts-expect-error types mismatch
  '@typescript-eslint': typescriptEslintPlugin,
  // @ts-expect-error types mismatch
  'css-in-js': eslintPluginCssInJs,
  '@eslint-community/eslint-comments': eslintPluginEslintComments,
  // @ts-expect-error types mismatch
  import: eslintPluginImportX,
  jest: eslintPluginJest,
  'jest-extended': eslintPluginJestExtended,
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
  promise: eslintPluginPromise,
  regexp: eslintPluginRegexp,
  // @ts-expect-error types mismatch
  security: eslintPluginSecurity,
  sonarjs: eslintPluginSonar,
  // @ts-expect-error types mismatch
  tailwindcss: eslintPluginTailwind,
  // @ts-expect-error types mismatch
  toml: eslintPluginToml,
  'no-type-assertion': eslintPluginNoTypeAssertion,
  vitest: eslintPluginVitest,
  vue: eslintPluginVue,
  'vuejs-accessibility': eslintPluginVueA11y,
  // @ts-expect-error types mismatch
  pinia: eslintPluginPinia,
  // @ts-expect-error types mismatch
  yml: eslintPluginYaml,
  'de-morgan': eslintPluginDeMorgan,
  qwik: fixupPluginRules(eslintPluginQwik),
  // @ts-expect-error types mismatch
  'json-schema-validator': eslintPluginJsonSchemaValidator,
  css: eslintPluginCss,
  react: eslintPluginReact,
  'react-hooks': eslintPluginReactHooks,
  ...eslintPluginReactX.configs.all.plugins,
  'react-refresh': eslintPluginReactRefresh,
  'react-compiler': eslintPluginReactCompiler,
};
