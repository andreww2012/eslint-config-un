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

const spyOnProcessOutput = () => ({
  exit: vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never),
  stderr: vi.spyOn(process.stderr, 'write').mockReturnValue(true),
});

let processOutput: ReturnType<typeof spyOnProcessOutput>;

const stderrOutput = () => processOutput.stderr.mock.calls.map(([chunk]) => String(chunk)).join('');

beforeEach(() => {
  processOutput = spyOnProcessOutput();
});

afterEach(() => {
  mockedPackageNames.forEach((packageName) => {
    vi.doUnmock(packageName);
  });
  mockedPackageNames.length = 0;
  vi.resetModules();
  vi.restoreAllMocks();
});

const DE_MORGAN_PACKAGE = 'eslint-plugin-de-morgan';
const VUE_PARSER_PACKAGE = 'vue-eslint-parser';
const SVELTE_PLUGIN_PACKAGE = 'eslint-plugin-svelte';
const MERGE_PROCESSORS_PACKAGE = 'eslint-merge-processors';

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

  it('suggests an installation command for the required and the minimal version', async () => {
    mockUnresolvablePackage(DE_MORGAN_PACKAGE);

    await computeEslintConfig('deMorgan');

    const output = stderrOutput();

    expect(output).toContain('Install them with:');
    expect(output).toContain(`i --save-dev ${DE_MORGAN_PACKAGE}`);
  });

  it('reports a dependency an eagerly loaded plugin itself failed to load', async () => {
    const MISSING_DEPENDENCY = 'some-uninstalled-dependency';

    mockUnresolvablePackage(SVELTE_PLUGIN_PACKAGE, MISSING_DEPENDENCY);

    await computeEslintConfig({});

    const output = stderrOutput();

    expect(output).toContain(MISSING_DEPENDENCY);
    expect(output).toContain('Package that listed in optional peer dependencies was used');
    expect(output).toContain('Unknown');
    expect(output).toContain(`${MISSING_DEPENDENCY}@latest`);
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

  it('names the plugin prefix the package is used by', async () => {
    await computeEslintConfig('deMorgan');

    expect(stderrOutput()).toContain('de-morgan');
  });
});
