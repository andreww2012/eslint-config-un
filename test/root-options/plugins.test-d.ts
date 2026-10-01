import type {EslintConfigUnOptions} from '../../src/config-un/shared';
import {createNoRestrictedSyntaxRule} from '../../src/snippets';

type PluginsOption = EslintConfigUnOptions['plugins'] & {};

const tsEslintTypedPlugin = createNoRestrictedSyntaxRule({
  name: 'no-foo',
  message: 'Do not use `foo`',
  selector: 'Identifier[name="foo"]',
});

describe('option: `plugins`', () => {
  describe('`plugin`', () => {
    it('accepts a plugin typed with `typescript-eslint` types if the built-in one is loosely typed', () => {
      ({
        angular: {plugin: tsEslintTypedPlugin},
      }) satisfies PluginsOption;
    });

    it('expects the type of the built-in plugin if it has a precise one', () => {
      ({
        // @ts-expect-error - assertion
        stylistic: {plugin: tsEslintTypedPlugin},
      }) satisfies PluginsOption;
    });
  });

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
