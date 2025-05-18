import {ERROR, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface SolidEslintConfigOptions extends UnConfigOptions<'solid'> {}

export const solidUnConfig: UnConfigFn<'solid'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.solid;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies SolidEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'solid');

  const solidPackageInfo = context.packagesInfo['solid-js'];
  const solidParsedVersion = solidPackageInfo?.versions.majorAndMinor;

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['solid', {includeDefaultFilesAndIgnores: true}])
    .addRule('components-return-once', ERROR) // 🟡
    .addRule('event-handlers', WARNING, [
      {
        // Docs say "Enable for Solid < v1.6"
        warnOnSpread: (solidParsedVersion ?? Number.POSITIVE_INFINITY) < 1.6,
      },
    ]) // 🟡
    .addRule('imports', ERROR) // 🟡
    .addRule('jsx-no-duplicate-props', ERROR) // 🟢
    .addRule('jsx-no-script-url', ERROR) // 🟢
    .addRule('jsx-no-undef', ERROR, [
      {
        // I haven't testing this, but in general this could be disruptive
        autoImport: false,
        typescriptEnabled: context.configsMeta.ts.enabled,
      },
    ]) // 🟢
    .addRule('jsx-uses-vars', ERROR) // 🟢
    .addRule('no-array-handlers', OFF) // TODO
    .addRule('no-destructure', ERROR) // 🟢
    .addRule('no-innerhtml', ERROR) // 🟢
    .addRule('no-proxy-apis', OFF)
    .addRule('no-react-deps', ERROR) // 🟡
    // "Disallow usage of React-specific className/htmlFor props, which were deprecated in v1.4.0."
    .addRule(
      'no-react-specific-props',
      (solidParsedVersion ?? Number.POSITIVE_INFINITY) < 1.4 ? WARNING : ERROR,
    ) // 🟡
    .addRule('no-unknown-namespaces', ERROR) // 🟢
    .addRule('prefer-for', ERROR) // 🟢
    .addRule('prefer-show', OFF)
    .addRule('reactivity', ERROR) // 🟡
    .addRule('self-closing-comp', ERROR, [
      {
        component: 'none',
        html: 'void',
      },
    ]) // 🟡
    .addRule('style-prop', WARNING) // 🟡
    /* Category: Deprecated */
    .addRule('prefer-classlist', OFF)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
