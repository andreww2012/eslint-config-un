// cspell:ignore headful millis
import {styleText} from 'node:util';
import {Solver as CaptchaSolver} from '@2captcha/captcha-solver';
import {NodeFileSystem} from '@effect/platform-node';
import {cli} from 'cleye';
import consola from 'consola';
import {Data, Effect, Ref} from 'effect';
import {isJSON as isValidJsonInternal} from 'es-toolkit';
import puppeteer, {type Browser, type Page} from 'puppeteer';
import checkNpmPackageNameValidity from 'validate-npm-package-name';
import * as z from 'zod';
import {
  type EslintPluginsDb,
  readEslintPluginsDb,
  updateEslintPluginsDb,
} from './plugins/plugins-db';
import {isLikelyEslintPlugin} from './plugins/shared';

const logger = consola.create({});

const argv = cli({
  flags: {
    headful: {
      type: Boolean,
      default: false,
    },
    startPage: {
      type: Number,
      default: 1,
    },
  },
});
const cliFlags = argv.flags;

const {startPage} = cliFlags;

if (!Number.isInteger(startPage) || startPage < 1) {
  logger.fatal('Invalid start page number');
  process.exit(1);
}

const captchaSolverApiKey = process.env['TWO_CAPTCHA_API_KEY'] || '';
if (!captchaSolverApiKey) {
  logger.warn('Captcha solver API key not provided');
}
const captchaSolver = new CaptchaSolver(captchaSolverApiKey);

// eslint-disable-next-line ts/no-unnecessary-type-conversion
const isValidJson = (value: unknown) => Boolean(isValidJsonInternal(value));

const ResponseSchemaZod = z.looseObject({
  packages: z
    .looseObject({
      displayName: z.string(),
      name: z.string(),
    })
    .array(),
});

export class BrowserLaunchError extends Data.TaggedError('BrowserLaunchError')<{
  cause: unknown;
}> {}

export class PageNavigationError extends Data.TaggedError('PageNavigationError')<{
  cause: unknown;
}> {}

export class UnexpectedResponseError extends Data.TaggedError('UnexpectedResponseError')<{
  response: string;
}> {}

export class CaptchaSolveError extends Data.TaggedError('CaptchaSolveError')<{
  cause: unknown;
}> {}

// https://github.com/2captcha/cloudflare-demo/blob/4216e55a325d868b7ef569dccce891ad393474a6/normalize-ua.js
const normalizeUserAgent = Effect.tryPromise({
  try: async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    const userAgent = await browser.userAgent();
    let normalized = userAgent.replace('Headless', '');
    normalized = normalized.replace('Chromium', 'Chrome');
    await browser.close();
    return normalized;
  },
  catch: () =>
    // cspell:disable-next-line
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}).pipe(Effect.catchAll((fallback) => Effect.succeed(fallback)));

const launchBrowser = (userAgent: string) =>
  Effect.tryPromise({
    try: () =>
      puppeteer.launch({
        headless: !cliFlags.headful,
        devtools: true,
        args: [`--user-agent=${userAgent}`],
      }),
    catch: (error) => new BrowserLaunchError({cause: error}),
  });

const setupBrowserPage = (browser: Browser) =>
  Effect.tryPromise({
    try: async () => {
      const browserPage = await browser.newPage();
      // https://github.com/2captcha/cloudflare-demo/blob/4216e55a325d868b7ef569dccce891ad393474a6/inject.js
      await browserPage.evaluateOnNewDocument(
        // cspell:disable-next-line
        'console.clear=()=>console.log("Console was cleared");const i=setInterval(()=>{window.turnstile&&(clearInterval(i),window.turnstile.render=(e,a)=>{let t={sitekey:a.sitekey,pageurl:window.location.href,data:a.cData,pagedata:a.chlPageData,action:a.action,userAgent:navigator.userAgent,json:1};console.log("intercepted-params:"+JSON.stringify(t)),window.cfCallback=a.callback})},50);',
      );
      return browserPage;
    },
    catch: (error) => new BrowserLaunchError({cause: error}),
  });

const solveCaptchaAsync = (browserPage: Page) =>
  Effect.tryPromise({
    try: () =>
      new Promise<true>((resolve, reject) => {
        const solveCaptcha = async (
          params: Parameters<typeof captchaSolver.cloudflareTurnstile>[0],
        ) => {
          try {
            logger.info('Solving the captcha...');
            const res = await captchaSolver.cloudflareTurnstile(params);
            logger.info(`Solved the captcha ${res.id}`);
            await browserPage.evaluate((token) => {
              // @ts-expect-error executed on the actual page
              // eslint-disable-next-line ts/no-unsafe-call
              cfCallback(token);
            }, res.data);
            resolve(true);
          } catch (error) {
            // eslint-disable-next-line ts/prefer-promise-reject-errors
            reject(error);
          }
        };

        browserPage.on('console', (message) => {
          const messageText = message.text();
          if (!messageText.includes('intercepted-params:')) {
            return;
          }

          const params: unknown = JSON.parse(messageText.replace('intercepted-params:', ''));

          // @ts-expect-error assuming params are of right type
          void solveCaptcha(params);
        });
      }),
    catch: (error) => new CaptchaSolveError({cause: error}),
  });

const solveCaptcha = (browserPage: Page, dataRaw: string) => {
  if (isValidJson(dataRaw)) {
    return Effect.void;
  }

  const isCaptcha = dataRaw.includes('window._cf_chl_opt');
  if (!isCaptcha) {
    return Effect.fail(new UnexpectedResponseError({response: dataRaw}));
  }

  logger.info('Attempting to solve the captcha');

  return solveCaptchaAsync(browserPage);
};

const fetchPage = (browserPage: Page, page: number, eslintPluginsDbRef: Ref.Ref<EslintPluginsDb>) =>
  Effect.gen(function* () {
    logger.info(`Fetching page ${styleText('green', page.toString())}`);

    const url = `https://socket.dev/api/ecosystems/search?e=npm&q=eslint-plugin&page=${page}&page_size=100`;

    const response = yield* Effect.tryPromise({
      try: () => browserPage.goto(url),
      catch: (error) => new PageNavigationError({cause: error}),
    });

    if (!response) {
      logger.error('Got null response');
      return false;
    }

    const dataRaw = yield* Effect.promise(() => response.text());

    yield* solveCaptcha(browserPage, dataRaw);

    const data = ResponseSchemaZod.parse(yield* Effect.promise(() => response.json()));

    if (data.packages.length === 0) {
      logger.info('Done!');
      return false;
    }

    const eslintPluginsDb = yield* Ref.get(eslintPluginsDbRef);

    const newEslintPlugins = data.packages
      .map((packageInfo) => {
        const {displayName, name: packageName} = packageInfo;
        if (!checkNpmPackageNameValidity(displayName).validForNewPackages) {
          logger.warn(`Got invalid package name: ${styleText('blueBright', packageName)}`);
          return null;
        }
        if (displayName !== packageName) {
          logger.info(
            `Display name ${styleText('red', displayName)} does not match package name: ${styleText('blueBright', packageName)}`,
          );
        }
        if (!isLikelyEslintPlugin(packageName, eslintPluginsDb)) {
          logger.verbose(`Likely not an ESLint plugin: ${styleText('blueBright', packageName)}`);
          return null;
        }
        return packageName;
      })
      .filter((v) => v != null);

    yield* Ref.update(eslintPluginsDbRef, (db) => {
      const updatedDb = {...db};
      for (const pluginName of newEslintPlugins) {
        if (!(pluginName in updatedDb)) {
          updatedDb[pluginName] = null;
        }
      }
      return updatedDb;
    });

    const updatedDb = yield* Ref.get(eslintPluginsDbRef);
    yield* updateEslintPluginsDb(updatedDb);

    yield* Effect.sleep('1500 millis');

    return true;
  });

const fetchAllPages = (browserPage: Page, eslintPluginsDbRef: Ref.Ref<EslintPluginsDb>) =>
  Effect.iterate(startPage, {
    while: (page) => page > 0,
    body: (page) =>
      fetchPage(browserPage, page, eslintPluginsDbRef).pipe(
        Effect.map((shouldContinue) => (shouldContinue ? page + 1 : -1)),
      ),
  });

const mainProgram = Effect.gen(function* () {
  const userAgent = yield* normalizeUserAgent;
  const browser = yield* launchBrowser(userAgent);
  const browserPage = yield* setupBrowserPage(browser);

  const eslintPluginsDb = yield* readEslintPluginsDb;
  const eslintPluginsDbRef = yield* Ref.make(eslintPluginsDb);

  yield* Effect.acquireUseRelease(
    Effect.succeed(browser),
    () => fetchAllPages(browserPage, eslintPluginsDbRef),
    (b) => Effect.promise(() => b.close()),
  );
});

const program = mainProgram.pipe(
  Effect.provide(NodeFileSystem.layer),
  Effect.catchAll((error) => {
    if (error instanceof UnexpectedResponseError) {
      logger.fatal('Got unexpected response', error.response);
    } else if (error instanceof CaptchaSolveError) {
      logger.error('Error solving captcha:', error.cause);
    } else {
      logger.error('Error:', error);
    }
    return Effect.void;
  }),
);

await Effect.runPromise(program);
