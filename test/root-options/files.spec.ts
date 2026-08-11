describe('option: `files`', () => {
  it('does not create a respective config by default', async () => {
    const configResult = await computeEslintConfig({});

    expect(configResult.getConfigByUnPostfix('files/global')).toBeUndefined();
  });

  it('does not create a respective config when set to an empty array', async () => {
    const configResult = await computeEslintConfig({}, {un: {files: []}});

    expect(configResult.getConfigByUnPostfix('files/global')).toBeUndefined();
  });

  it('creates a respective config with only `files` when non-empty', async () => {
    const FILES = ['**/*.gjs', '**/*.gts'];

    const configResult = await computeEslintConfig({}, {un: {files: FILES}});

    const config = configResult.getConfigByUnPostfix('files/global');

    expect(config).toStrictEqual({
      name: expect.any(String) as unknown,
      files: FILES,
    });
  });

  it('passes nested array `files` patterns as-is', async () => {
    const FILES = [['**/*.gjs', '**/*.gts']];

    const configResult = await computeEslintConfig({}, {un: {files: FILES}});

    expect(configResult.getConfigByUnPostfix('files/global')).toMatchObject({files: FILES});
  });
});
