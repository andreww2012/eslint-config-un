import path from 'node:path';
import {FileSystem} from '@effect/platform';
import {Data, Effect} from 'effect';
import jsonStringifyCompact from 'json-stringify-pretty-compact';
import * as z from 'zod';

const EslintPluginsDbZod = z.record(
  z.string().min(1),
  z
    .discriminatedUnion('status', [
      z.strictObject({
        status: z.enum([
          'deprecated',
          'missing' /* Missing from npm */,
          'fetched' /* Info fetched */,
          'added' /* Already added to eslint-config-un */,
        ]),
      }),
      z.strictObject({
        status: z.literal('accepted') /* To be added to eslint-config-un */,

        /**
         * Min: 1 (highest), max: 3
         */
        priority: z.int().min(1).max(3),
      }),
      z.strictObject({
        status: z.enum(['declined', 'uncertain' /* Maybe should be added to eslint-config-un? */]),
        reason: z.string().min(1),
      }),
    ])
    .nullable(),
);

export type EslintPluginsDb = z.output<typeof EslintPluginsDbZod>;

const knownEslintPluginsPath = path.join(import.meta.dirname, '../../data/eslint-plugins-db.json');

class EslintPluginsDbParseError extends Data.TaggedError('EslintPluginsDbParseError')<{
  cause: unknown;
}> {}

const writeEslintPluginsDb = (data: EslintPluginsDb) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const dataWritten = Object.fromEntries(
      Object.entries(data)
        // eslint-disable-next-line unicorn/no-array-sort
        .sort(([nameA], [nameB]) => nameA.localeCompare(nameB)),
    );

    // Renaming the temp file avoids `UNKNOWN` errors thrown by `fs.writeFile` when the file is already locked on Windows
    const temporaryFileDirPath = path.join(
      import.meta.dirname,
      '../../node_modules/.cache/eslint-config-un/temp',
    );

    yield* fs.makeDirectory(temporaryFileDirPath, {recursive: true});

    const temporaryFilePath = path.join(
      temporaryFileDirPath,
      `eslint-plugins-db-${Date.now()}.json.tmp`,
    );

    yield* fs.writeFileString(
      temporaryFilePath,
      jsonStringifyCompact(dataWritten, {maxLength: 1000}),
    );

    yield* fs.rename(temporaryFilePath, knownEslintPluginsPath);

    return dataWritten;
  });

export const readEslintPluginsDb = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  const exists = yield* fs.exists(knownEslintPluginsPath);

  if (!exists) {
    const emptyData: EslintPluginsDb = {};
    yield* writeEslintPluginsDb(emptyData);
    return emptyData;
  }

  const data = yield* fs.readFileString(knownEslintPluginsPath);

  const parsed = yield* Effect.try({
    try: () => EslintPluginsDbZod.parse(JSON.parse(data)),
    catch: (error) => new EslintPluginsDbParseError({cause: error}),
  });

  return parsed;
});

export const updateEslintPluginsDb = (data: EslintPluginsDb, doNotAppendCurrentDb = false) =>
  Effect.gen(function* () {
    const currentDb = doNotAppendCurrentDb ? {} : yield* readEslintPluginsDb;

    return yield* writeEslintPluginsDb({...currentDb, ...data});
  });
