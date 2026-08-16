import type {Environment, EslintConfigUnOptions} from '../../src/config-un/shared';
import * as utils from '../../src/utils';

const ENV_VAR_NAME = 'ESLINT_CONFIG_UN_ENVIRONMENT';

const IMPORT_INTEGRITY_SETTINGS = {packageRootDir: expect.any(String) as unknown};

/**
 * `fileProgress` and `importIntegrity` are the only configs affected by the resolved environment,
 * and between them their settings tell all three environments apart
 */
const EXPECTED_SETTINGS_PER_ENVIRONMENT = {
  default: {progress: {hide: false}, importIntegrity: IMPORT_INTEGRITY_SETTINGS},
  ci: {progress: {hide: true}, importIntegrity: {...IMPORT_INTEGRITY_SETTINGS, mode: 'one-shot'}},
  editor: {progress: {hide: true}, importIntegrity: {...IMPORT_INTEGRITY_SETTINGS, mode: 'editor'}},
} satisfies Record<Environment, unknown>;

const getResolvedEnvironmentSettings = async (
  environment: EslintConfigUnOptions['environment'],
) => {
  const configResult = await computeEslintConfig(
    {fileProgress: true, importIntegrity: true},
    {un: {environment}},
  );

  return {
    progress: configResult.getConfigByUnPostfix('file-progress')?.settings?.['progress'],
    importIntegrity:
      configResult.getConfigByUnPostfix('import-integrity')?.settings?.['import-integrity'],
  };
};

const mockDetectedEnvironment = ({isInCi, isInEditor}: {isInCi: boolean; isInEditor: boolean}) => {
  vi.spyOn(utils, 'isInCi', 'get').mockReturnValue(isInCi);
  vi.spyOn(utils, 'isInEditor').mockReturnValue(isInEditor);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('option: `environment`', () => {
  it.each(['default', 'ci', 'editor'] as const)(
    'applies the explicitly set `%s` environment',
    async (environment) => {
      await expect(getResolvedEnvironmentSettings(environment)).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT[environment],
      );
    },
  );

  describe('auto-detection', () => {
    it.each([
      {detected: 'ci', isInCi: true, isInEditor: false},
      {detected: 'editor', isInCi: false, isInEditor: true},
      {detected: 'default', isInCi: false, isInEditor: false},
      {detected: 'ci', isInCi: true, isInEditor: true},
    ] as const)(
      'detects the `$detected` environment (isInCi: $isInCi, isInEditor: $isInEditor)',
      async ({detected, ...detection}) => {
        mockDetectedEnvironment(detection);

        await expect(getResolvedEnvironmentSettings(undefined)).resolves.toStrictEqual(
          EXPECTED_SETTINGS_PER_ENVIRONMENT[detected],
        );
      },
    );
  });

  describe('function form', () => {
    it('is passed the detected environment and its result is used', async () => {
      mockDetectedEnvironment({isInCi: false, isInEditor: true});

      const environment = vi.fn<(detected: Environment) => Environment>(() => 'ci');

      await expect(getResolvedEnvironmentSettings(environment)).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT.ci,
      );

      expect(environment).toHaveBeenCalledWith('editor');
    });

    it('keeps the detected environment if it returns a nullish value', async () => {
      mockDetectedEnvironment({isInCi: false, isInEditor: true});

      await expect(getResolvedEnvironmentSettings(() => undefined)).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT.editor,
      );
    });
  });

  describe(`\`${ENV_VAR_NAME}\` environment variable`, () => {
    it.each(['default', 'ci', 'editor'] as const)('applies the `%s` value', async (environment) => {
      mockDetectedEnvironment({isInCi: false, isInEditor: true});
      vi.stubEnv(ENV_VAR_NAME, environment);

      await expect(getResolvedEnvironmentSettings(undefined)).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT[environment],
      );
    });

    it('loses to the explicitly set option', async () => {
      vi.stubEnv(ENV_VAR_NAME, 'ci');

      await expect(getResolvedEnvironmentSettings('editor')).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT.editor,
      );
    });

    it('is passed to the function form instead of the detected environment', async () => {
      mockDetectedEnvironment({isInCi: false, isInEditor: true});
      vi.stubEnv(ENV_VAR_NAME, 'ci');

      const environment = vi.fn<(detected: Environment) => undefined>(() => undefined);

      await expect(getResolvedEnvironmentSettings(environment)).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT.ci,
      );

      expect(environment).toHaveBeenCalledWith('ci');
    });

    it('is ignored and reported when its value is not a known environment', async () => {
      const processOutput = spyOnProcessOutput();
      mockDetectedEnvironment({isInCi: false, isInEditor: true});
      vi.stubEnv(ENV_VAR_NAME, 'Editor');

      await expect(getResolvedEnvironmentSettings(undefined)).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT.editor,
      );

      expect(processOutput.getStderrOutput()).toContain(
        `Ignoring ${ENV_VAR_NAME} environment variable`,
      );
    });

    it('is silently ignored when empty', async () => {
      const processOutput = spyOnProcessOutput();
      mockDetectedEnvironment({isInCi: false, isInEditor: true});
      vi.stubEnv(ENV_VAR_NAME, '');

      await expect(getResolvedEnvironmentSettings(undefined)).resolves.toStrictEqual(
        EXPECTED_SETTINGS_PER_ENVIRONMENT.editor,
      );

      expect(processOutput.getStderrOutput()).toBe('');
    });
  });
});
