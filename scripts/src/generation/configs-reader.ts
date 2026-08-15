import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import pathe from 'pathe';
import ts from 'typescript';
import {
  type AnyConfigManifest,
  CASCADE_ANCHORS,
  type CascadeAnchor,
  type ConfigPhase,
} from '../../../src/config-un/define-config';
import {LOADABLE_PLUGIN_PREFIXES_LIST} from '../../../src/loaders';
import {allUnionMembers, arrayIncludes} from '../../../src/utils';

const ROOT_DIR = pathe.join(import.meta.dirname, '../../..');
const CONFIGS_DIR = pathe.join(ROOT_DIR, 'src/configs');
const CONFIG_UN_SHARED_PATH = pathe.join(ROOT_DIR, 'src/config-un/shared.ts');

const NON_CONFIG_MODULES = new Set(['index.ts', 'shared.ts']);

const MISC_GROUP_BULLET_REGEXP = /^ {2}- `([^`]+)`$/;
const JS_DOC_OPENING_REGEXP = /^\/\*\*/;
const JS_DOC_LINE_PREFIX_REGEXP = /^\*/;
const TS_EXTENSION_REGEXP = /\.ts$/;
const SUB_CONFIG_PROPERTY_REGEXP = /^config[A-Z]/;

const JS_DOC_CLOSING = '*/';

export const isCascadeAnchor = (entry: string) => arrayIncludes(CASCADE_ANCHORS, entry);

/**
 * The bands the cascade is emitted in, in order, with the anchors standing for the entries that
 * are not Configs. Listing them together is what lets an anchor be placed without naming any
 * Config: every anchor sits on a phase boundary
 */
export const CASCADE_LAYOUT = allUnionMembers<CascadeAnchor | ConfigPhase | 'default'>()([
  'globalSetup',
  'first',
  'default',
  'late',
  'last',
  'rootConfig',
  'extra',
  'userExtraConfigs',
  'terminal',
]);

export const CONFIG_PHASES = CASCADE_LAYOUT.filter(
  (entry): entry is ConfigPhase | 'default' => !isCascadeAnchor(entry),
);

export interface DiscoveredConfig {
  key: string;
  filePath: string;

  /**
   * Import specifier of the module, relative to `src/configs`
   */
  modulePath: string;
  manifest: AnyConfigManifest;

  /**
   * Property names of the manifest object literal, `null` if the boolean shorthand was used
   */
  manifestProperties: string[] | null;
  optionsInterfaceName: string;

  /**
   * Where the options interface is actually declared, which is not necessarily the Config module
   */
  optionsInterfaceFilePath: string;
  isOptionsInterfaceExported: boolean;
  resultInterfaceName: string | null;
  isRequiredPluginKnown: boolean;

  /**
   * Doc comment lines of the options interface, `*` decorations stripped
   */
  prose: string[];
  subConfigs: string[];
}

const getJsDocLines = (declaration: ts.Node) => {
  const jsDoc = ts
    .getJSDocCommentsAndTags(declaration)
    .filter((node) => ts.isJSDoc(node))
    .at(-1);
  if (!jsDoc) {
    return [];
  }

  const lines = jsDoc
    .getText()
    .split('\n')
    .map((line) => {
      const trimmed = line.trim().replace(JS_DOC_OPENING_REGEXP, '');
      const withoutPrefix =
        trimmed === JS_DOC_CLOSING ? '' : trimmed.replace(JS_DOC_LINE_PREFIX_REGEXP, '');
      return (
        withoutPrefix.endsWith(JS_DOC_CLOSING)
          ? withoutPrefix.slice(0, -JS_DOC_CLOSING.length).trimEnd()
          : withoutPrefix
      ).replace(' ', '');
    });
  return lines.slice(1, -1).map((line) => line.trimEnd());
};

const getDefaultExportExpression = (sourceFile: ts.SourceFile) => {
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      return statement.expression;
    }
  }

  return null;
};

const unwrapExpression = (expression: ts.Expression): ts.Expression => {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression)
  ) {
    return unwrapExpression(expression.expression);
  }

  return expression;
};

/**
 * The metadata of a `defineUnConfig(key, manifest)(setup)` default export lives in the inner call
 */
const findDefineUnConfigCall = (expression: ts.Expression) => {
  const unwrapped = unwrapExpression(expression);
  if (!ts.isCallExpression(unwrapped)) {
    return null;
  }

  const callee = unwrapExpression(unwrapped.expression);
  return ts.isCallExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'defineUnConfig'
    ? callee
    : null;
};

const countDefineUnConfigCalls = (sourceFile: ts.SourceFile) => {
  let count = 0;
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'defineUnConfig'
    ) {
      count += 1;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return count;
};

/**
 * Configs the `defaultConfigsStatus` option JSDoc promises `misc-enabled` turns on
 */
export const readDocumentedMiscGroupConfigs = async () => {
  const sourceFile = ts.createSourceFile(
    CONFIG_UN_SHARED_PATH,
    await fs.readFile(CONFIG_UN_SHARED_PATH, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  const optionsInterface = sourceFile.statements.find(
    (statement) =>
      ts.isInterfaceDeclaration(statement) && statement.name.text === 'EslintConfigUnOptions',
  );
  const optionDeclaration =
    optionsInterface &&
    ts.isInterfaceDeclaration(optionsInterface) &&
    optionsInterface.members.find((member) => member.name?.getText() === 'defaultConfigsStatus');
  if (!optionDeclaration) {
    throw new Error('Could not locate the `defaultConfigsStatus` option declaration');
  }

  const docLines = getJsDocLines(optionDeclaration);
  const miscBulletIndex = docLines.findIndex((line) => line.startsWith('- `misc-enabled`'));
  if (miscBulletIndex === -1) {
    throw new Error(
      'Could not locate the `misc-enabled` bullet of the `defaultConfigsStatus` docs',
    );
  }

  const linesAfterBullet = docLines.slice(miscBulletIndex + 1);
  const firstUnrelatedLineIndex = linesAfterBullet.findIndex(
    (line) => !MISC_GROUP_BULLET_REGEXP.test(line),
  );

  return (
    firstUnrelatedLineIndex === -1
      ? linesAfterBullet
      : linesAfterBullet.slice(0, firstUnrelatedLineIndex)
  ).map((line) => line.match(MISC_GROUP_BULLET_REGEXP)?.[1] || '');
};

const collectConfigModulePaths = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = pathe.join(directory, entry.name);
      if (entry.isDirectory()) {
        return await collectConfigModulePaths(fullPath);
      }
      const isConfigModule =
        entry.name.endsWith('.ts') &&
        !entry.name.includes('.gen.') &&
        !NON_CONFIG_MODULES.has(entry.name);
      return isConfigModule ? [fullPath] : [];
    }),
  );
  return nested.flat();
};

export const discoverConfigs = async () => {
  const configModulePaths = (await collectConfigModulePaths(CONFIGS_DIR)).toSorted();

  const tsConfig = ts.readConfigFile(pathe.join(ROOT_DIR, 'tsconfig.json'), (fileName) =>
    ts.sys.readFile(fileName),
  );
  const parsedTsConfig = ts.parseJsonConfigFileContent(tsConfig.config, ts.sys, ROOT_DIR);
  const program = ts.createProgram(configModulePaths, {...parsedTsConfig.options, noEmit: true});
  const checker = program.getTypeChecker();

  const knownPluginPrefixes = new Set<string>(LOADABLE_PLUGIN_PREFIXES_LIST);

  const errors: string[] = [];
  const configs: DiscoveredConfig[] = [];

  // Read from the third `defineUnConfig` type argument rather than derived from the Config key:
  // a convention would have to survive every key spelling, and the module must export the very
  // interface the artifact then imports
  const findExportedResultInterface = (
    sourceFile: ts.SourceFile,
    defineCall: ts.CallExpression,
  ) => {
    const resultTypeNode = defineCall.typeArguments?.[2];
    if (!resultTypeNode || !ts.isTypeReferenceNode(resultTypeNode)) {
      return null;
    }

    const resultInterfaceName = resultTypeNode.typeName.getText();
    return sourceFile.statements.some(
      (statement) =>
        ts.isInterfaceDeclaration(statement) &&
        statement.name.text === resultInterfaceName &&
        statement.modifiers?.some(({kind}) => kind === ts.SyntaxKind.ExportKeyword),
    )
      ? resultInterfaceName
      : {unexportedName: resultInterfaceName};
  };

  await Promise.all(
    configModulePaths.map(async (filePath) => {
      const sourceFile = program.getSourceFile(filePath);
      /* v8 ignore next 3 */
      if (!sourceFile) {
        throw new Error(`Could not read \`${filePath}\``);
      }

      const relativePath = pathe.relative(CONFIGS_DIR, filePath);
      const defaultExport = getDefaultExportExpression(sourceFile);
      const defineCall = defaultExport && findDefineUnConfigCall(defaultExport);
      const defineCallsCount = countDefineUnConfigCalls(sourceFile);

      const modulePath = `./${relativePath.replace(TS_EXTENSION_REGEXP, '')}`;

      if (!defineCall) {
        errors.push(
          `\`${relativePath}\`: the default export must be a \`defineUnConfig(<key>, <manifest>)(<setup>)\` call`,
        );
        return;
      }
      if (defineCallsCount > 1) {
        errors.push(`\`${relativePath}\`: \`defineUnConfig\` must be called exactly once`);
      }

      const [keyArgument] = defineCall.arguments;
      if (!keyArgument || !ts.isStringLiteral(keyArgument)) {
        errors.push(`\`${relativePath}\`: the first \`defineUnConfig\` argument must be a string`);
        return;
      }
      const key = keyArgument.text;

      const manifestArgument = defineCall.arguments[1];
      const manifestObject = manifestArgument && unwrapExpression(manifestArgument);
      const manifestProperties =
        manifestObject && ts.isObjectLiteralExpression(manifestObject)
          ? manifestObject.properties.flatMap((property) =>
              property.name && ts.isIdentifier(property.name) ? [property.name.text] : [],
            )
          : null;

      const optionsTypeNode = defineCall.typeArguments?.[0];
      if (!optionsTypeNode || !ts.isTypeReferenceNode(optionsTypeNode)) {
        errors.push(
          `\`${relativePath}\`: the first \`defineUnConfig\` type argument must be the options interface`,
        );
        return;
      }
      const optionsInterfaceName = optionsTypeNode.typeName.getText();
      const optionsSymbolMaybeAlias = checker.getSymbolAtLocation(optionsTypeNode.typeName);
      const optionsSymbol =
        optionsSymbolMaybeAlias && optionsSymbolMaybeAlias.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(optionsSymbolMaybeAlias)
          : optionsSymbolMaybeAlias;
      const optionsDeclaration = optionsSymbol?.declarations?.find((declaration) =>
        ts.isInterfaceDeclaration(declaration),
      );
      if (!optionsSymbol || !optionsDeclaration) {
        errors.push(
          `\`${relativePath}\`: could not resolve the \`${optionsInterfaceName}\` options interface`,
        );
        return;
      }

      const resultInterface = findExportedResultInterface(sourceFile, defineCall);
      if (resultInterface != null && typeof resultInterface === 'object') {
        errors.push(
          `\`${relativePath}\`: the \`${resultInterface.unexportedName}\` result interface must be exported by this module, as the generated artifact imports it from here`,
        );
        return;
      }

      // A `file://` URL rather than the path itself: Windows reads the `<disk_letter>:`
      // of an absolute path as a URL scheme and refuses to load it
      const manifest =
        // eslint-disable-next-line no-unsanitized/method -- the path comes from the configs directory
        ((await import(pathToFileURL(filePath).href)) as {default: AnyConfigManifest}).default;

      configs.push({
        key,
        filePath,
        modulePath,
        manifest,
        manifestProperties,
        optionsInterfaceName,
        optionsInterfaceFilePath: optionsDeclaration.getSourceFile().fileName,
        isOptionsInterfaceExported:
          optionsDeclaration.modifiers?.some(({kind}) => kind === ts.SyntaxKind.ExportKeyword) ||
          false,
        resultInterfaceName: resultInterface,
        isRequiredPluginKnown:
          !manifest.requires || knownPluginPrefixes.has(manifest.requires.pluginLoadable),
        prose: getJsDocLines(optionsDeclaration),
        subConfigs: checker
          .getPropertiesOfType(checker.getDeclaredTypeOfSymbol(optionsSymbol))
          .filter(({name}) => SUB_CONFIG_PROPERTY_REGEXP.test(name))
          .map(({name}) => name.slice(6, 7).toLowerCase() + name.slice(7))
          // eslint-disable-next-line unicorn/no-array-sort
          .sort(),
      });
    }),
  );

  return {
    configs: configs.toSorted((a, b) => a.key.localeCompare(b.key)),
    errors,
  };
};
