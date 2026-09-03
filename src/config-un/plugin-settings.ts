import type {BetterTailwindPluginSettings} from '../configs/better-tailwind';
import type {BoundariesPluginSettings} from '../configs/boundaries';
import type {ClsxPluginSettings} from '../configs/clsx';
import type {CompatPluginSettings} from '../configs/compat';
import type {CssInJsPluginSettings} from '../configs/css-in-js';
import type {EsPluginSettings} from '../configs/es';
import type {EslintPluginPluginSettings} from '../configs/eslint-plugin';
import type {FileProgressPluginSettings} from '../configs/file-progress';
import type {FormatjsPluginSettings} from '../configs/formatjs';
import type {FunctionalPluginSettings} from '../configs/functional';
import type {HtmlPluginSettings} from '../configs/html';
import type {ImportPluginSettings} from '../configs/import';
import type {ImportIntegrityPluginSettings} from '../configs/import-integrity';
import type {JestPluginSettings} from '../configs/jest';
import type {HtmlProcessorPluginSettings} from '../configs/js-inline';
import type {JsdocPluginSettings} from '../configs/jsdoc';
import type {JsonSchemaValidatorPluginSettings} from '../configs/json-schema-validator';
import type {JsxA11yPluginSettings} from '../configs/jsx-a11y';
import type {LitA11yPluginSettings, LitPluginSettings} from '../configs/lit';
import type {MathPluginSettings} from '../configs/math';
import type {MdxPluginSettings} from '../configs/mdx';
import type {MochaPluginSettings} from '../configs/mocha';
import type {NextJsPluginSettings} from '../configs/nextjs';
import type {NodePluginSettings} from '../configs/node';
import type {PackageJsonPluginSettings} from '../configs/package-json';
import type {PerfectionistPluginSettings} from '../configs/perfectionist';
import type {PlaywrightPluginSettings} from '../configs/playwright';
import type {PnpmPluginSettings} from '../configs/pnpm';
import type {
  ReactHooksPluginSettings,
  ReactPluginSettings,
  ReactXPluginSettings,
} from '../configs/react';
import type {RegexpPluginSettings} from '../configs/regexp';
import type {RemedaPluginSettings} from '../configs/remeda';
import type {SolidPluginSettings} from '../configs/solid';
import type {SonarPluginSettings} from '../configs/sonar';
import type {SqlPluginSettings} from '../configs/sql';
import type {SveltePluginSettings} from '../configs/svelte';
import type {TailwindPluginSettings} from '../configs/tailwind';
import type {TestingLibraryPluginSettings} from '../configs/testing-library';
import type {UnocssPluginSettings} from '../configs/unocss';
import type {VitestPluginSettings} from '../configs/vitest';
import type {VueI18nPluginSettings} from '../configs/vue';
import type {WebComponentsPluginSettings} from '../configs/web-components';
import type {YamlPluginSettings} from '../configs/yaml';

/**
 * The [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * every plugin that has any accepts, keyed by the canonical plugin prefix.
 *
 * The keys must be the known plugin prefixes
 */
export interface PluginSettingsMap {
  'better-tailwindcss': BetterTailwindPluginSettings;
  boundaries: BoundariesPluginSettings;
  clsx: ClsxPluginSettings;
  compat: CompatPluginSettings;
  'css-in-js': CssInJsPluginSettings;
  es: EsPluginSettings;
  'eslint-plugin': EslintPluginPluginSettings;
  'eslint-react': ReactXPluginSettings;
  'file-progress': FileProgressPluginSettings;
  formatjs: FormatjsPluginSettings;
  functional: FunctionalPluginSettings;
  html: HtmlPluginSettings;
  'html-processor': HtmlProcessorPluginSettings;
  import: ImportPluginSettings;
  'import-integrity': ImportIntegrityPluginSettings;
  jest: JestPluginSettings;
  jsdoc: JsdocPluginSettings;
  'json-schema-validator': JsonSchemaValidatorPluginSettings;
  'jsx-a11y': JsxA11yPluginSettings;
  lit: LitPluginSettings;
  'lit-a11y': LitA11yPluginSettings;
  math: MathPluginSettings;
  mdx: MdxPluginSettings;
  mocha: MochaPluginSettings;
  nextjs: NextJsPluginSettings;
  node: NodePluginSettings;
  'package-json': PackageJsonPluginSettings;
  perfectionist: PerfectionistPluginSettings;
  playwright: PlaywrightPluginSettings;
  pnpm: PnpmPluginSettings;
  react: ReactPluginSettings;
  'react-hooks': ReactHooksPluginSettings;
  regexp: RegexpPluginSettings;
  remeda: RemedaPluginSettings;
  solid: SolidPluginSettings;
  sonarjs: SonarPluginSettings;
  sql: SqlPluginSettings;
  svelte: SveltePluginSettings;
  tailwindcss: TailwindPluginSettings;
  'testing-library': TestingLibraryPluginSettings;
  unocss: UnocssPluginSettings;
  vitest: VitestPluginSettings;
  'vue-i18n': VueI18nPluginSettings;
  wc: WebComponentsPluginSettings;
  yaml: YamlPluginSettings;
}
