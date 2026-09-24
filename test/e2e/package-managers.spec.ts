import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {exec} from 'tinyexec';
import {inject} from 'vitest';
import * as z from 'zod';
import packageJson from '../../package.json' with {type: 'json'};

type CommandLine = readonly [command: string, ...args: string[]];

const PrintConfigZod = z.object({rules: z.record(z.string(), z.unknown())});

const LintResultsZod = z
  .object({
    filePath: z.string(),
    messages: z
      .object({ruleId: z.string().nullable(), messageId: z.string().optional(), line: z.number()})
      .array(),
  })
  .array();

const NPM_ENV_VARIABLE_REGEXP = /^npm_/i;

// `--print-config` output alone is around 100 kilobytes
const COMMAND_REPORT_STDOUT_MAX_LENGTH = 2000;

const FIXTURE_PROJECT_DIR = path.join(import.meta.dirname, 'fixtures', 'project');

const FIXTURE_JS_PROJECT_DIR = path.join(import.meta.dirname, 'fixtures', 'project-js');

const WORKSPACE_PACKAGE_DIR = 'packages/app';

const FIXTURE_EXAMPLE_LINES = (
  await fs.readFile(path.join(FIXTURE_PROJECT_DIR, 'src', 'example.ts'), 'utf8')
).split('\n');

const PACKAGE_MANAGERS_INSTALL_DIR = path.join(
  import.meta.dirname,
  '..',
  '..',
  'node_modules',
  '.cache',
  'e2e-package-managers',
);

const PNPM = `pnpm@${packageJson.devEngines.packageManager.version}` as const;

const YARN_BERRY = '@yarnpkg/cli-dist@4.18.0';

const AUBE = '@endevco/aube@2.2.4';

const FIXTURE_DEPENDENCIES = {
  // Its `exports` don't expose `package.json`
  clsx: '2.1.1',
  eslint: packageJson.devDependencies.eslint,
  'eslint-plugin-clsx': packageJson.devDependencies['eslint-plugin-clsx'],
  // Makes the inlined plugins spawn their Prettier workers
  prettier: packageJson.devDependencies.prettier,
  // Our own `typescript` dev dependency is an npm alias, so only its version is reusable
  typescript: packageJson.devDependencies.typescript.split('@').at(-1),
};

// Scripts receive the config of the package manager running them through these variables, which
// would override the fixture's `.npmrc`
const CHILD_PROCESS_ENV = {
  ...Object.fromEntries(
    Object.keys(process.env)
      .filter((name) => NPM_ENV_VARIABLE_REGEXP.test(name))
      .map((name) => [name, undefined]),
  ),
};

const getPnpmFiles = (extraSettings: string[] = []) => ({
  'pnpm-workspace.yaml': [
    'minimumReleaseAge: 0',
    // Dependencies' build scripts aren't needed, and an empty store reports them as an error
    'strictDepBuilds: false',
    // Install adds the ignored build scripts to this file, so `exec` would install again and print into stdout
    'verifyDepsBeforeRun: false',
    ...extraSettings,
  ].join('\n'),
});

const getYarnBerryFiles = (registryUrl: string, nodeLinker: 'node-modules' | 'pnp') => ({
  '.yarnrc.yml': [
    `nodeLinker: ${nodeLinker}`,
    `npmRegistryServer: "${registryUrl}"`,
    'unsafeHttpWhitelist: [localhost]',
    // Enabled by default in CI, but there is no lockfile to keep intact
    'enableImmutableInstalls: false',
    'enableTelemetry: false',
    'npmMinimalAgeGate: 0',
  ].join('\n'),
  // Marks the directory as a project root
  'yarn.lock': '',
});

// Release age gates are turned off, as our dependencies are often updated the day they're published
const PACKAGE_MANAGERS: {
  id: string;
  // Installed on first use, so local runs get the same version as CI
  npmPackage?: `${string}@${string}`;
  install: CommandLine;
  eslint: CommandLine;
  getFiles?: (registryUrl: string) => Record<string, string>;
  // Installs the project as a workspace package, leaving the monorepo root without dependencies
  isWorkspacePackage?: boolean;
}[] = [
  {
    id: 'npm',
    // npm 11 rejects the `eslint-plugin-es-x` version `eslint-plugin-n` depends on, as it doesn't satisfy our peer range
    install: ['npm', 'install', '--no-audit', '--no-fund', '--legacy-peer-deps'],
    eslint: ['npx', '--no-install', 'eslint'],
  },
  {
    id: 'pnpm',
    npmPackage: PNPM,
    install: ['pnpm', 'install', '--no-frozen-lockfile'],
    eslint: ['pnpm', 'exec', 'eslint'],
    getFiles: () => getPnpmFiles(),
  },
  {
    id: 'pnpm-gvs',
    npmPackage: PNPM,
    install: ['pnpm', 'install', '--no-frozen-lockfile'],
    // Unlike `pnpm exec`, adds no resolve hooks for the project's dependencies, just like editors
    eslint: ['node', 'node_modules/eslint/bin/eslint.js'],
    getFiles: () => getPnpmFiles(['virtualStoreType: global']),
  },
  {
    id: 'yarn-classic',
    npmPackage: 'yarn@1.22.22',
    install: ['yarn', 'install', '--non-interactive'],
    eslint: ['yarn', '--silent', 'eslint'],
  },
  {
    id: 'yarn-berry-pnp',
    npmPackage: YARN_BERRY,
    install: ['yarn', 'install'],
    eslint: ['yarn', 'eslint'],
    getFiles: (registryUrl) => getYarnBerryFiles(registryUrl, 'pnp'),
  },
  {
    id: 'yarn-berry-pnp-workspace',
    npmPackage: YARN_BERRY,
    install: ['yarn', 'install'],
    eslint: ['yarn', 'eslint'],
    getFiles: (registryUrl) => getYarnBerryFiles(registryUrl, 'pnp'),
    // PnP only falls back to the root's dependencies, so a workspace's ones reach ours only as our peers
    isWorkspacePackage: true,
  },
  {
    id: 'yarn-berry-node-modules',
    npmPackage: YARN_BERRY,
    install: ['yarn', 'install'],
    eslint: ['yarn', 'eslint'],
    getFiles: (registryUrl) => getYarnBerryFiles(registryUrl, 'node-modules'),
  },
  {
    id: 'bun',
    npmPackage: 'bun@1.4.2',
    install: ['bun', 'install'],
    eslint: ['bun', 'run', '--silent', 'eslint'],
  },
  {
    id: 'aube',
    npmPackage: AUBE,
    // Its global virtual store is only enabled outside CI by default
    install: ['aube', 'install', '--no-frozen-lockfile', '--disable-global-virtual-store'],
    eslint: ['aube', 'exec', 'eslint'],
  },
  {
    id: 'aube-gvs',
    npmPackage: AUBE,
    // Unlike the one of pnpm, it hoists the packages of every project into one shared `node_modules`
    install: ['aube', 'install', '--no-frozen-lockfile', '--enable-global-virtual-store'],
    eslint: ['aube', 'exec', 'eslint'],
  },
  {
    id: 'nub',
    npmPackage: '@nubjs/nub@0.9.1',
    install: ['nub', 'install', '--no-frozen-lockfile', '--minimum-release-age=0'],
    eslint: ['nubx', 'eslint'],
  },
  {
    id: 'deno',
    npmPackage: 'deno@2.9.6',
    install: ['deno', 'install', '--minimum-dependency-age=0'],
    eslint: ['deno', 'run', '--allow-all', 'node_modules/eslint/bin/eslint.js'],
  },
];

// Set in CI to run a single package manager per job
const SELECTED_PACKAGE_MANAGER_ID = process.env['E2E_PACKAGE_MANAGER'];

const installPackageManager = async (npmPackage: string) => {
  const installDir = path.join(PACKAGE_MANAGERS_INSTALL_DIR, npmPackage.replaceAll('/', '+'));
  const binDir = path.join(installDir, 'node_modules', '.bin');
  if (await fs.stat(installDir).catch(() => null)) {
    return binDir;
  }

  await fs.mkdir(PACKAGE_MANAGERS_INSTALL_DIR, {recursive: true});
  // Moved into place once complete, so an interrupted install is never reused
  const temporaryDir = await fs.mkdtemp(`${installDir}-`);
  // Otherwise npm would install into the closest parent project, which is this repository
  await fs.writeFile(path.join(temporaryDir, 'package.json'), '{}');

  const result = await exec('npm', ['install', '--no-audit', '--no-fund', npmPackage], {
    nodeOptions: {cwd: temporaryDir, env: CHILD_PROCESS_ENV},
  });
  if (result.exitCode !== 0) {
    throw new Error(`Failed to install \`${npmPackage}\`:\n${result.stderr}`);
  }

  await fs.rename(temporaryDir, installDir);
  return binDir;
};

const getEnabledRuleNames = (printConfigOutput: string) =>
  Object.entries(PrintConfigZod.parse(JSON.parse(printConfigOutput)).rules)
    .filter(([, ruleEntry]) => [ruleEntry].flat()[0] !== 0)
    .map(([ruleName]) => ruleName);

const getMessagesByFileName = (lintOutput: string) =>
  new Map(
    LintResultsZod.parse(JSON.parse(lintOutput)).map(({filePath, messages}) => [
      path.basename(filePath),
      messages,
    ]),
  );

const getFixtureExampleLine = (lineStart: string) =>
  FIXTURE_EXAMPLE_LINES.findIndex((line) => line.startsWith(lineStart)) + 1;

const setUpProject = async (
  {id, npmPackage, install, getFiles, isWorkspacePackage}: (typeof PACKAGE_MANAGERS)[number],
  fixtureDir: string,
  devDependencies: Record<string, string | undefined>,
) => {
  const packageManagerBinDir = npmPackage && (await installPackageManager(npmPackage));
  const env = {
    ...CHILD_PROCESS_ENV,
    PATH: [packageManagerBinDir, path.dirname(process.execPath), process.env['PATH']]
      .filter(Boolean)
      .join(path.delimiter),
  };

  const registryUrl = inject('registryUrl');
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), `un-e2e-${id}-`));
  onTestFinished(() => fs.rm(rootDir, {recursive: true, force: true}));

  const projectDir = isWorkspacePackage ? path.join(rootDir, WORKSPACE_PACKAGE_DIR) : rootDir;
  await fs.cp(fixtureDir, projectDir, {recursive: true});

  const projectManifest = JSON.stringify({
    private: true,
    type: 'module',
    devDependencies: {...devDependencies, [packageJson.name]: inject('packageVersion')},
  });
  const files = {
    ...(isWorkspacePackage
      ? {
          'package.json': JSON.stringify({private: true, workspaces: [WORKSPACE_PACKAGE_DIR]}),
          [path.join(WORKSPACE_PACKAGE_DIR, 'package.json')]: projectManifest,
        }
      : {'package.json': projectManifest}),
    '.npmrc': `registry=${registryUrl}\n`,
    ...getFiles?.(registryUrl),
  };
  await Promise.all(
    Object.entries(files).map(([fileName, contents]) =>
      fs.writeFile(path.join(rootDir, fileName), contents),
    ),
  );

  const commandReports: string[] = [];
  onTestFailed(() => {
    console.error(commandReports.join('\n\n'));
  });

  const run = async (commandLine: CommandLine, cwd = projectDir) => {
    const [command, ...args] = commandLine;
    const result = await exec(command, args, {
      // Otherwise the Node directory, which may have Corepack's shims, would precede the package manager
      nodePath: false,
      nodeOptions: {cwd, env},
    });
    commandReports.push(
      [
        `$ ${commandLine.join(' ')} (exit code ${result.exitCode})`,
        result.stderr,
        result.stdout.slice(-COMMAND_REPORT_STDOUT_MAX_LENGTH),
      ].join('\n'),
    );
    return result;
  };

  await expect(run(install, rootDir)).resolves.toHaveProperty('exitCode', 0);

  return run;
};

beforeAll(() => {
  if (
    SELECTED_PACKAGE_MANAGER_ID != null &&
    PACKAGE_MANAGERS.every(({id}) => id !== SELECTED_PACKAGE_MANAGER_ID)
  ) {
    throw new Error(`Unknown package manager \`${SELECTED_PACKAGE_MANAGER_ID}\``);
  }
});

describe.each(PACKAGE_MANAGERS)('$id', (packageManager) => {
  const {id, eslint} = packageManager;

  beforeEach(({skip}) => {
    if (SELECTED_PACKAGE_MANAGER_ID != null && SELECTED_PACKAGE_MANAGER_ID !== id) {
      skip();
    }
  });

  it('installs from the registry and lints the project', async () => {
    const run = await setUpProject(packageManager, FIXTURE_PROJECT_DIR, FIXTURE_DEPENDENCIES);

    const printConfigResult = await run([...eslint, '--print-config', 'src/example.ts']);

    expect(printConfigResult.exitCode).toBe(0);

    const enabledRuleNames = getEnabledRuleNames(printConfigResult.stdout);

    // `typescript` is detected
    expect(enabledRuleNames).toContain('ts/no-unnecessary-condition');
    expect(enabledRuleNames).not.toContain('no-unused-vars');
    // `clsx` is detected and its optional peer plugin is loaded
    expect(enabledRuleNames.filter((ruleName) => ruleName.startsWith('clsx/'))).not.toHaveLength(0);

    const lintResult = await run([
      ...eslint,
      '--format',
      'json',
      'src/example.ts',
      'src/index.html',
      'README.md',
    ]);

    // The fixture has lint errors on purpose, while a crash exits with 2
    expect(lintResult.exitCode).toBe(1);

    const messagesByFileName = getMessagesByFileName(lintResult.stdout);
    const exampleMessages = messagesByFileName.get('example.ts') || [];
    const arrowReturnStyleReports = exampleMessages
      .filter(({ruleId}) => ruleId === 'arrow-return-style/arrow-return-style')
      .map(({line, messageId}) => ({line, messageId}));

    // Type information is available
    expect(exampleMessages.map(({ruleId}) => ruleId)).toContain('ts/no-unnecessary-condition');
    // Only Prettier running in the worker knows these don't fit, otherwise the rule falls back to
    // comparing the line length with 80 and reports the opposite
    expect(arrowReturnStyleReports).toContainEqual({
      line: getFixtureExampleLine('export const isDefined'),
      messageId: 'use-explicit-return',
    });
    expect(arrowReturnStyleReports.map(({line}) => line)).not.toContain(
      getFixtureExampleLine('const sum'),
    );
    // A broken worker would crash the whole run instead
    expect(messagesByFileName.get('README.md')?.map(({ruleId}) => ruleId)).toContain(
      'prettier/prettier',
    );
    // The inlined `eslint-plugin-html` has to find and patch the project's own ESLint
    expect(messagesByFileName.get('index.html')?.map(({ruleId}) => ruleId)).toContain('no-eval');
    // The inlined `eslint-plugin-file-progress` prints through its inlined dependencies
    expect(lintResult.stderr).toContain('Processing:');
    // Fatal errors, like parsing ones, have no rule
    expect([...messagesByFileName.values()].flat().map(({ruleId}) => ruleId)).not.toContain(null);
  });

  // Only some package managers install `typescript` on their own, as a peer of `typescript-eslint`
  it('lints a project without TypeScript', async () => {
    const run = await setUpProject(packageManager, FIXTURE_JS_PROJECT_DIR, {
      eslint: packageJson.devDependencies.eslint,
    });

    const lintResult = await run([...eslint, '--format', 'json', 'src/example.js']);

    // The fixture has lint errors on purpose, while a crash exits with 2
    expect(lintResult.exitCode).toBe(1);
    expect(
      getMessagesByFileName(lintResult.stdout)
        .get('example.js')
        ?.map(({ruleId}) => ruleId),
    ).toContain('no-eval');
  });
});
