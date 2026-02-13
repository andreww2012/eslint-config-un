describe('pnpm config', () => {
  it('does not crash when linting pnpm-workspace.yaml when `yaml` config is not enabled', async () => {
    const fixtureFileName = 'pnpm-workspace.yaml';

    await expect(
      testEslintConfig(
        {
          pnpm: true,
        },
        fixtureFileName,
        import.meta.dirname,
      ),
    ).resolves.toBeDefined();
  });
});
