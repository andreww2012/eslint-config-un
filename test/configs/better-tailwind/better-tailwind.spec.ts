import path from 'node:path';

const FIXTURES = {
  tailwindInJsxDuplicateClasses: 'tailwind-in-jsx-duplicate-classes.jsx',
  tailwindInJsxNoDuplicateClasses: 'tailwind-in-jsx-no-duplicate-classes.jsx',
  tailwindInCssDuplicateClasses: 'tailwind-in-css-duplicate-classes.css',
} as const;

describe('betterTailwind config', () => {
  const entryPoint = path.posix.resolve(import.meta.dirname, 'fixtures', 'tailwind-entry.css');

  it('should trigger better-tailwindcss/no-duplicate-classes on duplicate classes', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          files: ['**'], // TODO not linted otherwise
          settings: {
            entryPoint,
          },
        },
      },
      FIXTURES.tailwindInJsxDuplicateClasses,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.tailwindInJsxDuplicateClasses,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Duplicate classname: "flex"."`);
  });

  it('should not trigger better-tailwindcss/no-duplicate-classes on unique classes', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      FIXTURES.tailwindInJsxNoDuplicateClasses,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.tailwindInJsxNoDuplicateClasses,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(error).toBeUndefined();
  });

  it('should lint CSS files when css config is enabled', async () => {
    const result = await testEslintConfig(
      {
        css: true,
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      FIXTURES.tailwindInCssDuplicateClasses,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.tailwindInCssDuplicateClasses,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Duplicate classname: "flex"."`);
  });

  it('does not lint CSS files when css config is not enabled', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      FIXTURES.tailwindInCssDuplicateClasses,
      import.meta.dirname,
    );

    const error = result.find((r) => r.filePath.endsWith(FIXTURES.tailwindInCssDuplicateClasses));

    expect(error?.messages?.[0]?.message).toMatchInlineSnapshot(
      `"File ignored because no matching configuration was supplied."`,
    );
  });

  it('can lint CSS and non-CSS files at the same time (given the non-CSS file matches at least one config)', async () => {
    const result = await testEslintConfig(
      {
        css: true,
        betterTailwind: {
          settings: {
            entryPoint,
          },
        },
      },
      [FIXTURES.tailwindInCssDuplicateClasses, FIXTURES.tailwindInJsxDuplicateClasses],
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

    const errorForCssFile = findLintMessageFromLintResults(
      result[0],
      FIXTURES.tailwindInCssDuplicateClasses,
      'better-tailwindcss/no-duplicate-classes',
    );

    const errorForJsxFile = findLintMessageFromLintResults(
      result[1],
      FIXTURES.tailwindInJsxDuplicateClasses,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(errorForCssFile?.message).toMatchInlineSnapshot(`"Duplicate classname: "flex"."`);
    expect(errorForJsxFile?.message).toMatchInlineSnapshot(`"Duplicate classname: "flex"."`);
  });
});
