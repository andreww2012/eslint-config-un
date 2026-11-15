import type {EslintConfigUnOptions} from '../../src/config-un/shared';
import {createNoRestrictedSyntaxRule} from '../../src/snippets';

const tsEslintTypedPlugin = createNoRestrictedSyntaxRule({
  name: 'no-foo',
  message: 'Do not use `foo`',
  selector: 'Identifier[name="foo"]',
});

describe('option: `plugins`', () => {
  type PluginsOption = EslintConfigUnOptions['plugins'] & {};

  describe('`plugin`', () => {
    it('accepts a plugin typed with `typescript-eslint` types if the built-in one is loosely typed', () => {
      ({
        angular: {plugin: tsEslintTypedPlugin},
      }) satisfies PluginsOption;
    });

    it('expects the type of the built-in plugin if it has a precise one', () => {
      ({
        stylistic: {
          // @ts-expect-error Assertion
          plugin: tsEslintTypedPlugin,
        },
      }) satisfies PluginsOption;
    });
  });

  describe('`settings`', () => {
    it('is absent for a plugin that has no shared settings', () => {
      expectTypeOf<keyof (PluginsOption['unicorn'] & {})>().toEqualTypeOf<'prefix' | 'plugin'>();

      ({
        unicorn: {
          // @ts-expect-error Assertion
          settings: {},
        },
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
        regexp: {
          settings: {
            // @ts-expect-error Assertion
            allowedCharacterRanges: 'nope',
          },
        },
      }) satisfies PluginsOption;
    });
  });
});
