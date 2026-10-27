import fs from 'node:fs';
import path from 'node:path';
import {styleText} from 'node:util';
import ts from 'typescript';
import {parseNpmPackageSpecifier} from 'utilery';
import {pathExistsSync, readFilesInDirectorySafe} from 'utilery/server';
import ourPackageJson from '../package.json' with {type: 'json'};

const ROOT = process.cwd();
const DIST_DIRECTORY = path.join(ROOT, 'temp', 'dist');

interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * Extract bare-specifier imports from a declaration file using the TypeScript AST.
 * Covers `import ... from 'pkg'`, `export ... from 'pkg'`, and `import 'pkg'`
 */
function extractBareImports(filePath: string, content: string): readonly string[] {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ESNext, true);
  const specifiers = new Set<string>();

  function visit(node: ts.Node): void {
    const moduleSpecifier =
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier != null &&
      ts.isStringLiteral(node.moduleSpecifier)
        ? node.moduleSpecifier.text
        : null;

    if (
      moduleSpecifier != null &&
      !moduleSpecifier.startsWith('.') &&
      !moduleSpecifier.startsWith('/') &&
      !moduleSpecifier.startsWith('node:')
    ) {
      specifiers.add(moduleSpecifier);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...specifiers];
}

const NPM_ALIAS_REGEX = /^npm:(@?[^@]+)@/;

/**
 * Collect allowed package names from `dependencies` + `peerDependencies`.
 * Handles npm aliases: `"alias": "npm:actual-pkg@version"` → adds both the alias and the resolved
 * package name, since TypeScript imports use the real name
 */
function resolveAllowedPackages(packageJson: PackageJson): ReadonlySet<string> {
  const allowed = new Set<string>();
  (['dependencies', 'peerDependencies'] as const).forEach((section) => {
    Object.entries(packageJson[section] || {}).forEach(([name, version]) => {
      allowed.add(name);
      const resolvedAlias = version.match(NPM_ALIAS_REGEX)?.[1];
      if (resolvedAlias) {
        allowed.add(resolvedAlias);
      }
    });
  });
  return allowed;
}

/** Collect package names that are inlined into `dist/node_modules/` */
function collectInlinedPackages(distDirectory: string): ReadonlySet<string> {
  const nodeModulesDirectory = path.join(distDirectory, 'node_modules');
  const inlined = new Set<string>();
  if (!pathExistsSync(nodeModulesDirectory)) {
    return inlined;
  }
  fs.readdirSync(nodeModulesDirectory, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      if (entry.name.startsWith('@')) {
        fs.readdirSync(path.join(nodeModulesDirectory, entry.name), {withFileTypes: true}).forEach(
          (scopedEntry) => {
            if (scopedEntry.isDirectory()) {
              inlined.add(`${entry.name}/${scopedEntry.name}`);
            }
          },
        );
      } else {
        inlined.add(entry.name);
      }
    });
  return inlined;
}

const declarationFiles = await readFilesInDirectorySafe(DIST_DIRECTORY, {
  recursive: true,
  extensions: '.d.mts',
  filter: (relativePath) => !relativePath.startsWith('node_modules/'),
});
if (!declarationFiles) {
  console.error(styleText('red', `✗ ${DIST_DIRECTORY} not found, run 'build:code:test' first`));
  process.exit(1);
}

const allowed = resolveAllowedPackages(ourPackageJson);
const inlined = collectInlinedPackages(DIST_DIRECTORY);

const leaks = new Map<string, ReadonlySet<string>>(); // file → leaked specifiers

declarationFiles.forEach(({path: file, contents}) => {
  const leakedSpecifiers = extractBareImports(file, contents).filter((specifier) => {
    const packageName = parseNpmPackageSpecifier(specifier)?.name || specifier;
    return !allowed.has(packageName) && !inlined.has(packageName);
  });
  if (leakedSpecifiers.length > 0) {
    leaks.set(path.relative(ROOT, file), new Set(leakedSpecifiers));
  }
});

if (leaks.size > 0) {
  console.error(styleText('red', '✗ devDependency types are leaking into declaration files:'));
  leaks.forEach((specifiers, file) => {
    console.error(`  ${styleText('yellow', file)}`);
    specifiers.forEach((specifier) => {
      console.error(`    ${specifier}`);
    });
  });
  console.error(
    `\nRemove them from ${styleText('cyan', 'deps.dts.neverBundle')} in ${styleText('cyan', 'tsdown.config.ts')} to inline their types, or declare them as optional peer dependencies if their types can't be inlined.`,
  );
  process.exit(1);
}

console.log(styleText('green', '✓ Declaration files are self-contained'));
