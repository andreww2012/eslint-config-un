import type {EslintConfigUnOptions} from '../../src/config-un/shared';

type PluginsOption = EslintConfigUnOptions['plugins'] & {};

describe('option: `plugins`', () => {
  describe('`settings`', () => {
    it('is absent for a plugin that has no shared settings', () => {
      expectTypeOf<keyof (PluginsOption['unicorn'] & {})>().toEqualTypeOf<'prefix' | 'plugin'>();

      ({
        // @ts-expect-error - assertion
        unicorn: {settings: {}},
      }) satisfies PluginsOption;
    });

    it('is present and typed for a plugin that has them', () => {
      expectTypeOf<keyof (PluginsOption['regexp'] & {})>().toEqualTypeOf<
        'prefix' | 'plugin' | 'settings'
      >();

      ({
        regexp: {settings: {allowedCharacterRanges: 'all'}},
      }) satisfies PluginsOption;

      ({
        // @ts-expect-error - assertion
        regexp: {settings: {allowedCharacterRanges: 'nope'}},
      }) satisfies PluginsOption;
    });
  });
});
