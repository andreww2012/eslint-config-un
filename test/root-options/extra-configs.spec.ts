describe('option: `extraConfigs`', () => {
  it('appends a config without rules as-is', async () => {
    const configResult = await computeEslintConfig(
      {},
      {un: {extraConfigs: [{files: ['**/*.foo']}]}},
    );

    expect(configResult.getConfigByUnPostfix('extra-config/unnamed0')).toStrictEqual({
      name: 'eslint-config-un/extra-config/unnamed0',
      files: ['**/*.foo'],
    });
  });

  it('numbers the unnamed configs by their index', async () => {
    const configResult = await computeEslintConfig(
      {},
      {un: {extraConfigs: [{files: ['**/*.foo']}, {name: 'named'}, {files: ['**/*.bar']}]}},
    );

    expect(
      configResult
        .getConfigsByUnPostfix((postfix) => postfix.startsWith('extra-config/'))
        .map(({name}) => name),
    ).toStrictEqual(['extra-config/unnamed0', 'extra-config/named', 'extra-config/unnamed2']);
  });

  it('places the configs after the built-in ones', async () => {
    const configResult = await computeEslintConfig('unicorn', {
      un: {extraConfigs: [{name: 'named'}]},
    });

    const configNames = configResult.config.map(({name}) => name);

    expect(configNames.indexOf('eslint-config-un/extra-config/named')).toBeGreaterThan(
      configNames.indexOf('eslint-config-un/unicorn'),
    );
  });

  it('renames the plugin prefixes in `rules`', async () => {
    const configResult = await computeEslintConfig(
      {},
      {
        un: {
          plugins: {unicorn: {prefix: 'unicorn-renamed'}},
          extraConfigs: [{name: 'named', rules: {'unicorn/no-null': 'error'}}],
        },
      },
    );

    expect(configResult.getConfigByUnPostfix('extra-config/named')?.rules).toStrictEqual({
      'unicorn-renamed/no-null': 'error',
    });
  });

  it('moves a rule restricted to its own `files` into a separate config', async () => {
    const configResult = await computeEslintConfig(
      {},
      {
        un: {
          extraConfigs: [
            {
              name: 'named',
              rules: {
                'unicorn/no-null': {severity: 'error', files: ['**/*.foo']},
                'unicorn/no-array-for-each': 'error',
              },
            },
          ],
        },
      },
    );

    expect(configResult.getConfigByUnPostfix('extra-config/named')?.rules).toStrictEqual({
      'unicorn/no-array-for-each': 'error',
    });
    expect(
      configResult.getConfigByUnPostfix('extra-config/named/@rule/unicorn/no-null'),
    ).toStrictEqual({
      name: 'eslint-config-un/extra-config/named/@rule/unicorn/no-null',
      files: ['**/*.foo'],
      rules: {'unicorn/no-null': 'error'},
    });
  });

  it('loads the plugins the rules belong to', async () => {
    const configResult = await computeEslintConfig(
      {},
      {un: {extraConfigs: [{name: 'named', rules: {'unicorn/no-null': 'error'}}]}},
    );

    expect(configResult.getLoadedPlugin('unicorn')).toBeDefined();
  });
});
