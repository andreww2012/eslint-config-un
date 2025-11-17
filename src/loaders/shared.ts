import type Eslint from 'eslint';
import type {UnConfigContext} from '../config-un/shared';
import {OPTIONAL_PEER_DEPENDENCIES} from '../constants';
import type {Promisable} from '../types';
import {type MaybeArray, arraify, interopDefault, isIn} from '../utils';

export type {Processor as EslintProcessor} from '@eslint/core';
export type EslintParser = Eslint.Linter.Parser;

export const MODULE_NOT_FOUND_ERROR_CODES = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'];

export type ModuleLoader<
  T,
  Property extends string = string,
  N extends string = string,
  PackageNullable extends boolean = true,
> = Record<
  Property,
  (
    context: UnConfigContext,
    options?: {
      throwIfNotFound?: boolean;
    },
  ) => Promise<{
    packageName: N;
    module: T | (PackageNullable extends true ? null : never);
  }>
>;

const MODULE_NOT_FOUND_ERROR_MESSAGE_REGEXP = /^Cannot find module '([^']+)'/;

export function genModuleLoader<T, Property extends string, N extends string>(
  property: Property,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors?: undefined,
): ModuleLoader<T, Property, N, N extends keyof typeof OPTIONAL_PEER_DEPENDENCIES ? true : false>;
export function genModuleLoader<T, Property extends string, N extends string>(
  property: Property,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors: MaybeArray<string>,
): ModuleLoader<T, Property, N>;
export function genModuleLoader<T, Property extends string, N extends string>(
  property: Property,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoredErrors?: MaybeArray<string>,
): ModuleLoader<T, Property, N> {
  const loader: ModuleLoader<T, Property, N>[Property] = async (context, options) => {
    const isPluginOptionalPeerDependency = packageName in OPTIONAL_PEER_DEPENDENCIES;
    try {
      const {pluginsOverrides} = context.rootOptions;
      const providedPlugin =
        pluginsOverrides && isIn(property, pluginsOverrides)
          ? (pluginsOverrides[property] as T)
          : null;
      return {module: providedPlugin || (await interopDefault(module())), packageName};
    } catch (error: unknown) {
      const ignoredErrorsFinal: string[] = [
        ...arraify(ignoredErrors),
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
  return {
    [property]: loader,
  } as ModuleLoader<T, Property, N>;
}
