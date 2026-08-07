import fs from 'node:fs';
import path from 'node:path';
import {styleText} from 'node:util';
import ts from 'typescript';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'temp', 'dist');

interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

// eslint-disable-next-line jsdoc/require-yields
/** Walk all `.d.mts` files under `dir`, skipping `skipDir`. */
function* walkDeclarations(dir: string, skipDir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full === skipDir) {
        continue;
      }
      yield* walkDeclarations(full, skipDir);
    } else if (entry.isFile() && entry.name.endsWith('.d.mts')) {
      yield full;
    }
  }
}

/**
 * Extract bare-specifier imports from a declaration file using the TypeScript AST.
 * Covers `import ... from 'pkg'`, `export ... from 'pkg'`, and `import 'pkg'`.
 */
function extractBareImports(filePath: string, content: string): string[] {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ESNext, true);
  const specs = new Set<string>();

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
      specs.add(moduleSpecifier);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...specs];
}

/** Normalize a module specifier to its npm package name. */
function toPkgName(specifier: string): string {
  return specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : (specifier.split('/', 1)[0] ?? specifier);
}

const NPM_ALIAS_REGEX = /^npm:(@?[^@]+)@/;

/**
 * Collect allowed package names from `dependencies` + `peerDependencies`.
 * Handles npm aliases: `"alias": "npm:actual-pkg@version"` → adds both the
 * alias and the resolved package name, since TypeScript imports use the real name.
 */
function resolveAllowedPackages(pkg: PackageJson): Set<string> {
  const allowed = new Set<string>();
  for (const section of ['dependencies', 'peerDependencies'] as const) {
    for (const [name, version] of Object.entries(pkg[section] ?? {})) {
      allowed.add(name);
      const resolvedAlias = version.match(NPM_ALIAS_REGEX)?.[1];
      if (resolvedAlias) {
        allowed.add(resolvedAlias);
      }
    }
  }
  return allowed;
}

/** Collect package names that are inlined into `dist/node_modules/`. */
function collectInlinedPackages(distDir: string): Set<string> {
  const nmDir = path.join(distDir, 'node_modules');
  const inlined = new Set<string>();
  if (!fs.existsSync(nmDir)) {
    return inlined;
  }
  for (const entry of fs.readdirSync(nmDir, {withFileTypes: true})) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.startsWith('@')) {
      for (const sub of fs.readdirSync(path.join(nmDir, entry.name), {withFileTypes: true})) {
        if (sub.isDirectory()) {
          inlined.add(`${entry.name}/${sub.name}`);
        }
      }
    } else {
      inlined.add(entry.name);
    }
  }
  return inlined;
}

if (!fs.existsSync(DIST_DIR)) {
  console.error(styleText('red', `✗ ${DIST_DIR} not found — run 'build:code:test' first`));
  process.exit(1);
}

// eslint-disable-next-line ts/no-unsafe-assignment
const pkg: PackageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const allowed = resolveAllowedPackages(pkg);
const inlined = collectInlinedPackages(DIST_DIR);
const inlinedDir = path.join(DIST_DIR, 'node_modules');

const leaks = new Map<string, Set<string>>(); // file → leaked specifiers

for (const file of walkDeclarations(DIST_DIR, inlinedDir)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const spec of extractBareImports(file, content)) {
    const pkgName = toPkgName(spec);
    if (!allowed.has(pkgName) && !inlined.has(pkgName)) {
      const key = path.relative(ROOT, file);
      const existing = leaks.get(key) ?? new Set();
      existing.add(spec);
      leaks.set(key, existing);
    }
  }
}

if (leaks.size > 0) {
  console.error(styleText('red', '✗ devDependency types are leaking into declaration files:'));
  for (const [file, specs] of leaks) {
    console.error(`  ${styleText('yellow', file)}`);
    for (const spec of specs) {
      console.error(`    ${spec}`);
    }
  }
  console.error(
    `\nAdd these to the ${styleText('cyan', 'dts.resolve')} array in ${styleText('cyan', 'tsdown.config.ts')}.`,
  );
  process.exit(1);
}

console.log(styleText('green', '✓ Declaration files are self-contained'));
