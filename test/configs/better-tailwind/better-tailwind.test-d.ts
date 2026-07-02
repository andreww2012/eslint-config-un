import type {BetterTailwindEslintConfigOptions} from '../../../src/configs/better-tailwind';

type Settings = BetterTailwindEslintConfigOptions['settings'];

describe('option: `settings`', () => {
  it('allows using only `entryPoint`', () => {
    ({entryPoint: 'src/index.css'}) satisfies Settings;
  });

  it('allows using only `tailwindConfig`', () => {
    ({tailwindConfig: 'tailwind.config.js'}) satisfies Settings;
  });

  it('allows using `entryPoint` with other properties', () => {
    ({entryPoint: 'src/index.css', cwd: '/path/to/project'}) satisfies Settings;
  });

  it('allows using `tailwindConfig` with other properties', () => {
    ({tailwindConfig: 'tailwind.config.js', cwd: '/path/to/project'}) satisfies Settings;
  });

  it('does not allow using `entryPoint` and `tailwindConfig` properties at the same time', () => {
    ({
      entryPoint: 'src/index.css',
      // @ts-expect-error - assertion
      tailwindConfig: 'tailwind.config.js',
    }) satisfies Settings;
  });

  it('does not allow omitting both `entryPoint` and `tailwindConfig`', () => {
    ({
      // @ts-expect-error - assertion
    }) satisfies Settings;
  });
});
