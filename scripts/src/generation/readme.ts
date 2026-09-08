import fs from 'node:fs/promises';
import pathe from 'pathe';
import {pluginsLoaders} from '../../../src/loaders/plugins';
import {capitalize} from '../../../src/utils';
import {readPluginMetadata} from '../../shared/plugin-metadata';

const README_PATH = pathe.join(import.meta.dirname, '../../../README.md');

const RENAMES_MARKER = 'DEFAULT-RENAMES-TABLE';

const GENERATED_NOTICE = 'generated, do not edit manually';

const PLUGIN_LOADERS: Partial<Record<string, {packageName: string}>> = pluginsLoaders;

const LINK_REFERENCE_DEFINITION_REGEXP = /^\[([^\]]+)\]: (\S+)$/gm;

/**
 * The readme defines a reference for some of the packages, and `markdown-preferences` insists on
 * those being used wherever the same URL appears again
 */
const createPackageLinkRenderer = (readme: string) => {
  const labelsByUrl = new Map(
    Array.from(readme.matchAll(LINK_REFERENCE_DEFINITION_REGEXP), ([, label, url]) => [url, label]),
  );
  return (packageName: string) => {
    const url = `https://npmx.dev/${packageName}`;
    const label = labelsByUrl.get(url);
    return label == null ? `[\`${packageName}\`](${url})` : `[\`${packageName}\`][${label}]`;
  };
};

/**
 * The readme is not formatted by Prettier, so the columns are padded here
 */
const renderTable = (header: readonly string[], rows: readonly (readonly string[])[]) => {
  const widths = header.map((_, column) =>
    Math.max(...[header, ...rows].map((cells) => cells[column]?.length || 0)),
  );
  const renderRow = (cells: readonly string[]) =>
    `| ${cells.map((cell, column) => cell.padEnd(widths[column] || 0)).join(' | ')} |`;
  return [
    renderRow(header),
    `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`,
    ...rows.map(renderRow),
  ].join('\n');
};

const escapeCell = (text: string) => text.replaceAll('|', String.raw`\|`);

interface RenameRow {
  packageName: string;
  suggestedPrefix: string;
  prefix: string;
  reason: string;
}

/**
 * Rows sharing a reason are kept together so that only the first of them spells it out, which is
 * what the hand-written table did with its `^` references
 */
const orderRows = (rows: readonly RenameRow[]) =>
  Array.from(
    Map.groupBy(rows, ({reason}) => reason),
    ([reason, group]) => ({
      reason,
      group: group.toSorted((a, b) => a.packageName.localeCompare(b.packageName)),
    }),
  )
    .toSorted((a, b) => b.group.length - a.group.length || a.reason.localeCompare(b.reason))
    .flatMap(({group}) =>
      group.map((row, index) => ({
        ...row,
        reason: index === 0 ? capitalize(row.reason) : 'Similar reason ^',
      })),
    );

const renderRenamesTable = (rows: readonly RenameRow[], readme: string) => {
  const renderPackageLink = createPackageLinkRenderer(readme);
  return renderTable(
    ['Plugin', 'Suggested prefix', 'Our prefix', 'Reason'],
    orderRows(rows).map(({packageName, suggestedPrefix, prefix, reason}) => [
      renderPackageLink(packageName),
      `\`${suggestedPrefix}\``,
      `\`${prefix}\``,
      escapeCell(reason),
    ]),
  );
};

const replaceBetweenMarkers = (readme: string, marker: string, content: string) => {
  const start = readme.indexOf(`<!-- ${marker}:START`);
  const end = readme.indexOf(`<!-- ${marker}:END -->`);
  if (start === -1 || end === -1) {
    throw new Error(`The \`${marker}\` markers are missing from the readme`);
  }
  return [
    readme.slice(0, start),
    `<!-- ${marker}:START - ${GENERATED_NOTICE} -->\n`,
    `\n${content}\n\n`,
    readme.slice(end),
  ].join('');
};

export const writeReadmeArtifacts = async () => {
  const rows = (await readPluginMetadata()).flatMap(({prefix, metadata}): RenameRow[] => {
    const packageName = PLUGIN_LOADERS[prefix]?.packageName;
    if (packageName == null || !metadata.suggestedPrefix) {
      return [];
    }
    const [suggestedPrefix, reason] = metadata.suggestedPrefix;
    return [{packageName, suggestedPrefix, prefix, reason}];
  });

  const readme = await fs.readFile(README_PATH, 'utf8');
  const updated = replaceBetweenMarkers(readme, RENAMES_MARKER, renderRenamesTable(rows, readme));
  await fs.writeFile(README_PATH, updated);

  return {renamesCount: rows.length};
};
