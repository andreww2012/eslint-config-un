import {detect as detectPackageManager} from 'package-manager-detector/detect';

vi.mock(import('package-manager-detector/detect'), async (importOriginal) => {
  const mod = await importOriginal();
  return {...mod, detect: vi.fn<typeof mod.detect>(mod.detect)};
});

const mockedPackageNames: string[] = [];

/**
 * Makes importing `packageName` fail as if it were not installed
 */
const mockUnresolvablePackage = (packageName: string, blamedPackageName = packageName) => {
  vi.resetModules();
  vi.doMock(packageName, () => ({
    get default() {
      throw Object.assign(new Error(`Cannot find module '${blamedPackageName}'`), {
        code: 'ERR_MODULE_NOT_FOUND',
      });
    },
  }));
  mockedPackageNames.push(packageName);
};

let processOutput: ReturnType<typeof spyOnProcessOutput>;

const stderrOutput = () => processOutput.getStderrOutput();

beforeEach(() => {
  processOutput = spyOnProcessOutput();
});

afterEach(() => {
  mockedPackageNames.forEach((packageName) => {
    vi.doUnmock(packageName);
  });
  mockedPackageNames.length = 0;
  vi.resetModules();
});

const DE_MORGAN_PACKAGE = 'eslint-plugin-de-morgan';
const CASE_POLICE_PACKAGE = 'eslint-plugin-case-police';
const VUE_PARSER_PACKAGE = 'vue-eslint-parser';
const SVELTE_PLUGIN_PACKAGE = 'eslint-plugin-svelte';
const MERGE_PROCESSORS_PACKAGE = 'eslint-merge-processors';
const JSON_PLUGIN_PACKAGE = '@eslint/json';
const IMPORT_INTEGRITY_PACKAGE = 'import-integrity-lint';

describe('a plugin listed in optional peer dependencies is not installed', () => {
  it('reports the package and exits', async () => {
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);

    await computeEslintConfig('deMorgan');

    expect(processOutput.exit).toHaveBeenCalledWith(1);

    const output = stderrOutput();

    expect(output).toContain(DE_MORGAN_PACKAGE);
    expect(output).toContain('not installed');
    expect(output).toContain('Plugin that listed in optional peer dependencies was used');
  });

  it('names the config that asked for the package', async () => {
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);

    await computeEslintConfig('deMorgan');

    expect(stderrOutput()).toContain('deMorgan config');
  });

  it('names every config that asked for the package', async () => {
    mockUnresolvablePackage(JSON_PLUGIN_PACKAGE);

    await computeEslintConfig({json: true, ava: true});

    expect(stderrOutput()).toContain('ava, json configs');
  });

  it('names the root option that asked for the package', async () => {
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);

    await computeEslintConfig(
      {},
      {un: {extraConfigs: [{rules: {'de-morgan/no-negated-conjunction': 'error'}}]}},
    );

    expect(stderrOutput()).toContain('extraConfigs option');
  });

  it('names every root option that asked for the package', async () => {
    mockUnresolvablePackage(IMPORT_INTEGRITY_PACKAGE);

    await computeEslintConfig(
      {},
      {un: {useImportIntegrity: true, loadPluginsOnDemand: {alwaysLoad: ['import-integrity']}}},
    );

    expect(stderrOutput()).toContain('loadPluginsOnDemand, useImportIntegrity options');
  });

  it('names both the configs and the options that asked for the package', async () => {
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);

    await computeEslintConfig('deMorgan', {
      un: {extraConfigs: [{rules: {'de-morgan/no-negated-conjunction': 'error'}}]},
    });

    expect(stderrOutput()).toContain('deMorgan config, extraConfigs option');
  });

  it('suggests an installation command for the required and the minimal version', async () => {
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);

    await computeEslintConfig('deMorgan');

    const output = stderrOutput();

    expect(output).toContain('Install them with:');
    expect(output).toContain(`i --save-dev ${DE_MORGAN_PACKAGE}`);
  });

  it('additionally reports a dependency an eagerly loaded plugin failed to load', async () => {
    const MISSING_DEPENDENCY = 'some-uninstalled-dependency';

    mockUnresolvablePackage(SVELTE_PLUGIN_PACKAGE, MISSING_DEPENDENCY);

    await computeEslintConfig({});

    const output = stderrOutput();

    expect(output).toContain(MISSING_DEPENDENCY);
    expect(output).toContain('Package that listed in optional peer dependencies was used');
    expect(output).toContain('Unknown');
    expect(output).toContain(`${MISSING_DEPENDENCY}@latest`);
    expect(output).toContain(`a dependency of ${SVELTE_PLUGIN_PACKAGE}`);
  });

  it('additionally reports a dependency a lazily loaded plugin failed to load', async () => {
    const MISSING_DEPENDENCY = 'some-uninstalled-dependency';

    mockUnresolvablePackage(DE_MORGAN_PACKAGE, MISSING_DEPENDENCY);

    await computeEslintConfig('deMorgan');

    const output = stderrOutput();

    expect(output).toContain(DE_MORGAN_PACKAGE);
    expect(output).toContain(MISSING_DEPENDENCY);
    // The two entries are of different kinds: one is a plugin, the other a plain package
    expect(output).toContain('Plugin and package that listed in optional peer dependencies were');
  });

  it('reports a package a config loads on its own besides the plugin', async () => {
    mockUnresolvablePackage(SVELTE_PLUGIN_PACKAGE);

    await computeEslintConfig('svelte');

    expect(processOutput.exit).toHaveBeenCalledWith(1);
    expect(stderrOutput()).toContain(SVELTE_PLUGIN_PACKAGE);
  });

  it('reports several missing plugins at once', async () => {
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);
    mockUnresolvablePackage(CASE_POLICE_PACKAGE);

    await computeEslintConfig({deMorgan: true, casePolice: true});

    const output = stderrOutput();

    expect(output).toContain(DE_MORGAN_PACKAGE);
    expect(output).toContain(CASE_POLICE_PACKAGE);
    expect(output).toContain('Plugins that listed in optional peer dependencies were used');
    expect(output).toContain('disable corresponding configs');
  });

  it('falls back to a generic installation command when no package manager is detected', async () => {
    vi.mocked(detectPackageManager).mockResolvedValueOnce(null);
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);

    await computeEslintConfig('deMorgan');

    expect(stderrOutput()).toContain('<your package manager> i --save-dev');
  });

  it('reports a parser that cannot be loaded', async () => {
    addInstalledPackages({vue: '3.5.0'});
    mockUnresolvablePackage(VUE_PARSER_PACKAGE);

    await computeEslintConfig('vue');

    expect(processOutput.exit).toHaveBeenCalledWith(1);
    expect(stderrOutput()).toContain(VUE_PARSER_PACKAGE);
  });
});

describe('a package that is not an optional peer dependency cannot be loaded', () => {
  it('rethrows the error instead of reporting it', async () => {
    addInstalledPackages({vue: '3.5.0'});
    mockUnresolvablePackage(MERGE_PROCESSORS_PACKAGE);

    await expect(computeEslintConfig('vue')).rejects.toThrow(
      `Cannot find module '${MERGE_PROCESSORS_PACKAGE}'`,
    );
  });
});

describe('an installed plugin does not satisfy the supported version range', () => {
  beforeEach(() => {
    addInstalledPackages({[DE_MORGAN_PACKAGE]: '1.0.0'});
  });

  it('warns instead of exiting', async () => {
    await computeEslintConfig('deMorgan');

    const output = stderrOutput();

    expect(processOutput.exit).not.toHaveBeenCalled();
    expect(output).toContain('does not satisfy the supported version range');
    expect(output).toContain(DE_MORGAN_PACKAGE);
  });

  it('names the config that asked for the package', async () => {
    await computeEslintConfig('deMorgan');

    expect(stderrOutput()).toContain('deMorgan config');
  });

  it('prints nothing when the internal `disableWarnings` option is set', async () => {
    await computeEslintConfig('deMorgan', {internalOptions: {disableWarnings: true}});

    expect(stderrOutput()).toBe('');
  });
});

describe('a plugin is only loaded to check whether a config depending on it can be enabled', () => {
  it('is not reported when it is not installed', async () => {
    mockUnresolvablePackage(SVELTE_PLUGIN_PACKAGE);

    await computeEslintConfig({});

    expect(processOutput.exit).not.toHaveBeenCalled();
    expect(stderrOutput()).not.toContain(SVELTE_PLUGIN_PACKAGE);
  });
});
