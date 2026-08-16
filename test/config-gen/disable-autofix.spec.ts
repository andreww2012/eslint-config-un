const GEN_MODULE_PATH = '../../src/eslint-types-fixable-only.gen';

const FIXTURES = {
  zeroFractionNumber: 'zero-fraction-number.js',
} as const;

const getDisableAutofixPluginRuleNames = async (
  ...args: Parameters<typeof computeEslintConfig>
) => {
  const configResult = await computeEslintConfig(...args);

  return Object.keys(
    configResult.getConfigByUnPostfix('global-setup/plugins')?.plugins?.['disable-autofix']
      ?.rules || {},
  );
};

describe('`disable-autofix` counterpart rule is added only for fixable rules', () => {
  describe('rule disabled via `addRule`', () => {
    it('adds the disabled counterpart for a fixable rule', async () => {
      const configResult = await computeEslintConfig('antfu');

      // `antfu/curly` is fixable and disabled by the antfu config
      expect(configResult.getRuleEntry('antfu', 'antfu/curly')).toBe(0);
      expect(configResult.getRuleEntry('antfu', 'disable-autofix/antfu/curly')).toBe(0);
    });

    it('does not add the counterpart for a non-fixable rule', async () => {
      const configResult = await computeEslintConfig('antfu');

      // `antfu/no-import-dist` is NOT fixable and disabled by the antfu config
      expect(configResult.getRuleEntry('antfu', 'antfu/no-import-dist')).toBe(0);
      expect(
        configResult.getRuleEntry('antfu', 'disable-autofix/antfu/no-import-dist'),
      ).toBeUndefined();
    });

    it('adds the counterpart for a fixable rule of a prefixed plugin', async () => {
      const configResult = await computeEslintConfig('markdown');

      // `markdown/no-bare-urls` is fixable and disabled by the markdown config
      expect(configResult.getRuleEntry('markdown/markdown', 'markdown/no-bare-urls')).toBe(0);
      expect(
        configResult.getRuleEntry('markdown/markdown', 'disable-autofix/markdown/no-bare-urls'),
      ).toBe(0);
    });
  });

  describe('rule disabled via `disableAnyRule`', () => {
    it('adds the disabled counterpart for a fixable rule', async () => {
      const configResult = await computeEslintConfig('math');

      expect(configResult.getRuleEntry('math', 'prefer-exponentiation-operator')).toBe(0);
      expect(
        configResult.getRuleEntry('math', 'disable-autofix/prefer-exponentiation-operator'),
      ).toBe(0);
    });

    it('does not add the counterpart for a non-fixable rule', async () => {
      const configResult = await computeEslintConfig('regexp');

      expect(configResult.getRuleEntry('regexp', 'no-control-regex')).toBe(0);
      expect(
        configResult.getRuleEntry('regexp', 'disable-autofix/no-control-regex'),
      ).toBeUndefined();
    });
  });

  describe('rule disabled via `disableBulkRules`', () => {
    it('adds the counterpart only for fixable rules in the bulk-disabled set', async () => {
      const configResult = await computeEslintConfig('cli');

      expect(configResult.getRuleEntry('cli', 'node/hashbang')).toBe(0);
      expect(configResult.getRuleEntry('cli', 'disable-autofix/node/hashbang')).toBe(0);

      expect(configResult.getRuleEntry('cli', 'no-console')).toBe(0);
      expect(configResult.getRuleEntry('cli', 'disable-autofix/no-console')).toBeUndefined();
    });
  });
});

describe('`disable-autofix` plugin only holds the rules with an enabled counterpart', () => {
  it('registers no rules when a config merely enables a fixable rule in bulk', async () => {
    await expect(getDisableAutofixPluginRuleNames('cli')).resolves.toStrictEqual([]);
  });

  it('registers the rule whose counterpart is enabled via `disableAutofix`', async () => {
    await expect(
      getDisableAutofixPluginRuleNames({
        unicorn: {
          overrides: {'unicorn/no-zero-fractions': {severity: 2, disableAutofix: true}},
        },
      }),
    ).resolves.toContain('unicorn/no-zero-fractions');
  });

  it('reports through the enabled counterpart rule', async () => {
    const lintResults = await testEslintConfig(
      {
        unicorn: {
          overrides: {'unicorn/no-zero-fractions': {severity: 2, disableAutofix: true}},
        },
      },
      FIXTURES.zeroFractionNumber,
      import.meta.dirname,
    );

    expect(
      findLintMessageFromLintResults(
        lintResults,
        FIXTURES.zeroFractionNumber,
        'disable-autofix/unicorn/no-zero-fractions',
      )?.message,
    ).toMatchInlineSnapshot(`"Don't use a zero fraction in the number."`);
  });
});

it('skips the `disable-autofix` counterpart when the fixable-rules data fails to load', async () => {
  vi.resetModules();
  vi.doMock(GEN_MODULE_PATH, () => {
    throw new Error('Simulated missing generated module');
  });

  try {
    const configResult = await computeEslintConfig('antfu');

    // `antfu/curly` is fixable, but with the data unavailable no counterpart can be added
    expect(configResult.getRuleEntry('antfu', 'antfu/curly')).toBe(0);
    expect(configResult.getRuleEntry('antfu', 'disable-autofix/antfu/curly')).toBeUndefined();
  } finally {
    vi.doUnmock(GEN_MODULE_PATH);
    vi.resetModules();
  }
});
