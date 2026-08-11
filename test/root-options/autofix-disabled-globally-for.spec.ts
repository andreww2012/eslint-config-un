// A rule is left autofixable <=> its `meta.fixable` survives in the registered plugin
const isAutofixable = (
  configResult: Awaited<ReturnType<typeof computeEslintConfig>>,
  ruleName: string,
) => Boolean(configResult.getLoadedPlugin('unicorn')?.rules?.[ruleName]?.meta?.fixable);

describe('option: `autofixDisabledGloballyFor`', () => {
  const DISABLED_BY_DEFAULT_RULE = 'no-useless-undefined';
  const NOT_DISABLED_BY_DEFAULT_RULE = 'comment-content';

  it('disables autofix only for the default rule list when option is not set', async () => {
    const configResult = await computeEslintConfig('unicorn');

    expect(isAutofixable(configResult, DISABLED_BY_DEFAULT_RULE)).toBe(false);
    expect(isAutofixable(configResult, NOT_DISABLED_BY_DEFAULT_RULE)).toBe(true);
  });

  // TODO documented to disable autofix for every fixable rule of every plugin, but currently disables nothing at all — it even drops the rules disabled by default
  it('disables no autofixes at all when set to `true`', async () => {
    const configResult = await computeEslintConfig('unicorn', {
      un: {autofixDisabledGloballyFor: true},
    });

    expect(isAutofixable(configResult, DISABLED_BY_DEFAULT_RULE)).toBe(true);
    expect(isAutofixable(configResult, NOT_DISABLED_BY_DEFAULT_RULE)).toBe(true);
  });

  it('disables no autofixes at all when set to `false`', async () => {
    const configResult = await computeEslintConfig('unicorn', {
      un: {autofixDisabledGloballyFor: false},
    });

    expect(isAutofixable(configResult, DISABLED_BY_DEFAULT_RULE)).toBe(true);
    expect(isAutofixable(configResult, NOT_DISABLED_BY_DEFAULT_RULE)).toBe(true);
  });

  it('disables autofix for every fixable rule of a plugin set to `true` in `plugins`', async () => {
    const configResult = await computeEslintConfig('unicorn', {
      un: {autofixDisabledGloballyFor: {plugins: {unicorn: true}}},
    });

    expect(isAutofixable(configResult, NOT_DISABLED_BY_DEFAULT_RULE)).toBe(false);
  });

  it('keeps autofix for a rule set to `false` in `rules` of an opted-in plugin', async () => {
    const configResult = await computeEslintConfig('unicorn', {
      un: {
        autofixDisabledGloballyFor: {
          plugins: {unicorn: true},
          rules: {[`unicorn/${NOT_DISABLED_BY_DEFAULT_RULE}`]: false},
        },
      },
    });

    expect(isAutofixable(configResult, NOT_DISABLED_BY_DEFAULT_RULE)).toBe(true);
    expect(isAutofixable(configResult, DISABLED_BY_DEFAULT_RULE)).toBe(false);
  });

  it('leaves the plugin untouched when none of its fixable rules is selected', async () => {
    const configResult = await computeEslintConfig('regexp', {
      un: {autofixDisabledGloballyFor: {rules: {'regexp/prefer-w': false}}},
    });

    expect(
      configResult.getLoadedPlugin('regexp')?.rules?.['prefer-w']?.meta?.fixable,
    ).toBeDefined();
  });

  it('respects `pluginRenames`', async () => {
    const configResult = await computeEslintConfig('unicorn', {
      un: {
        pluginRenames: {unicorn: 'unicorn-renamed'},
        autofixDisabledGloballyFor: {plugins: {unicorn: true}},
      },
    });

    expect(
      configResult.getLoadedPlugin('unicorn')?.rules?.[NOT_DISABLED_BY_DEFAULT_RULE]?.meta?.fixable,
    ).toBeUndefined();
  });
});
