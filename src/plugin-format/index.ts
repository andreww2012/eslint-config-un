// cspell:ignore Invisibles Syncify
import path from 'node:path';
import type * as Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';
import type {FormatConfig as OxfmtOptions} from 'oxfmt';
import type {Options as PrettierOptions} from 'prettier';
import {type Difference, generateDifferences, showInvisibles} from 'prettier-linter-helpers';
import {type Syncify, createSyncFn} from 'synckit';
import type {EslintPlugin} from '../eslint/eslint-types';
import type {DprintOptions, FormatInWorker, FormatRequest} from './worker';

// Built next to this module, keeping its extension
const workerPath = path.join(import.meta.dirname, `worker${path.extname(import.meta.filename)}`);

const MESSAGES: Readonly<Record<Difference['operation'], string>> = {
  insert: 'Insert `{{ insertText }}`',
  delete: 'Delete `{{ deleteText }}`',
  replace: 'Replace `{{ deleteText }}` with `{{ insertText }}`',
};

const FILE_START_POSITION = {line: 1, column: 0} as const;

// Prettier appends the position to the message, which ESLint shows on its own
const MESSAGE_POSITION_SUFFIX_REGEXP = / \(\d+:\d+\)$/;

const ANY_OBJECT_SCHEMA: Readonly<JSONSchema4> = {
  type: 'object',
  additionalProperties: true,
};

const DPRINT_OPTIONS_SCHEMA: Readonly<JSONSchema4> = {
  type: 'object',
  properties: {
    language: {type: 'string'},
    languageOptions: {type: 'object'},
    plugins: {type: 'array'},
  },
  additionalProperties: true,
};

const PRETTIER_RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    readConfig: {
      type: 'boolean',
      description:
        'Whether to read the Prettier config (and `.editorconfig`) that applies to the file. The rule options take precedence over it. Default: `true`',
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

let formatInWorker: Syncify<FormatInWorker> | undefined;

// Spawning the worker thread is deferred until a file is actually formatted
const getFormatInWorker = () => {
  formatInWorker ||= createSyncFn<FormatInWorker>(workerPath);
  return formatInWorker;
};

const reportDifferences = (
  context: Eslint.Rule.RuleContext,
  code: string,
  formattedCode: string,
) => {
  generateDifferences(code, formattedCode).forEach((difference) => {
    const textToDelete = 'deleteText' in difference ? difference.deleteText : '';
    const textToInsert = 'insertText' in difference ? difference.insertText : '';
    const range: [number, number] = [difference.offset, difference.offset + textToDelete.length];
    context.report({
      messageId: difference.operation,
      data: {deleteText: showInvisibles(textToDelete), insertText: showInvisibles(textToInsert)},
      loc: {
        start: context.sourceCode.getLocFromIndex(range[0]),
        end: context.sourceCode.getLocFromIndex(range[1]),
      },
      fix: (fixer) => fixer.replaceTextRange(range, textToInsert),
    });
  });
};

const reportError = (context: Eslint.Rule.RuleContext, error: unknown) => {
  if (error instanceof SyntaxError) {
    // Prettier's syntax errors carry the location and the code frame it also puts in the message
    const {
      codeFrame,
      loc,
    }: SyntaxError & {codeFrame?: string; loc?: {start: {line: number; column: number}}} = error;
    const message = codeFrame ? error.message.replace(`\n${codeFrame}`, '') : error.message;
    context.report({
      message: `Parsing error: ${loc ? message.replace(MESSAGE_POSITION_SUFFIX_REGEXP, '') : message}`,
      // Prettier counts columns from 1, unlike ESLint
      loc: loc ? {line: loc.start.line, column: loc.start.column - 1} : FILE_START_POSITION,
    });
    return;
  }

  context.report({
    message: `Failed to format the code: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    loc: FILE_START_POSITION,
  });
};

type FormatRule<RuleOptions extends unknown[]> = Eslint.JSRuleDefinition<{
  RuleOptions: RuleOptions;
}>;

const createFormatRule = <RuleOptions extends unknown[]>(
  description: string,
  schema: readonly JSONSchema4[],
  createRequest: (context: Parameters<FormatRule<RuleOptions>['create']>[0]) => FormatRequest,
): FormatRule<RuleOptions> => ({
  meta: {
    type: 'layout',
    docs: {description},
    fixable: 'whitespace',
    schema,
    messages: MESSAGES,
  },
  create: (context) => ({
    // Not necessarily `Program`: the plugin formats files of any language
    [context.sourceCode.ast.type]: () => {
      const request = createRequest(context);
      try {
        const formattedCode = getFormatInWorker()(request);
        if (formattedCode != null) {
          reportDifferences(context, request.code, formattedCode);
        }
      } catch (error) {
        reportError(context, error);
      }
    },
  }),
});

export const formatRules = {
  // Required, as dprint can't format without a plugin
  dprint: createFormatRule<[DprintOptions]>(
    'Use dprint to format code',
    [DPRINT_OPTIONS_SCHEMA],
    (context) => ({
      formatter: 'dprint',
      code: context.sourceCode.text,
      filePath: context.filename,
      options: context.options[0],
    }),
  ),
  oxfmt: createFormatRule<[OxfmtOptions?]>(
    'Use oxfmt to format code',
    [ANY_OBJECT_SCHEMA],
    (context) => ({
      formatter: 'oxfmt',
      code: context.sourceCode.text,
      filePath: context.filename,
      options: context.options[0] || {},
    }),
  ),
  prettier: createFormatRule<
    [PrettierOptions?, InferJsonSchemaType<typeof PRETTIER_RULE_OPTIONS_SCHEMA>?]
  >('Use Prettier to format code', [ANY_OBJECT_SCHEMA, PRETTIER_RULE_OPTIONS_SCHEMA], (context) => {
    const [prettierOptions, ruleOptions] = context.options;
    return {
      formatter: 'prettier',
      code: context.sourceCode.text,
      filePath: context.filename,
      options: prettierOptions || {},
      shouldReadConfig: ruleOptions?.readConfig !== false,
    };
  }),
};

const eslintPluginFormat: EslintPlugin = {
  meta: {
    name: 'eslint-plugin-un-format',
  },
  rules: formatRules,
};

// eslint-disable-next-line import/no-default-export
export default eslintPluginFormat;
