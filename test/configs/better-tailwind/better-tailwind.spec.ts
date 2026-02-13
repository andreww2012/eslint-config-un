import path from 'node:path';

describe('betterTailwind config', () => {
  const entryPoint = path.posix.resolve(import.meta.dirname, 'fixtures', 'tailwind-entry.css');

  it('should trigger better-tailwindcss/no-duplicate-classes on duplicate classes', async () => {
    const fixtureFileName = 'tailwind-in-jsx-duplicate-classes.jsx';

    const result = await testEslintConfig(
      {
        betterTailwind: {
          files: ['**'], // TODO not linted otherwise
          settings: {
            entryPoint,
          },
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const message = findLintMessageFromLintResults(
      result,
      fixtureFileName,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(message).toBeDefined();
  });

  it('should not trigger better-tailwindcss/no-duplicate-classes on unique classes', async () => {
    const fixtureFileName = 'tailwind-in-jsx-no-duplicate-classes.jsx';

    const result = await testEslintConfig(
      {
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const message = findLintMessageFromLintResults(
      result,
      fixtureFileName,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(message).toBeUndefined();
  });

  it('should lint CSS files when css config is enabled', async () => {
    const fixtureFileName = 'tailwind-in-css-duplicate-classes.css';

    const result = await testEslintConfig(
      {
        css: true,
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const message = findLintMessageFromLintResults(
      result,
      fixtureFileName,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(message).toBeDefined();
  });

  it('does not lint CSS files when css config is not enabled', async () => {
    const fixtureFileName = 'tailwind-in-css-duplicate-classes.css';

    const result = await testEslintConfig(
      {
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const message = result
      .find((r) => r.filePath.endsWith(fixtureFileName))
      ?.messages.find((m) =>
        m.message.includes('File ignored because no matching configuration was supplied'),
      );

    expect(message).toBeDefined();
  });

  it('can lint CSS and non-CSS files at the same time (given the non-CSS file matches at least one config)', async () => {
    const cssFixtureFileName = 'tailwind-in-css-duplicate-classes.css';
    const jsxFixtureFileName = 'tailwind-in-jsx-duplicate-classes.jsx';

    const result = await testEslintConfig(
      {
        css: true,
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      [cssFixtureFileName, jsxFixtureFileName],
      {
        un: {
          extraConfigs: [
            // If `.jsx` file is not matched by any other config, it'll be ignored and there is no way to avoid this behavior
            {
              files: ['**/*.jsx'],
            },
          ],
        },
        searchFixturesRelativeToPath: import.meta.dirname,
      },
    );

    const messageForCssFile = findLintMessageFromLintResults(
      result[0],
      cssFixtureFileName,
      'better-tailwindcss/no-duplicate-classes',
    );

    const messageForJsxFile = findLintMessageFromLintResults(
      result[1],
      jsxFixtureFileName,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(messageForCssFile).toBeDefined();
    expect(messageForJsxFile).toBeDefined();
  });
});
