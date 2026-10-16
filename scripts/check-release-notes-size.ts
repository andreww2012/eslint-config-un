import {styleText} from 'node:util';
import {readPreState} from '@changesets/pre';
import {readChangesets} from '@changesets/read';

// https://docs.github.com/rest/releases/releases#create-a-release
const MAX_RELEASE_NOTES_LENGTH = 125_000;
// Room for the PR and commit links the changelog generator adds to each entry
const LINKS_LENGTH_PER_CHANGESET = 200;
const BIGGEST_CHANGESETS_TO_SHOW = 5;

const formatLength = (length: number) => length.toLocaleString('en-US');

const [changesets, preState] = await Promise.all([
  readChangesets(process.cwd()),
  readPreState(process.cwd()),
]);

const isInPreMode = preState?.mode === 'pre';
// Once pre mode is exited, the released prerelease changesets go into the stable release too
const pendingChangesets = isInPreMode
  ? changesets.filter(({id}) => !id.startsWith('pre/'))
  : changesets;
const entries = pendingChangesets
  .map(({id, summary}) => ({
    id,
    length: summary.replaceAll('\n', '\n  ').length + LINKS_LENGTH_PER_CHANGESET,
  }))
  .toSorted((first, second) => second.length - first.length);
const totalLength = entries.reduce((acc, {length}) => acc + length, 0);

if (totalLength > MAX_RELEASE_NOTES_LENGTH) {
  console.error(
    styleText(
      'red',
      `✗ The next GitHub release notes would be ~${formatLength(totalLength)} characters long, over GitHub's limit of ${formatLength(MAX_RELEASE_NOTES_LENGTH)}`,
    ),
  );
  console.error('The biggest changesets:');
  entries.slice(0, BIGGEST_CHANGESETS_TO_SHOW).forEach(({id, length}) => {
    console.error(`  ${styleText('yellow', `.changeset/${id}.md`)}: ~${formatLength(length)}`);
  });
  if (!isInPreMode && entries.some(({id}) => id.startsWith('pre/'))) {
    console.error(
      `\nAll the released prerelease changesets from ${styleText('cyan', '.changeset/pre')} are included as pre mode is not active.`,
    );
  }
  process.exit(1);
}

console.log(
  styleText(
    'green',
    `✓ The next GitHub release notes would be ~${formatLength(totalLength)} characters long`,
  ),
);
