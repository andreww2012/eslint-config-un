// cspell:ignore parseable
import {builtinModules} from 'node:module';
// eslint-disable-next-line import/no-extraneous-dependencies
import esbuild from 'esbuild';

const builtinModuleRequiresRegex = new RegExp(
  String.raw`require\("(?:${builtinModules.join('|')})"\)`,
);

export const load = async (url, context, nextLoad) => {
  const isHttpsUrl = url.startsWith('https://');
  if (!isHttpsUrl) {
    return nextLoad(url);
  }

  const urlParsed = new URL(url);
  urlParsed.pathname = urlParsed.pathname
    .replace(/\.(json|mts)(?:\.ts)+$/, '.$1')
    .replace(/\.mts$/, '.mjs');

  const requestedModuleMatch = urlParsed.pathname.match(
    /^\/([\w-]+|@[\w-]+\/[\w-]+)(@[^/@]+)?(?:\/.*)?$/,
  );

  // eslint-disable-next-line no-param-reassign
  url = urlParsed.toString();

  const urlWithRaw = new URL(urlParsed);
  urlWithRaw.searchParams.set('raw', '');

  const [response, responseRaw] = await Promise.all([
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    fetch(url),
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    fetch(urlWithRaw.toString()),
  ]);
  let [moduleSource, moduleSourceRaw] = await Promise.all([response.text(), responseRaw.text()]);

  // https://esm.sh/typescript@5.9.3/es2022/typescript.mjs?raw
  if (responseRaw.status === 404 && requestedModuleMatch) {
    // const old = urlWithRaw.pathname;
    urlWithRaw.pathname = `${requestedModuleMatch[1] || ''}${requestedModuleMatch[2] || ''}`;
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    moduleSourceRaw = await (await fetch(urlWithRaw.toString())).text();
  }

  if (
    response.status === 404 ||
    response.status === 500 /* https://esm.sh/eslint-plugin-json-schema-validator:1 */
  ) {
    const error = new Error(`Cannot find module '${url}'`);
    error.code = 'MODULE_NOT_FOUND';
    throw error;
  }

  if (builtinModuleRequiresRegex.test(moduleSourceRaw)) {
    moduleSource = (
      await esbuild.transform(moduleSourceRaw, {
        format: 'esm',
        treeShaking: true,
      })
    ).code;
  }

  let isParseableJson = false;
  if (urlParsed.pathname.endsWith('.json') && !('module' in urlParsed.searchParams)) {
    try {
      JSON.parse(moduleSource);
      isParseableJson = true;
    } catch {
      // Ignore parsing error
    }
  }
  if (isParseableJson) {
    moduleSource = `export default ${moduleSource}`;
  }

  return {
    format: 'module',
    shortCircuit: true,
    source: moduleSource,
  };
};
