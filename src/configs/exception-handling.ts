import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface ExceptionHandlingEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'exception-handling'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'exception-handling');

  // Legend:
  // 🔴 - NOT in `recommended`

  configBuilder
    ?.addConfig(['exception-handling', {includeDefaultFilesAndIgnores: true}])
    .addRule('might-throw', OFF) /** @since 1.1.4 */ // 🔴
    .addRule('no-unhandled', ERROR) /** @since 1.0.0 */
    .addRule('use-error-cause', ERROR) /** @since 1.1.4 */
    .enableConfigTesterForPlugin('exception-handling')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'exceptionHandling'>;
