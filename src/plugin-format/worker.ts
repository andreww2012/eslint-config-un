// Spawned by file path and run without a bundler in development, so our own modules can only be
// imported as types
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import url from 'node:url';
import type * as Dprint from '@dprint/formatter';
import type {FormatConfig as OxfmtOptions} from 'oxfmt';
import type {Options as PrettierOptions} from 'prettier';
import {runAsWorker} from 'synckit';
import type {Prettify} from '../types';

export type DprintOptions = Prettify<
  Dprint.GlobalConfiguration &
    (
      | {
          /**
           * One of `json`, `toml`, `markdown`, `typescript` or `dockerfile`, which load the plugin
           * from the corresponding `@dprint/*` package installed in the project, or a file path or
           * URL to the WASM binary of the plugin
           */
          language: string;
          languageOptions?: Record<string, unknown>;
        }
      | {
          /**
           * A file is formatted by the first plugin matching it
           */
          plugins: {
            /**
             * Name of the `@dprint/*` package installed in the project, or a file path or URL to
             * the WASM binary of the plugin
             */
            plugin: string;
            options?: Record<string, unknown>;
          }[];
        }
    )
>;

export type FormatRequest = Prettify<
  {code: string; filePath: string} & (
    | {formatter: 'dprint'; options: DprintOptions}
    | {formatter: 'oxfmt'; options: OxfmtOptions}
    | {formatter: 'prettier'; options: PrettierOptions; shouldReadConfig: boolean}
  )
>;

const DPRINT_PACKAGE_PREFIX = '@dprint/';

const DPRINT_BUILTIN_LANGUAGES: ReadonlySet<string> = new Set([
  'json',
  'toml',
  'markdown',
  'typescript',
  'dockerfile',
]);

const URL_REGEXP = /^[\w-]+:\/\//;

const OXFMT_UNSUPPORTED_FILE_ERROR_PREFIX = 'Unsupported file type:';

const dprintFormatters = new Map<string, Promise<Dprint.Formatter>>();
const dprintContexts = new Map<string, Promise<Dprint.FormatterContext>>();

// `@dprint/*` plugin packages are not our dependencies, so only the project can reach them
const projectRequire = createRequire(path.join(process.cwd(), 'package.json'));

const getOrInsertPromise = <T>(
  map: Map<string, Promise<T>>,
  key: string,
  create: () => Promise<T>,
) => {
  const existingPromise = map.get(key);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = create();
  map.set(key, promise);
  return promise;
};

const loadDprintPlugin = async (source: string) => {
  if (source.startsWith(DPRINT_PACKAGE_PREFIX)) {
    // eslint-disable-next-line no-unsanitized/method -- only `@dprint/*` packages are imported
    const dprintPackage = (await import(
      url.pathToFileURL(projectRequire.resolve(source)).href
    )) as {getBuffer?: () => ArrayBufferView; getPath?: () => string};

    const buffer = dprintPackage.getBuffer?.();
    if (buffer) {
      return buffer;
    }

    const pluginPath = dprintPackage.getPath?.();
    if (pluginPath == null) {
      throw new Error(`\`${source}\` exports neither \`getBuffer\` nor \`getPath\``);
    }
    return await fs.readFile(pluginPath);
  }

  if (source.startsWith('data:')) {
    // eslint-disable-next-line unicorn/prefer-uint8array-base64 -- not available in Node.js 22
    return Buffer.from(source.slice(source.indexOf(',') + 1), 'base64');
  }

  return await (URL_REGEXP.test(source)
    ? (await fetch(source)).arrayBuffer()
    : fs.readFile(source));
};

const formatWithDprint = async (code: string, filePath: string, options: DprintOptions) => {
  const dprint = await import('@dprint/formatter');

  if ('language' in options) {
    const {language, languageOptions = {}, ...globalConfig} = options;
    const source = DPRINT_BUILTIN_LANGUAGES.has(language)
      ? `${DPRINT_PACKAGE_PREFIX}${language}`
      : language;
    const formatter = await getOrInsertPromise(dprintFormatters, source, async () =>
      dprint.createFromBuffer(await loadDprintPlugin(source)),
    );
    formatter.setConfig(globalConfig, languageOptions);
    return formatter.formatText({filePath, fileText: code});
  }

  const {plugins, ...globalConfig} = options;
  const context = await getOrInsertPromise(dprintContexts, JSON.stringify(options), async () => {
    const loadedPlugins = await Promise.all(
      plugins.map(async ({plugin, options: pluginOptions}) => ({
        buffer: await loadDprintPlugin(plugin),
        pluginOptions,
      })),
    );

    const newContext = dprint.createContext(globalConfig);
    // The order matters: a file is formatted by the first plugin matching it
    loadedPlugins.forEach(({buffer, pluginOptions}) => {
      newContext.addPlugin(buffer, pluginOptions || {});
    });
    return newContext;
  });
  return context.formatText({filePath, fileText: code});
};

const formatWithOxfmt = async (code: string, filePath: string, options: OxfmtOptions) => {
  const {format} = await import('oxfmt');
  const {code: formattedCode, errors} = await format(filePath, code, options);

  const [error] = errors;
  if (error) {
    if (error.message.startsWith(OXFMT_UNSUPPORTED_FILE_ERROR_PREFIX)) {
      return null;
    }
    throw new Error(error.message);
  }

  return formattedCode;
};

const formatWithPrettier = async (
  code: string,
  filePath: string,
  options: PrettierOptions,
  shouldReadConfig: boolean,
) => {
  const prettier = await import('prettier');
  // Code blocks resolve as files inside the Markdown file, getting the overrides for their extension
  const config = shouldReadConfig
    ? await prettier.resolveConfig(filePath, {editorconfig: true})
    : null;
  return await prettier.format(code, {...config, filepath: filePath, ...options});
};

/** Resolves to `null` if the formatter does not support the file */
const format = async (request: FormatRequest) => {
  if (request.formatter === 'dprint') {
    return await formatWithDprint(request.code, request.filePath, request.options);
  }
  if (request.formatter === 'oxfmt') {
    return await formatWithOxfmt(request.code, request.filePath, request.options);
  }
  return await formatWithPrettier(
    request.code,
    request.filePath,
    request.options,
    request.shouldReadConfig,
  );
};

export type FormatInWorker = typeof format;

runAsWorker(format);
