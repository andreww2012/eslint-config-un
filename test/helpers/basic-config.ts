import type {UnConfigs} from '../../src/configs';
import {type MaybeArray, arraify} from '../../src/utils';
import {computeEslintConfig} from './test-eslint-config';

type ConfigResultType = Awaited<ReturnType<typeof computeEslintConfig>>;
type ComputeOptions = Parameters<typeof computeEslintConfig>[1];

/**
 * Shorthand for the three common compute-option presets:
 * - `'all-disabled'` — every config disabled by default (the helper's implicit default)
 * - `'default'`      — no status override (`{reset: true}`)
 * - `'misc-enabled'` — misc configs enabled (`{reset: true, un: {defaultConfigsStatus: 'misc-enabled'}}`)
 */
type ConfigMode = 'all-disabled' | 'default' | 'misc-enabled';

const CONFIG_MODE_OPTIONS: Record<ConfigMode, ComputeOptions> = {
  'all-disabled': undefined,
  default: {reset: true},
  'misc-enabled': {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
};

/**
 * Asserts that the ESLint config(s) identified by `postfixOrPostfixes` are enabled or disabled,
 * and checks whether the "no need to enable/disable" warning was (or was not) printed.
 *
 * `state`:
 * - `true` — config is enabled, no warning
 * - `false` — config is disabled, no warning
 * - `[configName, true]` — config is enabled + "needlessly enabled" warning
 * - `[configName, false]` — config is disabled + "needlessly disabled" warning
 *
 * `modeOrComputeOptions`:
 * - `'all-disabled'` (default) / `'default'` / `'misc-enabled'` — preset shorthands
 * - or a raw `computeOptions` object for custom overrides
 */
export const expectConfigState = async (
  configs: Parameters<typeof computeEslintConfig>[0],
  postfixOrPostfixes: MaybeArray<string>,
  state: boolean | [configName: keyof UnConfigs, action: boolean],
  modeOrComputeOptions?: ConfigMode | ComputeOptions,
): Promise<ConfigResultType> => {
  using stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

  const computeOptions =
    typeof modeOrComputeOptions === 'string'
      ? CONFIG_MODE_OPTIONS[modeOrComputeOptions]
      : modeOrComputeOptions;

  const configResult = await computeEslintConfig(configs, computeOptions);

  const enabled = typeof state === 'boolean' ? state : state[1];

  for (const postfix of arraify(postfixOrPostfixes)) {
    if (enabled) {
      expect(configResult.getConfigByUnPostfix(postfix)).toBeDefined();
    } else {
      expect(configResult.getConfigByUnPostfix(postfix)).toBeUndefined();
    }
  }

  if (typeof state === 'boolean') {
    expect(stderrSpy.mock.calls).toHaveLength(0);
  } else {
    const [configName, action] = state;
    const verb = action ? 'enable' : 'disable';
    expect(
      String(stderrSpy.mock.calls[0]?.[0]).startsWith(
        `[warn] [eslint-config-un] There is no need to ${verb} \`${configName}\` config because this is the default`,
      ),
    ).toBe(true);
  }

  return configResult;
};
