import type {ReadGitignoreOptions} from 'gitignore-reader-x';
import {getErrorMessage, sha256} from '../utils';

export interface ResolvedGitignore {
  /** Absent if the patterns could not be generated at all */
  ignores?: string[];

  error?: string;
  cacheKey: string;
}

export const resolveGitignore = async (
  gitignoreOption: boolean | ReadGitignoreOptions | undefined,
): Promise<ResolvedGitignore | null> => {
  if (gitignoreOption === false) {
    return null;
  }

  const options = typeof gitignoreOption === 'object' ? gitignoreOption : undefined;

  try {
    const {readGitignore} = await import('gitignore-reader-x');
    const ignores = (await readGitignore(options)).toEslintIgnores();
    return ignores.length > 0 ? {ignores, cacheKey: sha256(JSON.stringify(ignores))} : null;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {error: errorMessage, cacheKey: sha256(errorMessage)};
  }
};
