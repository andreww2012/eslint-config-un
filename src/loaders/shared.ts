import type Eslint from 'eslint';
import type {UnConfigContext} from '../config-un/shared';
import {OPTIONAL_PEER_DEPENDENCIES} from '../constants';
import type {MaybePromise} from '../types';
import {type MaybeArray, arrayify, interopDefault, isKeyIn} from '../utils';

export type {Processor as EslintProcessor} from '@eslint/core';
export type EslintParser = Eslint.Linter.Parser;

export const MODULE_NOT_FOUND_ERROR_CODES = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'];

export type ModuleLoaderContext = Pick<UnConfigContext, 'rootOptions' | 'missingPackages'>;

export type ModuleLoader<T, N extends string = string, PackageNullable extends boolean = true> = ((
  context: ModuleLoaderContext,
  options?: {
    throwIfNotFound?: boolean;
  },
) => Promise<{
  packageName: N;
  module: T | (PackageNullable extends true ? null : never);
}>) & {
  packageName: N;
};

const MODULE_NOT_FOUND_ERROR_MESSAGE_REGEXP = /^Cannot find module '([^']+)'/;

function createModuleLoader<T, N extends string>(
  property: string,
  packageName: N,
  module: () => MaybePromise<T | {default: T}>,
  ignoredErrors?: MaybeArray<string>,
): ModuleLoader<T, N> {
  const result: ModuleLoader<T, N> = async (context, options) => {
    const isPluginOptionalPeerDependency = packageName in OPTIONAL_PEER_DEPENDENCIES;
    try {
      const {pluginOverrides} = context.rootOptions;
      const providedPlugin =
        pluginOverrides && isKeyIn(property, pluginOverrides)
          ? await interopDefault(pluginOverrides[property] as T)
          : null;
      return {module: providedPlugin || (await interopDefault(module())), packageName};
    } catch (error: unknown) {
      const ignoredErrorsFinal: string[] = [
        ...arrayify(ignoredErrors),
        ...(isPluginOptionalPeerDependency ? MODULE_NOT_FOUND_ERROR_CODES : []),
      ];
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'string' &&
        ignoredErrorsFinal.includes(error.code) &&
        !options?.throwIfNotFound
      ) {
        // `eslint-plugin-vue` might be installed, but `vue-eslint-parser`, which it tried to load, might be not
        if (
          MODULE_NOT_FOUND_ERROR_CODES.includes(error.code) &&
          'message' in error &&
          typeof error.message === 'string'
        ) {
          const missingPackageNameMatch = error.message.match(
            MODULE_NOT_FOUND_ERROR_MESSAGE_REGEXP,
          );
          const missingPackageName = missingPackageNameMatch?.[1];
          if (missingPackageName) {
            context.missingPackages.add(missingPackageName);
          }
        }

        return {module: null, packageName};
      }
      throw error;
    }
  };
  result.packageName = packageName;
  return result;
}

type ResolvesToNull<N extends string, IgnoredErrors> = IgnoredErrors extends undefined
  ? N extends keyof typeof OPTIONAL_PEER_DEPENDENCIES
    ? true
    : false
  : true;

type ModuleLoaderFactory<EraseModuleType extends boolean> = <
  T,
  N extends string,
  IgnoredErrors extends MaybeArray<string> | undefined = undefined,
>(
  property: string,
  packageName: N,
  module: () => MaybePromise<
    | (EraseModuleType extends true ? NoInfer<T> : T)
    | {default: EraseModuleType extends true ? NoInfer<T> : T}
  >,
  ignoreErrors?: IgnoredErrors,
) => ModuleLoader<T, N, ResolvesToNull<N, IgnoredErrors>>;

export const genModuleLoader = createModuleLoader as ModuleLoaderFactory<true>;

export const genInferredModuleLoader = createModuleLoader as ModuleLoaderFactory<false>;
