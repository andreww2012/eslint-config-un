import {format} from 'oxfmt';
import oxfmtConfig from '../../oxfmt.config';

// Parse failures are reported in `errors` and the input is returned untouched, never thrown
export const formatTypescript = async (code: string) => {
  const {code: formattedCode, errors} = await format('generated.ts', code, oxfmtConfig);

  if (errors.length > 0) {
    throw new Error(
      `Failed to format generated TypeScript code:\n${errors
        .map(({codeframe, message}) => codeframe || message)
        .join('\n')}`,
    );
  }

  return formattedCode;
};
