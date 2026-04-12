import {detect as detectPackageManager} from 'package-manager-detector/detect';

const FIXTURES = {
  pnpmWorkspace: 'pnpm-workspace.yaml',
  packageJson: 'package.json',
} as const;

vi.mock(import('package-manager-detector/detect'));

beforeEach(() => {
  vi.mocked(detectPackageManager).mockResolvedValue({name: 'pnpm', agent: 'pnpm'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('pnpm');

  it('loads `pnpm` plugin if used', () => {
    expect(configResult.getLoadedPlugin('pnpm')).toBeDefined();
  });

  it('creates `pnpm/package.json` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('pnpm/package.json')).toBeDefined();
  });

  it('creates `pnpm/pnpm-workspace-yaml` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create pnpm eslint configs', async () => {
      await expectConfigState({}, ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'], false);
    });

    it('creates pnpm eslint configs if explicitly enabled', async () => {
      await expectConfigState('pnpm', ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'], true);
    });

    it('does not create pnpm eslint configs if explicitly disabled and prints a warning', async () => {
      await expectConfigState(
        {pnpm: false},
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        ['pnpm', false],
      );
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates pnpm eslint configs (pnpm is detected as the package manager)', async () => {
      await expectConfigState(
        {},
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        true,
        'default',
      );
    });

    it('does not create pnpm eslint configs (pnpm is not detected as the package manager)', async () => {
      vi.mocked(detectPackageManager).mockResolvedValue({name: 'npm', agent: 'npm'});

      await expectConfigState(
        {},
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        false,
        'default',
      );
    });

    it('creates pnpm eslint configs if explicitly enabled and prints a warning', async () => {
      await expectConfigState(
        'pnpm',
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        ['pnpm', true],
        'default',
      );
    });

    it('does not create pnpm eslint configs if explicitly disabled', async () => {
      await expectConfigState(
        {pnpm: false},
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        false,
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates pnpm eslint configs (pnpm is detected as the package manager)', async () => {
      await expectConfigState(
        {},
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        true,
        'misc-enabled',
      );
    });

    it('creates pnpm eslint configs and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'pnpm',
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        ['pnpm', true],
        'misc-enabled',
      );
    });

    it('does not create pnpm eslint configs if explicitly disabled', async () => {
      await expectConfigState(
        {pnpm: false},
        ['pnpm/package.json', 'pnpm/pnpm-workspace-yaml'],
        false,
        'misc-enabled',
      );
    });
  });

  it('has default `files` in `pnpm/package.json` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('pnpm/package.json')?.files).toMatchInlineSnapshot(
      '["**/package.json"]',
    );
  });

  it('has default `files` in `pnpm/pnpm-workspace-yaml` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')?.files,
    ).toMatchInlineSnapshot('["pnpm-workspace.yaml"]');
  });

  it('has default `ignores` in `pnpm/package.json` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('pnpm/package.json')?.ignores?.length).toBeGreaterThan(
      0,
    );
  });

  it('has default `ignores` in `pnpm/pnpm-workspace-yaml` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('pnpm');

  it('enables `pnpm/json-valid-catalog` rule by default in `pnpm/package.json` eslint config', () => {
    expect(configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-valid-catalog')).toBe(
      2,
    );
  });

  it('disables `pnpm/json-enforce-catalog` rule by default in `pnpm/package.json` eslint config', () => {
    expect(
      configResult.getRuleEntrySeverity('pnpm/package.json', 'pnpm/json-enforce-catalog'),
    ).toBe(0);
  });

  it('`pnpm/json-valid-catalog` rule fires on a `package.json` with an invalid catalog reference', async () => {
    const results = await testEslintConfig('pnpm', FIXTURES.packageJson, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.packageJson,
      'pnpm/json-valid-catalog',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Catalog "catalog:" for package "react" is not defined in `pnpm-workspace.yaml`."',
    );
  });

  it('enables `pnpm/yaml-no-duplicate-catalog-item` rule by default in `pnpm/pnpm-workspace-yaml` eslint config', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'pnpm/pnpm-workspace-yaml',
        'pnpm/yaml-no-duplicate-catalog-item',
      ),
    ).toBe(2);
  });

  it('disables `pnpm/yaml-enforce-settings` rule by default in `pnpm/pnpm-workspace-yaml` eslint config', () => {
    expect(
      configResult.getRuleEntrySeverity('pnpm/pnpm-workspace-yaml', 'pnpm/yaml-enforce-settings'),
    ).toBe(0);
  });

  it('does not crash when linting pnpm-workspace.yaml when `yaml` config is not enabled', async () => {
    await expect(
      testEslintConfig('pnpm', FIXTURES.pnpmWorkspace, import.meta.dirname),
    ).resolves.toBeDefined();
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `pnpm` settings on `pnpm/package.json` eslint config by default', async () => {
      const configResult = await computeEslintConfig('pnpm');

      expect(
        configResult.getConfigByUnPostfix('pnpm/package.json')?.settings?.['pnpm'],
      ).toBeUndefined();
    });

    it('sets `pnpm` shared settings on `pnpm/package.json` eslint config when provided, but not on `pnpm/pnpm-workspace-yaml`', async () => {
      const SETTINGS = {ensureWorkspaceFile: true};

      const configResult = await computeEslintConfig({pnpm: {settings: SETTINGS}});

      expect(
        configResult.getConfigByUnPostfix('pnpm/package.json')?.settings?.['pnpm'],
      ).toStrictEqual(SETTINGS);
      expect(
        configResult.getConfigByUnPostfix('pnpm/pnpm-workspace-yaml')?.settings?.['pnpm'],
      ).toBeUndefined();
    });
  });
});
