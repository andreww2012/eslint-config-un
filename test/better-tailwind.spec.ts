describe('betterTailwind config', () => {
  it('should trigger better-tailwindcss/no-duplicate-classes on duplicate classes', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          files: ['**'], // TODO not linted otherwise
          settings: {
            entryPoint: 'fixtures/tailwind-entry.css',
          },
        },
      },
      'better-tailwind-duplicate-classes.jsx',
    );

    const message = findLintMessageFromLintResults(
      result,
      'better-tailwind-duplicate-classes.jsx',
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(message).toBeDefined();
  });

  it('should not trigger better-tailwindcss/no-duplicate-classes on unique classes', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          settings: {
            entryPoint: 'fixtures/tailwind-entry.css',
          },
        },
      },
      'better-tailwind-no-duplicate.jsx',
    );

    const message = findLintMessageFromLintResults(
      result,
      'better-tailwind-no-duplicate.jsx',
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(message).toBeUndefined();
  });

  it('should lint CSS files when css config is enabled', async () => {
    const result = await testEslintConfig(
      {
        css: true,
        betterTailwind: {
          settings: {
            entryPoint: 'fixtures/tailwind-entry.css',
          },
        },
      },
      'better-tailwind-css-duplicate.css',
    );

    const message = findLintMessageFromLintResults(
      result,
      'better-tailwind-css-duplicate.css',
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(message).toBeDefined();
  });

  it('does not lint CSS files when css config is not enabled', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          settings: {
            entryPoint: 'fixtures/tailwind-entry.css',
          },
        },
      },
      'better-tailwind-css-duplicate.css',
    );

    const message = result
      .find((r) => r.filePath.endsWith('better-tailwind-css-duplicate.css'))
      ?.messages.find((m) =>
        m.message.includes('File ignored because no matching configuration was supplied'),
      );

    expect(message).toBeDefined();
  });

  it('can lint CSS and non-CSS files at the same time (given the non-CSS file matches at least one config)', async () => {
    const result = await testEslintConfig(
      {
        css: true,
        betterTailwind: {
          settings: {
            entryPoint: 'fixtures/tailwind-entry.css',
          },
        },
      },
      ['better-tailwind-css-duplicate.css', 'better-tailwind-duplicate-classes.jsx'],
      {
        extraConfigs: [
          // If `.jsx` file is not matched by any other config, it'll be ignored and there is no way to avoid this behavior
          {
            files: ['**/*.jsx'],
          },
        ],
      },
    );

    const messageForCssFile = findLintMessageFromLintResults(
      result[0],
      'better-tailwind-css-duplicate.css',
      'better-tailwindcss/no-duplicate-classes',
    );

    const messageForJsxFile = findLintMessageFromLintResults(
      result[1],
      'better-tailwind-duplicate-classes.jsx',
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(messageForCssFile).toBeDefined();
    expect(messageForJsxFile).toBeDefined();
  });
});
