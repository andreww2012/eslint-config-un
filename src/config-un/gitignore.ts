import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import {describeError, interopDefault, sha256} from '../utils';

export interface ResolvedGitignore {
  /** Absent if the patterns could not be generated at all */
  ignores?: string[];

  error?: string;
  cacheKey: string;
}

export const resolveGitignore = async (
  gitignoreOption: boolean | FlatGitignoreOptions | undefined,
): Promise<ResolvedGitignore | null> => {
  if (gitignoreOption === false) {
    return null;
  }

  const options = typeof gitignoreOption === 'object' ? gitignoreOption : undefined;

  try {
    const {ignores} = (await interopDefault(import('eslint-config-flat-gitignore')))({
      recursive: true,
      // `strict`, defaulting to `true`, decides if the package should throw if the `.gitignore`
      // file could not be found at cwd. However, there are other sources of ignored patterns, such
      // as `.gitmodules` or `.git/info/exclude`. Unfortunately, it still does not begin to read
      // the exclude file if `.gitignore` is missing, but it does at least read the `.gitmodules`,
      // which it wouldn't if the `strict` was not set to `false`
      // TODO should report that?
      strict: false,
      ...options,
    });
    return ignores.length > 0 ? {ignores, cacheKey: sha256(JSON.stringify(ignores))} : null;
  } catch (error) {
    const errorMessage = describeError(error);
    return {error: errorMessage, cacheKey: sha256(errorMessage)};
  }
};
