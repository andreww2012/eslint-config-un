// cspell:ignore bivariantly
import type {ConfigKey, UnConfigResults} from '../configs/index.gen';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {LoadablePluginPrefix} from '../loaders';
import type {MaybePromise, NonEmptyTuple} from '../types';
import {allUnionMembers} from '../utils';
import type {ConfigEntryBuilder} from './config-entry-builder';
import type {ExtraPluginsType, UnConfigContext} from './shared';

export type PackageToCheck = `${(typeof PACKAGES_TO_GET_INFO_FOR)[number]}${'' | `@${string}`}`;

type PackageManager = NonNullable<UnConfigContext['meta']['usedPackageManager']>['name'];

/**
 * Describes when a Config is enabled if the user does not say otherwise.
 *
 * `text` replaces the `@default` prose the generator would otherwise derive from the condition,
 * while `textAddendum` only appends to it
 */
export type EnabledBy =
  | boolean
  | ({text?: string; textAddendum?: string} & (
      | {default: boolean}
      | {package: PackageToCheck}
      | {packages: NonEmptyTuple<PackageToCheck>}
      | {packageAbsent: PackageToCheck}
      | {pathExists: string}
      | {packageManager: PackageManager}
      | {configDisabled: ConfigKey}
      | {group: 'misc'}
    ));

/**
 * Position of a Config in the resolved cascade.
 * Configs of the same phase are ordered between themselves by their `after` edges, and
 * alphabetically where those say nothing
 */
export type ConfigPhase = 'first' | 'late' | 'last' | 'extra' | 'terminal';

export type CascadeAnchor = 'globalSetup' | 'rootConfig' | 'userExtraConfigs';

/**
 * Named places in the cascade occupied by entries that are not Configs, and therefore cannot be
 * declared by a manifest: the global `files`/`ignores`/`linterOptions`/`languageOptions` setup, the
 * rule exceptions applied to the well known config files, and the `extraConfigs` root option.
 * Each of them sits on a phase boundary of the cascade layout the artifact generator reads
 */
export const CASCADE_ANCHORS = allUnionMembers<CascadeAnchor>()([
  'globalSetup',
  'rootConfig',
  'userExtraConfigs',
]);

type UnConfigSetupResult<ExtraPlugins extends ExtraPluginsType, ExtraReturnedData> = {
  configs: (ConfigEntryBuilder<ExtraPlugins> | null)[];
  optionsResolved: Record<string, unknown>;
} & ExtraReturnedData;

export interface ConfigManifest<Needs extends readonly ConfigKey[] = []> {
  /**
   * @default true
   */
  enabledBy?: EnabledBy;

  /**
   * Additional runtime conditions the Config cannot be enabled without
   */
  requires?: {
    pluginLoadable: LoadablePluginPrefix;
  };

  /**
   * @default 'default'
   */
  phase?: ConfigPhase;

  /**
   * Configs this one must be placed after in the resolved cascade
   */
  after?: readonly ConfigKey[];

  /**
   * Configs whose results this one reads.
   * They are resolved before it, and their results are passed to `setup`.
   * NOTE: unrelated to `after` - a Config may read the result of another Config it is placed before
   */
  needs?: Needs;

  /**
   * Whether the user may pass an array of options to generate several copies of this Config
   */
  supportsMultipleConfigs?: true;
}

/**
 * Builds the Config, and reports what the Configs reading it need to know
 */
export type UnConfigSetup<
  Options,
  Needs extends readonly ConfigKey[] = [],
  ExtraReturnedData = unknown,
> = <ExtraPlugins extends ExtraPluginsType>(
  context: Readonly<UnConfigContext<ExtraPlugins>>,
  configOptions:
    | boolean
    // eslint-disable-next-line ts/no-restricted-types -- some configs don't have the omitted properties
    | Omit<Options, 'overrides' | 'overridesAny'>
    | undefined,
  resolved: Pick<UnConfigResults, Extract<Needs[number], keyof UnConfigResults>>,
) => MaybePromise<null | UnConfigSetupResult<ExtraPlugins, ExtraReturnedData>>;

/**
 * The shape every Config module default export is narrowed to when the loader table is indexed
 * dynamically.
 * `setup` intentionally uses the method syntax: its parameters must be related bivariantly for the
 * per-Config manifests, each with its own options and results types, to be assignable here
 */
export interface AnyConfigManifest extends ConfigManifest<readonly ConfigKey[]> {
  // eslint-disable-next-line ts/method-signature-style -- see the note above
  setup<ExtraPlugins extends ExtraPluginsType>(
    context: Readonly<UnConfigContext<ExtraPlugins>>,
    configOptions: boolean | object | undefined,
    resolved: UnConfigResults,
  ): MaybePromise<null | UnConfigSetupResult<ExtraPlugins, unknown>>;
}

export interface ConfigModuleLoader extends ConfigManifest<readonly ConfigKey[]> {
  load: () => Promise<{default: AnyConfigManifest}>;
}

export const defineUnConfig =
  <Options, const Needs extends readonly ConfigKey[] = [], ExtraReturnedData = unknown>(
    key: ConfigKey,
    manifest: boolean | ConfigManifest<Needs>,
  ) =>
  (setup: UnConfigSetup<Options, Needs, ExtraReturnedData>) => ({
    ...(typeof manifest === 'boolean' ? {enabledBy: manifest} : manifest),
    setup,
  });
