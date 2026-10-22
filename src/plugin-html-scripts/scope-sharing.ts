import path from 'node:path';
import {ConfigCommentParser} from '@eslint/plugin-kit';
import type * as Eslint from 'eslint';
import * as eslintScope from 'eslint-scope';
import * as eslintVisitorKeys from 'eslint-visitor-keys';
import * as espree from 'espree';
import {PLUGIN_META} from './meta';

/** What ESLint gives to parsers, plus the parser this one wraps */
export interface ParseOptions extends Eslint.Linter.ParserOptions {
  parser?: Eslint.Linter.Parser;
}

interface ParseResult extends Eslint.Linter.ESLintParseResult {
  scopeManager: Eslint.Scope.ScopeManager;
}

interface ScriptGlobals {
  declared: readonly string[];
  through: readonly string[];
}

interface FileScript {
  code: string;
  isModule: boolean;
  filePath: string;
  globals: ScriptGlobals | undefined;

  /** A parse made ahead of time, to reuse when ESLint gets to the script */
  earlyParse: {options: ParseOptions; result: ParseResult} | undefined;
}

interface FileState {
  scripts: readonly FileScript[];
  parseOptions: ParseOptions | undefined;
  hasReportedParserNotUsed: boolean;
}

// Keyed by the filename given to `preprocess`, the dirname of the virtual files of its scripts
const filesStates = new Map<string, FileState>();

const EMPTY_GLOBALS: ScriptGlobals = Object.freeze({declared: [], through: []});

const commentParser = new ConfigCommentParser();

export const getScriptFilename = (index: number, isModule: boolean) =>
  `script-${index}.${isModule ? 'mjs' : 'js'}`;

export const setFileScripts = (
  filename: string,
  scripts: readonly {code: string; isModule: boolean}[],
  firstBlockIndex: number,
) => {
  filesStates.set(filename, {
    scripts: scripts.map((script, index) => ({
      ...script,
      // ESLint prefixes the name of a block with its index
      filePath: path.join(
        filename,
        `${firstBlockIndex + index}_${getScriptFilename(index, script.isModule)}`,
      ),
      globals: undefined,
      earlyParse: undefined,
    })),
    parseOptions: undefined,
    hasReportedParserNotUsed: false,
  });
};

export const deleteFileScripts = (filename: string) => {
  filesStates.delete(filename);
};

const getScriptContext = (filePath: string | undefined) => {
  const file = filePath == null ? undefined : filesStates.get(path.dirname(filePath));
  const index = file?.scripts.findIndex((script) => script.filePath === filePath) ?? -1;
  const script = file?.scripts[index];
  return file && script ? {file, index, script} : null;
};

const getFilePath = (options: ParseOptions) => {
  const filePath: unknown = options['filePath'];
  return typeof filePath === 'string' ? filePath : undefined;
};

const isProgram = (ast: unknown): ast is Eslint.AST.Program =>
  typeof ast === 'object' && ast != null && 'type' in ast && ast.type === 'Program';

const isScopeManager = (value: unknown): value is Eslint.Scope.ScopeManager =>
  typeof value === 'object' && value != null && 'globalScope' in value;

// Mirrors what ESLint does for parsers that don't return a scope manager
const analyzeScope = (
  ast: Eslint.AST.Program,
  parserOptions: Eslint.Linter.ParserOptions,
  visitorKeys: Eslint.Linter.ESLintParseResult['visitorKeys'],
): Eslint.Scope.ScopeManager => {
  const {ecmaFeatures = {}} = parserOptions;
  const ecmaVersion: unknown = parserOptions['ecmaVersion'];
  const sourceType: unknown = parserOptions['sourceType'];
  return eslintScope.analyze(ast, {
    ignoreEval: true,
    nodejsScope: ecmaFeatures.globalReturn,
    impliedStrict: ecmaFeatures.impliedStrict,
    ecmaVersion: typeof ecmaVersion === 'number' ? ecmaVersion : 6,
    sourceType: sourceType === 'module' || sourceType === 'commonjs' ? sourceType : 'script',
    childVisitorKeys: visitorKeys || eslintVisitorKeys.KEYS,
    /* v8 ignore next -- only for the nodes no visitor keys describe */
    fallback: (node) => [...eslintVisitorKeys.getKeys(node)],
    jsx: ecmaFeatures.jsx,
  });
};

// ESLint does the same when espree is the configured parser
const normalizeEspreeOptions = (
  parserOptions: Eslint.Linter.ParserOptions,
): Eslint.Linter.ParserOptions =>
  parserOptions['sourceType'] === 'module' && parserOptions.ecmaFeatures?.globalReturn
    ? {...parserOptions, ecmaFeatures: {...parserOptions.ecmaFeatures, globalReturn: false}}
    : parserOptions;

const callParser = (
  parser: Eslint.Linter.Parser | undefined,
  code: string,
  parserOptions: Eslint.Linter.ParserOptions,
): Eslint.Linter.ESLintParseResult | {ast: unknown} => {
  if (!parser) {
    return {ast: espree.parse(code, normalizeEspreeOptions(parserOptions))};
  }
  return 'parseForESLint' in parser
    ? parser.parseForESLint(code, parserOptions)
    : {ast: parser.parse(code, parserOptions)};
};

const parseWithInnerParser = (code: string, {parser, ...parserOptions}: ParseOptions) => {
  const result = callParser(parser, code, parserOptions);
  const {ast} = result;
  if (!isProgram(ast)) {
    throw new Error(`The parser of ${PLUGIN_META.name} needs an ESTree parser`);
  }

  const visitorKeys = 'visitorKeys' in result ? result.visitorKeys : undefined;
  const scopeManager = 'scopeManager' in result ? result.scopeManager : undefined;
  return {
    ...result,
    ast,
    scopeManager: isScopeManager(scopeManager)
      ? scopeManager
      : analyzeScope(ast, parserOptions, visitorKeys),
  } satisfies ParseResult;
};

// A parse made with the options the rule falls back to has no comments
const getInlineGlobalNames = ({comments = []}: Partial<Pick<Eslint.AST.Program, 'comments'>>) =>
  comments
    .filter((comment) => comment.type === 'Block')
    .flatMap((comment) => {
      const directive = commentParser.parseDirective(comment.value);
      return directive && (directive.label === 'global' || directive.label === 'globals')
        ? Object.keys(commentParser.parseStringConfig(directive.value))
        : [];
    });

// The scope of top-level declarations: the global scope, or the module / CommonJS one
const getTopLevelScope = (globalScope: Eslint.Scope.Scope, ast: Eslint.AST.Program) => {
  const [firstChildScope] = globalScope.childScopes;
  return firstChildScope?.block === ast ? firstChildScope : globalScope;
};

// Must run before any global is added to the scope manager
const collectGlobals = ({ast, scopeManager}: ParseResult, isModule: boolean) => {
  const {globalScope} = scopeManager;
  /* v8 ignore next 3 -- every scope manager made for ESLint has a global scope */
  if (!globalScope) {
    return EMPTY_GLOBALS;
  }

  return {
    declared: isModule
      ? []
      : [
          ...getTopLevelScope(globalScope, ast).variables.map((variable) => variable.name),
          ...getInlineGlobalNames(ast),
        ],
    through: globalScope.through.map((reference) => reference.identifier.name),
  };
};

const haveSameOptions = (first: ParseOptions, second: ParseOptions) =>
  [...new Set([...Object.keys(first), ...Object.keys(second)])].every(
    (key) => key === 'filePath' || first[key] === second[key],
  );

/** Parses another script of the file ahead of time, with the options of the current one */
const getScriptGlobals = (file: FileState, index: number, currentScript: FileScript) => {
  const script = file.scripts[index];
  /* v8 ignore next 3 -- the index always points to a script of the file */
  if (!script) {
    return EMPTY_GLOBALS;
  }
  if (script.globals) {
    return script.globals;
  }

  const parseOptions = file.parseOptions || {};
  const options =
    script.isModule === currentScript.isModule
      ? parseOptions
      : {...parseOptions, sourceType: script.isModule ? 'module' : 'script'};
  try {
    const result = parseWithInnerParser(script.code, {
      ...options,
      filePath: script.filePath,
    });
    script.globals = collectGlobals(result, script.isModule);
    script.earlyParse = {options, result};
  } catch {
    // ESLint reports the parsing error when it lints this script
    script.globals = EMPTY_GLOBALS;
  }

  return script.globals;
};

// Names declared or used by the scripts from `start` to `end`, parsed if needed
const collectScriptNames = (
  file: FileState,
  {start, end}: {start: number; end: number},
  currentScript: FileScript,
  kind: keyof ScriptGlobals,
) =>
  new Set(
    file.scripts
      .slice(start, end)
      .flatMap((_, offset) => getScriptGlobals(file, start + offset, currentScript)[kind]),
  );

// Reuses (once) a parse made ahead of time with the same options
const takeEarlyParse = (script: FileScript, code: string, options: ParseOptions) => {
  const {earlyParse} = script;
  script.earlyParse = undefined;
  return earlyParse && script.code === code && haveSameOptions(earlyParse.options, options)
    ? earlyParse.result
    : undefined;
};

/**
 * Wraps `parserOptions.parser` (espree by default), declaring the global variables of the previous
 * classic scripts of the same HTML file
 */
export const parser = {
  meta: {name: `${PLUGIN_META.name}/parser`, version: PLUGIN_META.version},

  parseForESLint: (code: string, options: ParseOptions = {}) => {
    const context = getScriptContext(getFilePath(options));
    if (context == null) {
      return parseWithInnerParser(code, options);
    }

    const {file, index, script} = context;
    file.parseOptions = options;

    const result = takeEarlyParse(script, code, options) || parseWithInnerParser(code, options);
    const globals = collectGlobals(result, script.isModule);
    script.globals = globals;

    const declaredBefore = collectScriptNames(file, {start: 0, end: index}, script, 'declared');
    const names = [...new Set(globals.through).intersection(declaredBefore)];
    // Scope managers of parsers made for older ESLint versions may not have it
    if (names.length > 0 && typeof result.scopeManager.addGlobals === 'function') {
      result.scopeManager.addGlobals(names);
    }

    return result;
  },
} satisfies Eslint.Linter.Parser;

// By name, in case the plugin is loaded more than once
const isPluginParser = (configuredParser: Eslint.Linter.Parser | undefined) =>
  configuredParser?.meta?.name === parser.meta.name;

export const scopeSharingRule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Mark the global variables of a classic script as used when the next scripts of the same HTML file use them',
    },
    schema: [],
    messages: {
      parserNotUsed: `The parser of ${PLUGIN_META.name} is not used for this script, so it doesn't see the global variables of the previous scripts. Set it in \`languageOptions.parser\`, and your parser in \`parserOptions.parser\`.`,
    },
  },

  create: (context) => {
    const scriptContext = getScriptContext(context.filename);
    if (scriptContext == null) {
      return {};
    }

    const {file, index, script} = scriptContext;
    const {languageOptions, sourceCode} = context;
    // Once per file, for the first script that could use globals of previous scripts
    const shouldReportParserNotUsed =
      !file.hasReportedParserNotUsed &&
      !isPluginParser(languageOptions.parser) &&
      file.scripts.slice(0, index).some((previous) => !previous.isModule);
    if (shouldReportParserNotUsed) {
      file.hasReportedParserNotUsed = true;
    }
    const reportParserNotUsed = (node: Eslint.AST.Program) => {
      if (shouldReportParserNotUsed) {
        context.report({loc: node.loc.start, messageId: 'parserNotUsed'});
      }
    };
    if (script.isModule) {
      return {Program: reportParserNotUsed};
    }

    // When another parser is configured, the next scripts are still shared
    file.parseOptions ||= {
      ...languageOptions.parserOptions,
      ecmaVersion: languageOptions.ecmaVersion,
      sourceType: languageOptions.sourceType,
      parser: languageOptions.parser,
    };

    return {
      Program: (node) => {
        reportParserNotUsed(node);
        collectScriptNames(
          file,
          {start: index + 1, end: file.scripts.length},
          script,
          'through',
        ).forEach((name) => {
          sourceCode.markVariableAsUsed(name, node);
        });
      },
    };
  },
};
