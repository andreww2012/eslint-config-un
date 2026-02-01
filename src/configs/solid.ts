import {ERROR, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface SolidEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'solid'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies SolidEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'solid');

  const solidPackageInfo = context.packagesInfo['solid-js'];
  const solidParsedVersion = solidPackageInfo?.versions.majorAndMinor;

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['solid', {includeDefaultFilesAndIgnores: true}])
    .addRule('components-return-once', ERROR) /** @since 0.6.0 */ // 🟡
    .addRule('event-handlers', WARNING, [
      {
        // Docs say "Enable for Solid < v1.6"
        warnOnSpread: (solidParsedVersion ?? Number.POSITIVE_INFINITY) < 1.6,
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
    .addRule('no-array-handlers', OFF) /** @since 0.10.0 */ // TODO
    .addRule('no-destructure', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-innerhtml', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-proxy-apis', OFF) /** @since 0.8.0 */
    .addRule('no-react-deps', ERROR) /** @since 0.9.0 */ // 🟡
    // "Disallow usage of React-specific className/htmlFor props, which were deprecated in v1.4.0."
    .addRule(
      'no-react-specific-props',
      (solidParsedVersion ?? Number.POSITIVE_INFINITY) < 1.4 ? WARNING : ERROR,
    ) /** @since 0.1.0 */ // 🟡
    .addRule('no-unknown-namespaces', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-for', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('prefer-show', OFF) /** @since 0.4.4 */
    .addRule('reactivity', ERROR) /** @since 0.4.0 */ // 🟡
    .addRule('self-closing-comp', ERROR, [
      {
        component: 'none',
        html: 'void',
      },
    ]) /** @since 0.7.0 */ // 🟡
    .addRule('style-prop', WARNING) /** @since 0.1.0 */ // 🟡
    .enableConfigTesterForPlugin('solid')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'solid'>;
