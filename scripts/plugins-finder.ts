// cspell:ignore headful
import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {Solver as CaptchaSolver} from '@2captcha/captcha-solver';
import {sleep} from '@antfu/utils';
import {cli} from 'cleye';
import consola from 'consola';
import {isJSON as isValidJsonInternal} from 'es-toolkit';
import puppeteer from 'puppeteer';
import checkNpmPackageNameValidity from 'validate-npm-package-name';
import * as z from 'zod';

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

// https://github.com/2captcha/cloudflare-demo/blob/4216e55a325d868b7ef569dccce891ad393474a6/normalize-ua.js
const normalizeUserAgent = () =>
  // eslint-disable-next-line ts/no-misused-promises, no-async-promise-executor
  new Promise<string>(async (resolve) => {
    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
      });
      const userAgent = await browser.userAgent();
      let normalized = userAgent.replace('Headless', '');
      normalized = normalized.replace('Chromium', 'Chrome');
      await browser.close();
      resolve(normalized);
    } catch {
      resolve(
        // cspell:disable-next-line
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      );
    }
  });

const browser = await puppeteer.launch({
  headless: !cliFlags.headful,
  devtools: true,
  args: [`--user-agent=${await normalizeUserAgent()}`],
});
const browserPage = await browser.newPage();
// https://github.com/2captcha/cloudflare-demo/blob/4216e55a325d868b7ef569dccce891ad393474a6/inject.js
await browserPage.evaluateOnNewDocument(
  // cspell:disable-next-line
  'console.clear=()=>console.log("Console was cleared");const i=setInterval(()=>{window.turnstile&&(clearInterval(i),window.turnstile.render=(e,a)=>{let t={sitekey:a.sitekey,pageurl:window.location.href,data:a.cData,pagedata:a.chlPageData,action:a.action,userAgent:navigator.userAgent,json:1};console.log("intercepted-params:"+JSON.stringify(t)),window.cfCallback=a.callback})},50);',
);

const knownEslintPluginsPath = path.join(import.meta.dirname, '../data/known-eslint-plugins.json');
const allEslintPlugins = JSON.parse(await fs.readFile(knownEslintPluginsPath, 'utf8')) as string[];

for (let page = startPage; ; page++) {
  logger.info(`Fetching page ${styleText('green', page.toString())}`);

  const url = `https://socket.dev/api/ecosystems/search?e=npm&q=eslint-plugin&page=${page}&page_size=100`;
  const response = await browserPage.goto(url);

  if (!response) {
    logger.error('Got null response');
    break;
  }

  const dataRaw = await response.text();

  let captchaResolvedCallback!: () => void;
  const captchaSolvingPromise = new Promise((resolve) => {
    captchaResolvedCallback = resolve as () => void;
  });

  if (isValidJson(dataRaw)) {
    captchaResolvedCallback();
  } else {
    const isCaptcha = dataRaw.includes('window._cf_chl_opt');
    if (!isCaptcha) {
      logger.fatal('Got unexpected response', dataRaw);
      process.exit(1);
    }

    logger.info('Attempting to solve the captcha');

    // eslint-disable-next-line ts/no-misused-promises
    browserPage.on('console', async (message) => {
      const messageText = message.text();
      if (!messageText.includes('intercepted-params:')) {
        return;
      }

      // eslint-disable-next-line ts/no-unsafe-assignment
      const params = JSON.parse(messageText.replace('intercepted-params:', ''));

      try {
        logger.info('Solving the captcha...');
        // eslint-disable-next-line ts/no-unsafe-argument
        const res = await captchaSolver.cloudflareTurnstile(params);
        logger.info(`Solved the captcha ${res.id}`);
        await browserPage.evaluate((token) => {
          // @ts-expect-error executed on the actual page
          // eslint-disable-next-line ts/no-unsafe-call
          cfCallback(token);
        }, res.data);
        captchaResolvedCallback();
      } catch (error) {
        logger.error('Error solving captcha:', error);
        process.exit();
      }
    });
  }

  await captchaSolvingPromise;

  const data = ResponseSchemaZod.parse(await response.json());

  if (data.packages.length === 0) {
    logger.info('Done!');
    process.exit(0);
  }

  const newEslintPlugin = data.packages
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
      if (!packageName.includes('eslint-plugin') || packageName.startsWith('@types/')) {
        logger.verbose(`Likely not an ESLint plugin: ${styleText('blueBright', packageName)}`);
        return null;
      }
      return packageName;
    })
    .filter((v) => v != null);

  newEslintPlugin.forEach((pluginName) => {
    if (!allEslintPlugins.includes(pluginName)) {
      allEslintPlugins.push(pluginName);
    }
  });
  allEslintPlugins.sort();

  await fs.writeFile(knownEslintPluginsPath, JSON.stringify(allEslintPlugins, null, 2), 'utf8');

  await sleep(1500);
}

await browser.close();
