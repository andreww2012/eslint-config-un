import path from 'node:path';
import markdown from '@eslint/markdown';
import htmlEslintPlugin from '@html-eslint/eslint-plugin';
import * as htmlEslintParser from '@html-eslint/parser';
import * as eslint from 'eslint';
import type {Linter, Rule} from 'eslint';
import * as espree from 'espree';
import eslintPluginHtmlScripts, {
  type HtmlProcessorOptions,
  createProcessor,
  parser as eslintPluginHtmlScriptsParser,
} from '../../src/plugin-html-scripts';
import {deleteFileScripts, setFileScripts} from '../../src/plugin-html-scripts/scope-sharing';
import {pick} from '../../src/utils';

const FIXTURES = {
  crlfNewlines: 'crlf-newlines.html',
  doubleSemicolon: 'double-semicolon.html',
  doubleSemicolonWithBom: 'double-semicolon-with-bom.html',
  evalWithDisableComment: 'eval-with-disable-comment.html',
  imageWithoutAltAndScript: 'image-without-alt-and-script.html',
  oneLineScript: 'one-line-script.html',
  scriptStartingOnItsTagLine: 'script-starting-on-its-tag-line.html',
  scriptWithCdataXhtml: 'script-with-cdata.xhtml',
  scriptsWithDifferentIndentation: 'scripts-with-different-indentation.html',
  scriptsWithFooTypes: 'scripts-with-foo-types.html',
  scriptsWithVariousTypes: 'scripts-with-various-types.html',
  selfClosingScriptXhtml: 'self-closing-script.xhtml',
  severalScriptsWithConsoleLog: 'several-scripts-with-console-log.html',
  underIndentedLine: 'under-indented-line.html',
  variablesAcrossClassicAndModuleScripts: 'variables-across-classic-and-module-scripts.html',
  variablesAcrossScripts: 'variables-across-scripts.html',
} as const;

const PARSER_NOT_USED_MESSAGE =
  "The parser of eslint-plugin-un-html-scripts is not used for this script, so it doesn't see the global variables of the previous scripts. Set it in `languageOptions.parser`, and your parser in `parserOptions.parser`.";

const DEFAULT_HTML_CONFIG: Readonly<Linter.Config> = {
  files: ['**/*.html'],
  processor: createProcessor(),
};

const DEFAULT_JS_CONFIG: Readonly<Linter.Config> = {
  files: ['**/*.js', '**/*.mjs'],
  rules: {
    'no-console': 'error',
  },
};

const SCOPE_SHARING_CONFIG: Readonly<Linter.Config> = {
  files: ['**/*.html/*.js', '**/*.html/*.mjs'],
  plugins: {
    'html-scripts': eslintPluginHtmlScripts,
  },
  languageOptions: {
    parser: eslintPluginHtmlScriptsParser,
  },
  rules: {
    'html-scripts/scope-sharing': 'error',
  },
};

// What the `htmlScripts` Config sets up, minus the browser globals
const RECOMMENDED_CONFIGS: readonly Linter.Config[] = [
  {files: ['**/*.html', '**/*.htm', '**/*.xhtml'], processor: createProcessor()},
  {
    ...SCOPE_SHARING_CONFIG,
    files: ['**/*.html/*.js', '**/*.htm/*.js', '**/*.html/*.mjs', '**/*.htm/*.mjs'],
  },
  {files: ['**/*.html/*.js', '**/*.htm/*.js'], languageOptions: {sourceType: 'script'}},
];

const getFixturePath = (file: string) => path.join(import.meta.dirname, 'fixtures', file);

const createESLint = (eslintOptions: eslint.ESLint.Options) =>
  new eslint.ESLint({
    baseConfig: [DEFAULT_HTML_CONFIG, DEFAULT_JS_CONFIG],
    ignore: false,
    ignorePatterns: [],
    overrideConfigFile: true,
    ...eslintOptions,
  });

const getSingleResult = ([result]: readonly eslint.ESLint.LintResult[]) => {
  if (!result) {
    throw new Error('Nothing was linted');
  }
  return result;
};

const lintFile = async (file: string, eslintOptions: eslint.ESLint.Options = {}) =>
  getSingleResult(await createESLint(eslintOptions).lintFiles([getFixturePath(file)]));

// Lints the text as if it was a file of the fixtures directory
const lintText = async (
  text: string,
  eslintOptions: eslint.ESLint.Options = {},
  filename = 'virtual.html',
) =>
  getSingleResult(
    await createESLint(eslintOptions).lintText(text, {filePath: getFixturePath(filename)}),
  );

const execute = async (file: string, eslintOptions?: eslint.ESLint.Options) =>
  (await lintFile(file, eslintOptions)).messages;

const executeText = async (
  text: string,
  eslintOptions?: eslint.ESLint.Options,
  filename?: string,
) => (await lintText(text, eslintOptions, filename)).messages;

const fixWith = (text: string, jsConfig: Linter.Config) =>
  lintText(text, {
    baseConfig: [DEFAULT_HTML_CONFIG, {...DEFAULT_JS_CONFIG, ...jsConfig}],
    fix: true,
  });

const executeWithScopeSharing = (
  file: string,
  jsConfig: Linter.Config,
  htmlConfig?: Linter.Config,
) =>
  execute(file, {
    baseConfig: [
      htmlConfig || DEFAULT_HTML_CONFIG,
      SCOPE_SHARING_CONFIG,
      {...DEFAULT_JS_CONFIG, ...jsConfig},
    ],
  });

const getScopeSharingConfig = (rules: Linter.RulesRecord) => [
  DEFAULT_HTML_CONFIG,
  SCOPE_SHARING_CONFIG,
  {...DEFAULT_JS_CONFIG, rules},
];

const isHtmlEslintRule = (name: string) => name.startsWith('@html-eslint/');

const pickRules = (rules: Linter.RulesRecord, isPicked: (name: string) => boolean) =>
  pick(rules, (_, name) => isPicked(name));

const toLocatedMessages = (messages: readonly Linter.LintMessage[]) =>
  messages.map(({ruleId, line, column, message}) => `${line}:${column} ${ruleId} ${message}`);

it('should extract and remap messages', async () => {
  const messages = await execute(FIXTURES.severalScriptsWithConsoleLog);

  expect(messages).toHaveLength(5);

  expect(messages[0]?.message).toBe('Unexpected console statement.');
  expect(messages[0]?.line).toBe(8);
  expect(messages[0]?.column).toBe(7);
  expect(messages[0]?.endLine).toBe(8);
  expect(messages[0]?.endColumn).toBe(18);

  expect(messages[1]?.message).toBe('Unexpected console statement.');
  expect(messages[1]?.line).toBe(14);
  expect(messages[1]?.column).toBe(7);
  expect(messages[1]?.endLine).toBe(14);
  expect(messages[1]?.endColumn).toBe(18);

  expect(messages[2]?.message).toBe('Unexpected console statement.');
  expect(messages[2]?.line).toBe(20);
  expect(messages[2]?.column).toBe(3);
  expect(messages[2]?.endLine).toBe(20);
  expect(messages[2]?.endColumn).toBe(14);

  expect(messages[3]?.message).toBe('Unexpected console statement.');
  expect(messages[3]?.line).toBe(25);
  expect(messages[3]?.column).toBe(11);
  expect(messages[3]?.endLine).toBe(25);
  expect(messages[3]?.endColumn).toBe(22);

  expect(messages[4]?.message).toBe('Unexpected console statement.');
  expect(messages[4]?.line).toBe(28);
  expect(messages[4]?.column).toBe(13);
  expect(messages[4]?.endLine).toBe(28);
  expect(messages[4]?.endColumn).toBe(24);
});

it('does not apply the plugin if it is not used in the configuration', async () => {
  const messages = await execute(FIXTURES.severalScriptsWithConsoleLog, {
    baseConfig: [{files: ['**/*.html']}],
  });

  expect(messages).toHaveLength(1);
  expect(messages[0]?.message).toBe('Parsing error: Unexpected token <');
});

it('should report correct line numbers with crlf newlines', async () => {
  const messages = await execute(FIXTURES.crlfNewlines);

  expect(messages).toHaveLength(1);
  expect(messages[0]?.message).toBe('Unexpected console statement.');
  expect(messages[0]?.line).toBe(8);
  expect(messages[0]?.column).toBe(7);
});

describe('processor indent option', () => {
  it('should automatically compute indent when nothing is specified', async () => {
    const messages = await execute(FIXTURES.scriptsWithDifferentIndentation, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            indent: [2, 2],
          },
        },
      ],
    });

    expect(messages).toHaveLength(0);
  });

  it('should work with a zero absolute indentation descriptor', async () => {
    const messages = await execute(FIXTURES.scriptsWithDifferentIndentation, {
      baseConfig: [
        {
          ...DEFAULT_HTML_CONFIG,
          processor: createProcessor({
            indent: 0,
          }),
        },
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            indent: [2, 2],
          },
        },
      ],
    });

    expect(messages).toHaveLength(9); // Only the first script is correctly indented (aligned on the first column)
    expect(messages[0]?.message).toMatch(/Expected indentation of 0 .* but found 2\./);
    expect(messages[0]?.line).toBe(16);
    expect(messages[1]?.message).toMatch(/Expected indentation of 2 .* but found 4\./);
    expect(messages[1]?.line).toBe(17);
    expect(messages[2]?.message).toMatch(/Expected indentation of 0 .* but found 2\./);
    expect(messages[2]?.line).toBe(18);
    expect(messages[3]?.message).toMatch(/Expected indentation of 0 .* but found 6\./);
    expect(messages[3]?.line).toBe(22);
    expect(messages[4]?.message).toMatch(/Expected indentation of 2 .* but found 8\./);
    expect(messages[4]?.line).toBe(23);
    expect(messages[5]?.message).toMatch(/Expected indentation of 0 .* but found 6\./);
    expect(messages[5]?.line).toBe(24);
    expect(messages[6]?.message).toMatch(/Expected indentation of 0 .* but found 10\./);
    expect(messages[6]?.line).toBe(28);
    expect(messages[7]?.message).toMatch(/Expected indentation of 2 .* but found 12\./);
    expect(messages[7]?.line).toBe(29);
    expect(messages[8]?.message).toMatch(/Expected indentation of 0 .* but found 10\./);
    expect(messages[8]?.line).toBe(30);
  });

  it('should work with a non-zero absolute indentation descriptor', async () => {
    const messages = await execute(FIXTURES.scriptsWithDifferentIndentation, {
      baseConfig: [
        {
          ...DEFAULT_HTML_CONFIG,
          processor: createProcessor({
            indent: 2,
          }),
        },
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            indent: [2, 2],
          },
        },
      ],
    });

    expect(messages).toHaveLength(7); // The first script is incorrect since the second line gets dedented
    expect(messages[0]?.message).toMatch(/Expected indentation of 2 .* but found 0\./);
    expect(messages[0]?.line).toBe(11); // The second script is correct.
    expect(messages[1]?.message).toMatch(/Expected indentation of 0 .* but found 6\./);
    expect(messages[1]?.line).toBe(22);
    expect(messages[2]?.message).toMatch(/Expected indentation of .* but found 6\./);
    expect(messages[2]?.line).toBe(23);
    expect(messages[3]?.message).toMatch(/Expected indentation of .* but found 4\./);
    expect(messages[3]?.line).toBe(24);
    expect(messages[4]?.message).toMatch(/Expected indentation of 0 .* but found 10\./);
    expect(messages[4]?.line).toBe(28);
    expect(messages[5]?.message).toMatch(/Expected indentation of .* but found 10\./);
    expect(messages[5]?.line).toBe(29);
    expect(messages[6]?.message).toMatch(/Expected indentation of .* but found 8\./);
    expect(messages[6]?.line).toBe(30);
  });

  it('should work with relative indentation descriptor', async () => {
    const messages = await execute(FIXTURES.scriptsWithDifferentIndentation, {
      baseConfig: [
        {
          ...DEFAULT_HTML_CONFIG,
          processor: createProcessor({
            indent: '+2',
          }),
        },
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            indent: [2, 2],
          },
        },
      ],
    });

    expect(messages).toHaveLength(6); // The first script is correct since it can't be dedented, but follows the indent
    // rule anyway.
    expect(messages[0]?.message).toMatch(/Expected indentation of 0 .* but found 2\./);
    expect(messages[0]?.line).toBe(16);
    expect(messages[1]?.message).toMatch(/Expected indentation of 2 .* but found 4\./);
    expect(messages[1]?.line).toBe(17);
    expect(messages[2]?.message).toMatch(/Expected indentation of 0 .* but found 2\./);
    expect(messages[2]?.line).toBe(18); // The third script is correct.
    expect(messages[3]?.message).toMatch(/Expected indentation of 0 .* but found 10\./);
    expect(messages[3]?.line).toBe(28);
    expect(messages[4]?.message).toMatch(/Expected indentation of 2 .* but found 4\./);
    expect(messages[4]?.line).toBe(29);
    expect(messages[5]?.message).toMatch(/Expected indentation of 0 .* but found 2\./);
    expect(messages[5]?.line).toBe(30);
  });

  it('should report messages at the beginning of the file', async () => {
    const messages = await execute(FIXTURES.scriptStartingOnItsTagLine, {
      baseConfig: [
        {
          ...DEFAULT_HTML_CONFIG,
          processor: createProcessor({
            indent: 2,
          }),
        },
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'max-lines': [
              2,
              {
                max: 3,
              },
            ],
            'max-len': [
              2,
              {
                code: 35,
              },
            ],
          },
        },
      ],
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.message).toBe('This line has a length of 70. Maximum allowed is 35.');
    expect(messages[0]?.line).toBe(1);
    expect(messages[0]?.column).toBe(9);
    expect(messages[1]?.message).toBe('File has too many lines (6). Maximum allowed is 3.');
    expect(messages[1]?.line).toBe(4);
    expect(messages[1]?.column).toBe(1);
  });
});

describe('processor reports bad indent', () => {
  it('should report under-indented code with auto indent setting', async () => {
    const messages = await execute(FIXTURES.underIndentedLine, {
      baseConfig: [
        {
          ...DEFAULT_HTML_CONFIG,
          processor: createProcessor({reportBadIndent: 'error'}),
        },
      ],
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toBe('Bad line indentation.');
    expect(messages[0]?.line).toBe(10);
    expect(messages[0]?.column).toBe(1);
  });

  it('should report under-indented code with provided indent setting', async () => {
    const messages = await execute(FIXTURES.underIndentedLine, {
      baseConfig: [
        {
          ...DEFAULT_HTML_CONFIG,
          processor: createProcessor({
            reportBadIndent: 'error',
            indent: '+4',
          }),
        },
      ],
    });

    expect(messages).toHaveLength(3);
    expect(messages[0]?.message).toBe('Bad line indentation.');
    expect(messages[0]?.line).toBe(9);
    expect(messages[0]?.column).toBe(1);
    expect(messages[1]?.message).toBe('Bad line indentation.');
    expect(messages[1]?.line).toBe(10);
    expect(messages[1]?.column).toBe(1);
    expect(messages[2]?.message).toBe('Bad line indentation.');
    expect(messages[2]?.line).toBe(11);
    expect(messages[2]?.column).toBe(1);
  });

  it.each<readonly [HtmlProcessorOptions['reportBadIndent'], readonly number[]]>([
    ['off', []],
    ['warn', [1]],
    ['error', [2]],
  ])('should report with the severity of the option (%s)', async (reportBadIndent, severities) => {
    const messages = await execute(FIXTURES.underIndentedLine, {
      baseConfig: [{...DEFAULT_HTML_CONFIG, processor: createProcessor({reportBadIndent})}],
    });

    expect(messages.map(({severity}) => severity)).toStrictEqual(severities);
  });

  it('should throw on invalid values', () => {
    // @ts-expect-error not one of the values
    expect(() => createProcessor({reportBadIndent: 2})).toThrow(
      "Invalid value of `reportBadIndent`: 2, expected 'off', 'warn' or 'error'",
    );
  });
});

describe('processor xml option', () => {
  const HTML_CONFIG_WITH_XML: Readonly<Linter.Config> = {
    ...DEFAULT_HTML_CONFIG,
    files: ['**/*.xhtml'],
    processor: createProcessor(),
  };

  it('consider .xhtml files as XML', async () => {
    const messages = await execute(FIXTURES.scriptWithCdataXhtml, {
      baseConfig: [HTML_CONFIG_WITH_XML, DEFAULT_JS_CONFIG],
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toBe('Unexpected console statement.');
    expect(messages[0]?.line).toBe(13);
    expect(messages[0]?.column).toBe(9);
  });

  it('removes white space at the end of scripts ending with CDATA', async () => {
    const messages = await execute(FIXTURES.scriptWithCdataXhtml, {
      baseConfig: [
        HTML_CONFIG_WITH_XML,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'no-trailing-spaces': 'error',
            'eol-last': 'error',
          },
        },
      ],
    });

    expect(messages).toHaveLength(0);
  });

  it('should support self closing script tags', async () => {
    const messages = await execute(FIXTURES.selfClosingScriptXhtml, {
      baseConfig: [HTML_CONFIG_WITH_XML, DEFAULT_JS_CONFIG],
    });

    expect(messages).toStrictEqual([]);
  });
});

describe('lines-around-comment and multiple scripts', () => {
  it('should not warn with lines-around-comment if multiple scripts', async () => {
    const messages = await execute(FIXTURES.severalScriptsWithConsoleLog, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'lines-around-comment': [
              'error',
              {
                beforeLineComment: true,
              },
            ],
            'no-console': 'error',
          },
        },
      ],
    });

    expect(messages).toHaveLength(5);
  });
});

describe('fix', () => {
  it('should remap fix ranges', async () => {
    const messages = await execute(FIXTURES.doubleSemicolon, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'no-extra-semi': ['error'],
          },
        },
      ],
    });

    expect(messages[0]?.fix?.range).toStrictEqual([53, 55]);
  });

  it('should fix errors', async () => {
    const result = await lintFile(FIXTURES.doubleSemicolon, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'no-extra-semi': ['error'],
          },
        },
      ],
      fix: true,
    });

    expect(result.output).toBe(`<!DOCTYPE html>
<html lang="en">
  <script>
    foo();
  </script>
</html>
`);
    expect(result.messages).toHaveLength(0);
  });

  it('should fix errors in files with BOM', async () => {
    const result = await lintFile(FIXTURES.doubleSemicolonWithBom, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'no-extra-semi': ['error'],
          },
        },
      ],
      fix: true,
    });

    expect(result.output).toBe(`\u{FEFF}<!DOCTYPE html>
<html lang="en">
  <script>
    foo();
  </script>
</html>
`);
    expect(result.messages).toHaveLength(0);
  });

  it('should not count the BOM in the columns of the first line, like ESLint', async () => {
    const messages = await executeText('\u{FEFF}<script>console.log(1)</script>\n');

    expect(toLocatedMessages(messages)).toStrictEqual([
      '1:9 no-console Unexpected console statement.',
    ]);
  });

  describe('eol-last rule', () => {
    it('should work with eol-last always', async () => {
      const result = await lintFile(FIXTURES.doubleSemicolon, {
        baseConfig: [
          DEFAULT_HTML_CONFIG,
          {
            ...DEFAULT_JS_CONFIG,
            rules: {
              'eol-last': ['error'],
              'no-extra-semi': ['error'],
            },
          },
        ],
        fix: true,
      });

      expect(result.output).toBe(`<!DOCTYPE html>
<html lang="en">
  <script>
    foo();
  </script>
</html>
`);
      expect(result.messages).toHaveLength(0);
    });

    it('should work with eol-last never', async () => {
      const result = await lintFile(FIXTURES.doubleSemicolon, {
        baseConfig: [
          DEFAULT_HTML_CONFIG,
          {
            ...DEFAULT_JS_CONFIG,
            rules: {
              'eol-last': ['error', 'never'],
            },
          },
        ],
        fix: true,
      });

      expect(result.output).toBe(
        [
          '<!DOCTYPE html>',
          '<html lang="en">',
          '  <script>',
          // eslint-disable-next-line un/no-multiple-consecutive-spaces -- the fix keeps them
          '    foo();;  </script>',
          '</html>',
          '',
        ].join('\n'),
      );
      expect(result.messages).toHaveLength(0);
    });
  });
});

describe('reportUnusedDisableDirectives', () => {
  it('reports unused disabled directives', async () => {
    const messages = await execute(FIXTURES.evalWithDisableComment, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {
          ...DEFAULT_JS_CONFIG,
          linterOptions: {
            reportUnusedDisableDirectives: 'error',
          },
        },
      ],
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.line).toBe(2);
    expect(messages[0]?.column).toBe(3);
    expect(messages[0]?.message).toBe(
      "Unused eslint-disable directive (no problems were reported from 'no-eval').",
    );
  });

  it("doesn't report used disabled directives", async () => {
    const messages = await execute(FIXTURES.evalWithDisableComment, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {
          ...DEFAULT_JS_CONFIG,
          linterOptions: {
            reportUnusedDisableDirectives: 'error',
          },
          rules: {
            'no-eval': 2,
          },
        },
      ],
    });

    expect(messages).toHaveLength(0);
  });
});

it('ignores tags without type attribute', async () => {
  const messages = await execute(FIXTURES.scriptsWithFooTypes, {
    baseConfig: [
      {
        ...DEFAULT_HTML_CONFIG,
        processor: createProcessor({scriptTags: [{match: 'script[type]'}]}),
      },
      DEFAULT_JS_CONFIG,
    ],
  });

  expect(messages).toHaveLength(4);
});

it('ignores unknown mime types by default', async () => {
  const messages = await execute(FIXTURES.scriptsWithFooTypes);

  expect(messages).toHaveLength(3);
  expect(messages[0]?.ruleId).toBe('no-console');
  expect(messages[0]?.line).toBe(8);
  expect(messages[1]?.ruleId).toBe('no-console');
  expect(messages[1]?.line).toBe(12);
  expect(messages[2]?.ruleId).toBe('no-console');
  expect(messages[2]?.line).toBe(16);
});

it('specifies a list of valid mime types', async () => {
  const messages = await execute(FIXTURES.scriptsWithFooTypes, {
    baseConfig: [
      {
        ...DEFAULT_HTML_CONFIG,
        processor: createProcessor({
          scriptTags: [{match: "[type='text/foo']"}],
        }),
      },
      DEFAULT_JS_CONFIG,
    ],
  });

  expect(messages).toHaveLength(1);
  expect(messages[0]?.ruleId).toBe('no-console');
  expect(messages[0]?.line).toBe(20);
});

it('should report correct eol-last message position', async () => {
  const messages = await execute(FIXTURES.oneLineScript, {
    baseConfig: [
      DEFAULT_HTML_CONFIG,
      {
        ...DEFAULT_JS_CONFIG,
        rules: {
          'eol-last': 'error',
        },
      },
    ],
  });

  expect(messages).toHaveLength(1);
  expect(messages[0]?.ruleId).toBe('eol-last');
  expect(messages[0]?.line).toBe(6);
  expect(messages[0]?.column).toBe(42);
});

describe('scope sharing', () => {
  const NOT_YET_DECLARED_MESSAGES = Object.freeze([
    "13:7 no-undef 'varNotYetGloballyDeclared' is not defined.",
    "14:7 no-undef 'letNotYetGloballyDeclared' is not defined.",
    "15:7 no-undef 'functionNotYetGloballyDeclared' is not defined.",
    "16:7 no-undef 'ClassNotYetGloballyDeclared' is not defined.",
    "20:11 no-unused-vars 'varNotYetGloballyDeclared' is assigned a value but never used.",
    "21:11 no-unused-vars 'letNotYetGloballyDeclared' is assigned a value but never used.",
    "22:16 no-unused-vars 'functionNotYetGloballyDeclared' is defined but never used.",
    "23:13 no-unused-vars 'ClassNotYetGloballyDeclared' is defined but never used.",
  ]);

  it('should export global variables between script scopes', async () => {
    const messages = await executeWithScopeSharing(FIXTURES.variablesAcrossScripts, {
      rules: {
        'no-undef': 'error',
      },
      languageOptions: {
        sourceType: 'script',
      },
    });

    expect(messages).toHaveLength(4);
    expect(messages[0]?.line).toBe(13);
    expect(messages[0]?.message).toBe("'varNotYetGloballyDeclared' is not defined.");
    expect(messages[1]?.line).toBe(14);
    expect(messages[1]?.message).toBe("'letNotYetGloballyDeclared' is not defined.");
    expect(messages[2]?.line).toBe(15);
    expect(messages[2]?.message).toBe("'functionNotYetGloballyDeclared' is not defined.");
    expect(messages[3]?.line).toBe(16);
    expect(messages[3]?.message).toBe("'ClassNotYetGloballyDeclared' is not defined.");
  });

  it('should mark variable as used when the variable is used in another tag', async () => {
    const messages = await executeWithScopeSharing(FIXTURES.variablesAcrossScripts, {
      rules: {
        'no-unused-vars': 'error',
      },
      languageOptions: {
        sourceType: 'script',
      },
    });

    expect(messages).toHaveLength(4);
    expect(messages[0]?.line).toBe(20);
    expect(messages[0]?.message).toBe(
      "'varNotYetGloballyDeclared' is assigned a value but never used.",
    );
    expect(messages[1]?.line).toBe(21);
    expect(messages[1]?.message).toBe(
      "'letNotYetGloballyDeclared' is assigned a value but never used.",
    );
    expect(messages[2]?.line).toBe(22);
    expect(messages[2]?.message).toBe(
      "'functionNotYetGloballyDeclared' is defined but never used.",
    );
    expect(messages[3]?.line).toBe(23);
    expect(messages[3]?.message).toBe("'ClassNotYetGloballyDeclared' is defined but never used.");
  });

  it("should not be influenced by the ECMA feature 'globalReturn'", async () => {
    const messages = await executeWithScopeSharing(FIXTURES.variablesAcrossScripts, {
      rules: {
        'no-undef': 'error',
        'no-unused-vars': 'error',
      },
      languageOptions: {
        sourceType: 'script',
        parserOptions: {
          ecmaFeatures: {
            globalReturn: true,
          },
        },
      },
    });

    expect(toLocatedMessages(messages)).toStrictEqual(NOT_YET_DECLARED_MESSAGES);
  });

  it('should share the scope of classic scripts parsed as modules', async () => {
    const messages = await executeWithScopeSharing(FIXTURES.variablesAcrossScripts, {
      rules: {
        'no-undef': 'error',
        'no-unused-vars': 'error',
      },
      languageOptions: {
        sourceType: 'module',
      },
    });

    expect(toLocatedMessages(messages)).toStrictEqual(NOT_YET_DECLARED_MESSAGES);
  });

  it('should not share the global scope between module scripts', async () => {
    const messages = await executeWithScopeSharing(
      FIXTURES.variablesAcrossScripts,
      {
        rules: {
          'no-undef': 'error',
          'no-unused-vars': 'error',
        },
      },
      {
        ...DEFAULT_HTML_CONFIG,
        processor: createProcessor({
          scriptTags: [{match: 'script', module: true}],
        }),
      },
    );

    expect(messages).toHaveLength(16);
    expect(messages[0]?.line).toBe(8);
    expect(messages[0]?.message).toBe("'varGloballyDeclared' is assigned a value but never used.");
    expect(messages[1]?.line).toBe(9);
    expect(messages[1]?.message).toBe("'letGloballyDeclared' is assigned a value but never used.");
    expect(messages[2]?.line).toBe(10);
    expect(messages[2]?.message).toBe("'functionGloballyDeclared' is defined but never used.");
    expect(messages[3]?.line).toBe(11);
    expect(messages[3]?.message).toBe("'ClassGloballyDeclared' is defined but never used.");
    expect(messages[4]?.line).toBe(13);
    expect(messages[4]?.message).toBe("'varNotYetGloballyDeclared' is not defined.");
    expect(messages[5]?.line).toBe(14);
    expect(messages[5]?.message).toBe("'letNotYetGloballyDeclared' is not defined.");
    expect(messages[6]?.line).toBe(15);
    expect(messages[6]?.message).toBe("'functionNotYetGloballyDeclared' is not defined.");
    expect(messages[7]?.line).toBe(16);
    expect(messages[7]?.message).toBe("'ClassNotYetGloballyDeclared' is not defined.");
    expect(messages[8]?.line).toBe(20);
    expect(messages[8]?.message).toBe(
      "'varNotYetGloballyDeclared' is assigned a value but never used.",
    );
    expect(messages[9]?.line).toBe(21);
    expect(messages[9]?.message).toBe(
      "'letNotYetGloballyDeclared' is assigned a value but never used.",
    );
    expect(messages[10]?.line).toBe(22);
    expect(messages[10]?.message).toBe(
      "'functionNotYetGloballyDeclared' is defined but never used.",
    );
    expect(messages[11]?.line).toBe(23);
    expect(messages[11]?.message).toBe("'ClassNotYetGloballyDeclared' is defined but never used.");
    expect(messages[12]?.line).toBe(25);
    expect(messages[12]?.message).toBe("'varGloballyDeclared' is not defined.");
    expect(messages[13]?.line).toBe(26);
    expect(messages[13]?.message).toBe("'letGloballyDeclared' is not defined.");
    expect(messages[14]?.line).toBe(27);
    expect(messages[14]?.message).toBe("'functionGloballyDeclared' is not defined.");
    expect(messages[15]?.line).toBe(28);
    expect(messages[15]?.message).toBe("'ClassGloballyDeclared' is not defined.");
  });

  it('should let module scripts use the globals of previous classic scripts', async () => {
    const messages = await executeWithScopeSharing(
      FIXTURES.variablesAcrossClassicAndModuleScripts,
      {
        rules: {
          'no-undef': 'error',
          'no-unused-vars': 'error',
        },
      },
    );

    expect(toLocatedMessages(messages)).toStrictEqual([
      "9:11 no-unused-vars 'moduleVariable' is assigned a value but never used.",
      "13:7 no-undef 'moduleVariable' is not defined.",
    ]);
  });

  it('should not depend on inline configuration', async () => {
    const messages = await executeWithScopeSharing(FIXTURES.variablesAcrossScripts, {
      rules: {
        'no-undef': 'error',
        'no-unused-vars': 'error',
      },
      languageOptions: {
        sourceType: 'script',
      },
      linterOptions: {
        noInlineConfig: true,
      },
    });

    expect(toLocatedMessages(messages)).toStrictEqual(NOT_YET_DECLARED_MESSAGES);
  });

  it('should not change the code of scripts', async () => {
    await expect(
      executeText('<script>\nvar a = 1\n</script>\n<script>\na\n</script>\n', {
        baseConfig: getScopeSharingConfig({'max-lines': ['error', 1]}),
      }),
    ).resolves.toStrictEqual([]);
    expect(
      toLocatedMessages(
        await executeText('<script>\n\n\nvar a = 1\n</script>\n<script>\na\n</script>\n', {
          baseConfig: getScopeSharingConfig({
            'no-multiple-empty-lines': ['error', {max: 5, maxBOF: 0}],
          }),
        }),
      ),
    ).toStrictEqual([
      '2:1 no-multiple-empty-lines Too many blank lines at the beginning of file. Max of 0 allowed.',
    ]);
  });

  it('should parse each script once, with the configured parser', async () => {
    let parseCount = 0;
    const countingParser = {
      meta: {name: 'counting-espree'},
      parse: (code: string, options: espree.Options) => {
        parseCount += 1;
        return espree.parse(code, options);
      },
    };

    const messages = await executeWithScopeSharing(FIXTURES.variablesAcrossScripts, {
      rules: {
        'no-undef': 'error',
        'no-unused-vars': 'error',
      },
      languageOptions: {
        sourceType: 'script',
        parserOptions: {
          parser: countingParser,
        },
      },
    });

    expect(parseCount).toBe(2);
    expect(toLocatedMessages(messages)).toStrictEqual(NOT_YET_DECLARED_MESSAGES);
  });

  it('should parse the next scripts ahead of time with their own virtual filenames', async () => {
    const parsedFilenames: string[] = [];
    const recordingParser = {
      meta: {name: 'recording-espree'},
      parse: (code: string, {filePath = '', ...options}: espree.Options & {filePath?: string}) => {
        parsedFilenames.push(path.basename(filePath));
        return espree.parse(code, options);
      },
    };

    await executeWithScopeSharing(
      FIXTURES.variablesAcrossScripts,
      {languageOptions: {sourceType: 'script', parserOptions: {parser: recordingParser}}},
      {
        files: ['**/*.html'],
        plugins: {'@html-eslint': htmlEslintPlugin},
        language: '@html-eslint/html',
        processor: createProcessor({lintMarkup: true}),
      },
    );

    // The markup is the first block
    expect(parsedFilenames).toStrictEqual(['1_script-0.js', '2_script-1.js']);
  });

  it('should report when the parser of the plugin is not used', async () => {
    const messages = await executeWithScopeSharing(FIXTURES.variablesAcrossScripts, {
      rules: {
        'no-undef': 'error',
      },
      languageOptions: {
        sourceType: 'script',
        parser: espree,
      },
    });

    expect(
      toLocatedMessages(
        messages.filter((message) => message.ruleId === 'html-scripts/scope-sharing'),
      ),
    ).toStrictEqual([`20:7 html-scripts/scope-sharing ${PARSER_NOT_USED_MESSAGE}`]);
    expect(
      messages.find((message) => message.ruleId === 'html-scripts/scope-sharing'),
    ).not.toHaveProperty('endLine');
  });

  it('should keep sharing the scope of other scripts when one fails to parse', async () => {
    const messages = await executeText(
      '<script>\nvar a = 1\n</script>\n<script>\na(\n</script>\n<script>\na\n</script>\n',
      {
        baseConfig: [
          DEFAULT_HTML_CONFIG,
          SCOPE_SHARING_CONFIG,
          {
            ...DEFAULT_JS_CONFIG,
            rules: {
              'no-undef': 'error',
              'no-unused-vars': 'error',
            },
            languageOptions: {
              sourceType: 'script',
            },
          },
        ],
      },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]?.fatal).toBe(true);
  });
});

describe('compatibility with external HTML plugins', () => {
  const HTML_ESLINT_SETUPS: Readonly<Record<string, Linter.Config>> = {
    language: {language: '@html-eslint/html'},
    parser: {languageOptions: {parser: htmlEslintParser}},
  };

  describe.each(Object.entries(HTML_ESLINT_SETUPS))(
    "with html-eslint's %s",
    (_, htmlEslintSetup) => {
      const baseConfig = (rules: Linter.RulesRecord): Linter.Config[] => [
        {
          files: ['**/*.html'],
          plugins: {'@html-eslint': htmlEslintPlugin},
          ...htmlEslintSetup,
          processor: createProcessor({lintMarkup: true}),
          rules: pickRules(rules, isHtmlEslintRule),
        },
        {
          ...DEFAULT_JS_CONFIG,
          rules: pickRules(rules, (name) => !isHtmlEslintRule(name)),
        },
      ];

      it('reports the problems of both the markup and the scripts', async () => {
        const messages = await execute(FIXTURES.imageWithoutAltAndScript, {
          baseConfig: baseConfig({
            '@html-eslint/require-img-alt': 'error',
            'no-console': 'error',
          }),
        });

        expect(toLocatedMessages(messages)).toStrictEqual([
          '1:1 @html-eslint/require-img-alt Missing `alt` attribute at `<img>` tag',
          '3:3 no-console Unexpected console statement.',
        ]);
      });

      it('fixes both the markup and the scripts', async () => {
        const result = await lintFile(FIXTURES.imageWithoutAltAndScript, {
          baseConfig: baseConfig({
            '@html-eslint/quotes': ['error', 'single'],
            quotes: ['error', 'single'],
          }),
          fix: true,
        });

        expect(result.output).toBe(`\
<img src=''>
<script>
  console.log('toto')
</script>
`);
      });

      it('keeps the HTML comments of this plugin', async () => {
        const eslintOptions: eslint.ESLint.Options = {
          baseConfig: [
            ...baseConfig({'@html-eslint/require-img-alt': 'error'}),
            {linterOptions: {reportUnusedDisableDirectives: 'error'}},
          ],
        };
        const pluginComments =
          '<!-- eslint-disable -->\n<script>{{ template }}</script>\n<!-- eslint-enable -->\n<!-- eslint-disable-next-script -->\n<script>{{ other }}</script>\n';
        const text = `${pluginComments}<!-- eslint-disable-next-line @html-eslint/require-img-alt -->\n<div></div>\n`;

        expect(toLocatedMessages(await executeText(text, eslintOptions))).toStrictEqual([
          "6:5 null Unused eslint-disable directive (no problems were reported from '@html-eslint/require-img-alt').",
        ]);

        const {output} = await lintText(text, {
          ...eslintOptions,
          fix: true,
        });

        expect(output?.startsWith(pluginComments)).toBeTruthy();

        expect(
          toLocatedMessages(
            await executeText(`${pluginComments}<img src="a.png">\n`, eslintOptions),
          ),
        ).toStrictEqual([
          '6:1 @html-eslint/require-img-alt Missing `alt` attribute at `<img>` tag',
        ]);

        const textWithBOM = '\u{FEFF}<!-- eslint-disable --><script>{{ template }}</script>\n';

        await expect(executeText(textWithBOM, eslintOptions)).resolves.toStrictEqual([]);
      });
    },
  );
});

describe('remapping', () => {
  it('should remap suggestions', async () => {
    const text = '<div>\n  <script>\n    console.log(1);\n    foo();\n  </script>\n</div>\n';
    const [message] = await executeText(text);
    const fix = message?.suggestions?.[0]?.fix;

    expect(fix).toBeDefined();

    const {range: [start, end] = [0, 0], text: replacement = ''} = fix || {};

    expect(text.slice(0, start) + replacement + text.slice(end)).toBe(
      '<div>\n  <script>\n    \n    foo();\n  </script>\n</div>\n',
    );
  });

  it('should remap fixes inserting text at the start of a script', async () => {
    const text = '<div>\n  <script>\n    foo()\n  </script>\n</div>\n';
    const [message] = await executeText(text, {
      baseConfig: [
        DEFAULT_HTML_CONFIG,
        {...DEFAULT_JS_CONFIG, rules: {'unicode-bom': ['error', 'always']}},
      ],
    });
    const start = text.indexOf('foo()');

    expect(message?.fix?.range).toStrictEqual([start, start]);
  });

  it('should indent the lines that fixes add like the script', async () => {
    const result = await fixWith(
      '<div>\n  <script>\n    const a = {b: 1}\n    foo()\n    bar()\n  </script>\n</div>\n',
      {
        rules: {
          'object-curly-newline': ['error', 'always'],
          indent: ['error', 2],
          'padding-line-between-statements': [
            'error',
            {blankLine: 'always', prev: 'expression', next: 'expression'},
          ],
        },
      },
    );

    expect(result.output).toBe(
      '<div>\n  <script>\n    const a = {\n      b: 1\n    }\n    foo()\n\n    bar()\n  </script>\n</div>\n',
    );
  });

  it('should indent a script replaced by a fix like the script', async () => {
    // Replaces the whole script, like formatters do
    const formatted = '/**\n * Documented\n */\nfunction foo() {\n  return 1\n}\n';
    const formatRule: Rule.RuleModule = {
      meta: {fixable: 'code'},
      create: (context) => ({
        Program: () => {
          const {text} = context.sourceCode;
          if (text !== formatted) {
            context.report({
              loc: {line: 1, column: 0},
              message: 'Not formatted',
              fix: (fixer) => fixer.replaceTextRange([0, text.length], formatted),
            });
          }
        },
      }),
    };
    const formatPlugin = {rules: {format: formatRule}};

    const result = await fixWith(
      '<div>\n  <script>\n    function foo() { return 1 }\n  </script>\n</div>\n',
      {plugins: {test: formatPlugin}, rules: {'test/format': 'error'}},
    );

    expect(result.output).toBe(
      '<div>\n  <script>\n    /**\n     * Documented\n     */\n    function foo() {\n      return 1\n    }\n  </script>\n</div>\n',
    );
    expect(result.messages).toStrictEqual([]);
  });
});

describe('edge cases', () => {
  const SCOPE_SHARING_BASE_CONFIG: readonly Linter.Config[] = [
    DEFAULT_HTML_CONFIG,
    SCOPE_SHARING_CONFIG,
    {...DEFAULT_JS_CONFIG, rules: {'no-undef': 'error'}, languageOptions: {sourceType: 'script'}},
  ];

  it('should share the global variables declared by comments', async () => {
    const messages = await executeText(
      '<script>\n  /* global shared */\n</script>\n<script>\n  shared()\n</script>\n',
      {baseConfig: [...SCOPE_SHARING_BASE_CONFIG]},
    );

    expect(messages).toStrictEqual([]);
  });

  it('should keep the messages without a location as they are', async () => {
    const messages = await executeText('<script>\n  foo()\n</script>\n', {
      baseConfig: [
        ...SCOPE_SHARING_BASE_CONFIG,
        {
          files: ['**/*.html/*.js'],
          languageOptions: {
            parserOptions: {
              parser: {
                parse: () => {
                  throw new Error('No location');
                },
              },
            },
          },
        },
      ],
    });

    expect(messages.map(({line, message}) => ({line, message}))).toStrictEqual([
      {line: undefined, message: 'Parsing error: No location'},
    ]);
  });

  it('should report a parser not returning an ESTree program', async () => {
    const messages = await executeText('<script>\n  foo()\n</script>\n', {
      baseConfig: [
        ...SCOPE_SHARING_BASE_CONFIG,
        {
          files: ['**/*.html/*.js'],
          languageOptions: {parserOptions: {parser: {parse: () => ({type: 'Document'})}}},
        },
      ],
    });

    expect(messages.map(({message}) => message)).toStrictEqual([
      'Parsing error: The parser of eslint-plugin-un-html-scripts needs an ESTree parser',
    ]);
  });

  it('should not report on files the processor did not extract', async () => {
    const messages = await executeText(
      'foo()\n',
      {baseConfig: [{...SCOPE_SHARING_CONFIG, files: ['**/*.js']}]},
      'virtual.js',
    );

    expect(messages).toStrictEqual([]);
  });

  it('should not leave the indentation in lines joined by a fix', async () => {
    const {output} = await fixWith(
      '<div>\n  <script>\n    function foo()\n    {\n      return 1\n    }\n  </script>\n</div>\n',
      {rules: {'brace-style': 'error'}},
    );

    expect(output).toBe(
      '<div>\n  <script>\n    function foo() {\n      return 1\n    }\n  </script>\n</div>\n',
    );
  });

  it('should keep the code on its own line when blank lines before it are removed', async () => {
    const {output} = await fixWith('<div>\n  <script>\n\n\n    foo()\n  </script>\n</div>\n', {
      rules: {'no-multiple-empty-lines': ['error', {max: 1, maxBOF: 0}]},
    });

    expect(output).toBe('<div>\n  <script>\n    foo()\n  </script>\n</div>\n');
  });

  it('should not indent again and again a script starting on its tag line', async () => {
    const text =
      '<div>\n<script>foo(function () {\n          bar()\n        baz()\n})\n</script>\n</div>\n';
    const result = await fixWith(text, {rules: {indent: ['error', 2]}});

    expect(result.output).toBe(
      '<div>\n<script>foo(function () {\n          bar()\n  baz()\n})\n</script>\n</div>\n',
    );
    expect(toLocatedMessages(result.messages)).toStrictEqual([
      '3:11 indent Expected indentation of 2 spaces but found 0.',
    ]);
  });

  it('should count line separators as line breaks, like ESLint', async () => {
    const lineSeparator = '\u{2028}';
    const messages = await executeText(
      `<script>\n  var a = "x${lineSeparator}y"; console.log(a)\n  console.log("z")\n</script>\n`,
    );

    expect(toLocatedMessages(messages)).toStrictEqual([
      '3:5 no-console Unexpected console statement.',
      '4:3 no-console Unexpected console statement.',
    ]);
  });

  it('should not report assignments to variables of previous scripts as leaks', async () => {
    const messages = await executeText(
      '<script>\n  let a = 1\n</script>\n<script>\n  a = 2\n</script>\n',
      {
        baseConfig: [
          DEFAULT_HTML_CONFIG,
          SCOPE_SHARING_CONFIG,
          {
            ...DEFAULT_JS_CONFIG,
            rules: {'no-implicit-globals': 'error', 'no-undef': 'error'},
            languageOptions: {sourceType: 'script'},
          },
        ],
      },
    );

    expect(messages).toStrictEqual([]);
  });

  it('should mark variables used by later scripts even when a global has the same name', async () => {
    const messages = await executeText(
      '<script>\n  var name = 1\n</script>\n<script>\n  name\n</script>\n',
      {
        baseConfig: [
          DEFAULT_HTML_CONFIG,
          SCOPE_SHARING_CONFIG,
          {
            ...DEFAULT_JS_CONFIG,
            rules: {'no-unused-vars': 'error'},
            languageOptions: {
              sourceType: 'script',
              globals: {name: 'readonly'},
            },
          },
        ],
      },
    );

    expect(messages).toStrictEqual([]);
  });

  it('should keep the scope managers of parsers that cannot add globals', () => {
    // Like the ones of parsers made for ESLint 9, which doesn't call `addGlobals` itself
    const filename = getFixturePath('legacy-parser.html');
    const innerParser: Linter.Parser = {
      parseForESLint: (code: string) => {
        const result = eslintPluginHtmlScriptsParser.parseForESLint(code);
        Object.defineProperty(result.scopeManager, 'addGlobals', {
          value: undefined,
        });
        return result;
      },
    };
    setFileScripts(
      filename,
      [
        {code: 'var shared = 1', isModule: false},
        {code: 'shared', isModule: false},
      ],
      0,
    );

    try {
      const {scopeManager} = eslintPluginHtmlScriptsParser.parseForESLint('shared', {
        parser: innerParser,
        filePath: path.join(filename, '1_script-1.js'),
      });

      expect(scopeManager).toHaveProperty('addGlobals', undefined);
      expect(
        scopeManager.globalScope?.through.map(({identifier}) => identifier.name),
      ).toStrictEqual(['shared']);
    } finally {
      deleteFileScripts(filename);
    }
  });
});

it('should lint scripts with the default types only', async () => {
  const messages = await execute(FIXTURES.scriptsWithVariousTypes);

  expect(messages.map(({line}) => line)).toStrictEqual([2, 5, 8, 11, 14, 23]);
});

it('should name module scripts so they are linted as modules', async () => {
  const messages = await executeText(
    '<script>\n  var shared = 1\n</script>\n<script type="module">\n  import value from "./value.js"\n  console.log(shared, value)\n</script>\n',
    {
      baseConfig: [
        ...RECOMMENDED_CONFIGS,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'no-undef': 'error',
            'no-unused-vars': 'error',
          },
          languageOptions: {
            globals: {console: 'readonly'},
          },
        },
      ],
    },
  );

  expect(messages).toStrictEqual([]);
});

it('should lint HTML code blocks of Markdown files', async () => {
  const text = [
    '# Title',
    '',
    '```html',
    '<script>',
    '  var shared = 1',
    '</script>',
    '<script>',
    '  console.log(shared, missing)',
    '</script>',
    '```',
    '',
  ].join('\n');
  const messages = await executeText(
    text,
    {
      baseConfig: [
        {
          files: ['**/*.md'],
          plugins: {markdown},
          processor: 'markdown/markdown',
        },
        ...RECOMMENDED_CONFIGS,
        {
          ...DEFAULT_JS_CONFIG,
          rules: {
            'no-console': 'error',
            'no-undef': 'error',
            'no-unused-vars': 'error',
          },
          languageOptions: {
            globals: {console: 'readonly'},
          },
        },
      ],
    },
    'virtual.md',
  );

  expect(toLocatedMessages(messages)).toStrictEqual([
    '8:3 no-console Unexpected console statement.',
    "8:23 no-undef 'missing' is not defined.",
  ]);
});

it('should indent fixes in HTML code blocks of Markdown lists', async () => {
  const fence = '```';
  const result = await lintText(
    [
      '- item',
      '',
      `  ${fence}html`,
      '  <div>',
      '    <script>',
      '      var a = {b: 1}',
      '    </script>',
      '  </div>',
      `  ${fence}`,
      '',
    ].join('\n'),
    {
      baseConfig: [
        {
          files: ['**/*.md'],
          plugins: {markdown},
          processor: 'markdown/markdown',
        },
        ...RECOMMENDED_CONFIGS,
        {
          files: ['**/*.js'],
          rules: {
            indent: ['error', 2],
            'object-curly-newline': ['error', 'always'],
          },
        },
      ],
      fix: true,
    },
    'virtual.md',
  );

  expect(result.output).toBe(
    [
      '- item',
      '',
      `  ${fence}html`,
      '  <div>',
      '    <script>',
      '      var a = {',
      '        b: 1',
      '      }',
      '    </script>',
      '  </div>',
      `  ${fence}`,
      '',
    ].join('\n'),
  );
});

it('should give processors with different options different cache ids', () => {
  const version = createProcessor().meta?.version;

  expect(version).toBeTruthy();
  expect(createProcessor().meta?.version).toBe(version);
  expect(createProcessor({reportBadIndent: 'error'}).meta?.version).not.toBe(version);
});
