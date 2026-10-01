import type {RuleDefinition} from '@eslint/core';
import type {ExtraPluginsType} from '../../src/config-un/shared';
import type {UnExtraPluginsRules} from '../../src/eslint/eslint-types';
import {createNoRestrictedSyntaxRule} from '../../src/snippets';

interface ExtraPlugin {
  rules: {'my-rule': RuleDefinition};
}

describe('option: `extraPlugins`', () => {
  it('accepts a plugin typed with `typescript-eslint` types', () => {
    const restrictPlugin = createNoRestrictedSyntaxRule({
      name: 'no-foo',
      message: 'Do not use `foo`',
      selector: 'Identifier[name="foo"]',
    });

    expectTypeOf(restrictPlugin).toExtend<ExtraPluginsType[string]>();
    expectTypeOf<
      UnExtraPluginsRules<{restrict: typeof restrictPlugin}>
    >().toEqualTypeOf<'restrict/no-foo'>();
  });

  describe('infers the rule names', () => {
    it('from a plugin object', () => {
      expectTypeOf<UnExtraPluginsRules<{extra: ExtraPlugin}>>().toEqualTypeOf<'extra/my-rule'>();
    });

    it('from a function returning the plugin', () => {
      expectTypeOf<
        UnExtraPluginsRules<{extra: () => ExtraPlugin}>
      >().toEqualTypeOf<'extra/my-rule'>();
    });

    it('from a promise resolving to the plugin', () => {
      expectTypeOf<
        UnExtraPluginsRules<{extra: Promise<ExtraPlugin>}>
      >().toEqualTypeOf<'extra/my-rule'>();
    });

    it('from an async function returning the plugin', () => {
      expectTypeOf<
        UnExtraPluginsRules<{extra: () => Promise<ExtraPlugin>}>
      >().toEqualTypeOf<'extra/my-rule'>();
    });
  });

  it('infers no rule names when there are no extra plugins', () => {
    expectTypeOf<UnExtraPluginsRules<never>>().toBeNever();
  });
});
