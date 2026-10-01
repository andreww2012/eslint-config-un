import type {RuleDefinition} from '@eslint/core';
import type {UnExtraPluginsRules} from '../../src/eslint/eslint-types';

interface ExtraPlugin {
  rules: {'my-rule': RuleDefinition};
}

describe('option: `extraPlugins`', () => {
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
