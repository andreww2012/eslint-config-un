import {ERROR, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [SolidJS](https://www.solidjs.com) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface SolidEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'solid'> {
  /**
   * [`eslint-plugin-solid`](https://npmx.dev/eslint-plugin-solid) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `solid` property and applied to the resolved `files` and `ignores` of
   * this config.
   */
  settings?: {
    /**
     * Version of Solid the linted code targets.
     * Specifying the minor part too (`'1.5'`, `'2.0.3'`) is encouraged: a major-only value borrows
     * the minor from the installed `solid-js` package, falling back to `x.0`.
     *
     * Affected rules:
     * - [`solid/event-handlers`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/event-handlers.md)
     * - [`solid/imports`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/imports.md)
     * - [`solid/jsx-no-undef`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/jsx-no-undef.md)
     * - [`solid/no-accessor-as-prop`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-accessor-as-prop.md)
     * - [`solid/no-module-scope-reactive-primitive`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-module-scope-reactive-primitive.md)
     * - [`solid/no-react-deps`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-react-deps.md)
     * - [`solid/no-react-specific-props`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-react-specific-props.md)
     * - [`solid/no-restated-default-options`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-restated-default-options.md)
     * - [`solid/no-single-arg-create-effect`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-single-arg-create-effect.md)
     * - [`solid/no-unknown-namespaces`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-unknown-namespaces.md)
     * - [`solid/prefer-onSettled-for-side-effects`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/prefer-onSettled-for-side-effects.md)
     * - [`solid/prefer-structured-class`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/prefer-structured-class.md)
     * - [`solid/reactivity`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/reactivity.md)
     * - [`solid/removed-api`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/removed-api.md)
     * @default version of the installed `solid-js` package
     */
    version?: number | string;
  };
}

export default defineUnConfig<SolidEslintConfigOptions>('solid', {
  enabledBy: {package: 'solid-js'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'solid');

  const solidPackageVersion = context.packagesInfo['solid-js']?.versions.full || '';
  const solidVersionFromUser = String(optionsResolved.settings?.version ?? '');

  const solidMajorVersion = Number.parseInt(solidVersionFromUser || solidPackageVersion, 10) || 0;
  const errorIfSolidVersion2 = solidMajorVersion >= 2 ? ERROR : OFF;

  const isMinorVersionDetectedFromPackage =
    !solidVersionFromUser.includes('.') &&
    Number.parseInt(solidPackageVersion, 10) === solidMajorVersion;
  const solidMajorAndMinorVersionForLessComparisons =
    Number.parseFloat(
      isMinorVersionDetectedFromPackage ? solidPackageVersion : solidVersionFromUser,
    ) || Number.POSITIVE_INFINITY;

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🔵 - in v2
  // 🔷 - in v2 (warns)
  // 🟣 - in v2-strict (extends v2)
  // 🟪 - in v2-strict (warns)

  configBuilder
    ?.addConfig([
      'solid',
      {
        settings: {
          ...(solidMajorVersion > 0 && {
            solid: {version: solidMajorVersion},
          }),
        },
      },
    ])
    .addRule('components-return-once', ERROR) /** @since 0.6.0 */ // 🟡
    .addRule('event-handlers', WARNING, [
      {
        // Docs say "Enable for Solid < v1.6"
        warnOnSpread: solidMajorAndMinorVersionForLessComparisons < 1.6,
      },
    ]) /** @since 0.5.0 */ // 🟡
    .addRule('imports', ERROR) /** @since 0.7.4 */ // 🟡
    .addRule('jsx-no-duplicate-props', ERROR) /** @since 0.7.0 */ // 🟢
    .addRule('jsx-no-script-url', ERROR) /** @since 0.7.0 */ // 🟢
    .addRule('jsx-no-undef', ERROR, [
      {
        // I haven't testing this, but in general this could be disruptive
        autoImport: false,
        typescriptEnabled: context.configsMeta.ts.enabled,
      },
    ]) /** @since 0.1.0 */ // 🟢
    .addRule('jsx-uses-vars', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-accessor-as-prop', errorIfSolidVersion2) /** @since 0.16.0 */ // 🔵
    .addRule('no-array-handlers', OFF) /** @since 0.10.0 */ // TODO
    .addRule('no-browser-globals-in-server-function', errorIfSolidVersion2) /** @since 0.17.0 */ // 🔵
    .addRule('no-destructure', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-innerhtml', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-invalid-server-capture', errorIfSolidVersion2) /** @since 0.17.0 */ // 🔵
    .addRule('no-module-scope-reactive-primitive', errorIfSolidVersion2) /** @since 0.16.0 */ // 🟣
    .addRule('no-proxy-apis', OFF) /** @since 0.8.0 */
    .addRule('no-react-deps', ERROR) /** @since 0.9.0 */ // 🟡
    // "Disallow usage of React-specific className/htmlFor props, which were deprecated in v1.4.0."
    .addRule(
      'no-react-specific-props',
      solidMajorAndMinorVersionForLessComparisons < 1.4 ? WARNING : ERROR,
    ) /** @since 0.1.0 */ // 🟡
    .addRule('no-restated-default-options', errorIfSolidVersion2) /** @since 0.16.0 */ // 🟣
    .addRule('no-single-arg-create-effect', errorIfSolidVersion2) /** @since 0.16.0 */ // 🔵
    .addRule('no-unknown-namespaces', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-for', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-onSettled-for-side-effects', errorIfSolidVersion2) /** @since 0.16.0 */ // 🟪
    .addRule('prefer-show', OFF) /** @since 0.4.4 */
    .addRule('prefer-structured-class', errorIfSolidVersion2) /** @since 0.16.0 */ // 🔷🟣
    .addRule('reactivity', ERROR) /** @since 0.4.0 */ // 🟡
    .addRule('removed-api', errorIfSolidVersion2) /** @since 0.16.0 */ // 🔵
    .addRule('require-async-server-function', errorIfSolidVersion2) /** @since 0.17.0 */ // 🔵
    .addRule('self-closing-comp', ERROR, [
      {
        component: 'none',
        html: 'void',
      },
    ]) /** @since 0.7.0 */ // 🟡
    .addRule('style-prop', WARNING) /** @since 0.1.0 */ // 🟡
    .addRule('valid-use-server', ERROR) /** @since 0.17.0 */ // 🔵
    .enableConfigTesterForPlugin('solid')
    .addOverrides();
});
