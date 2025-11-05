import {styleText} from '../utils';

const generateStyleFn = (color: Parameters<typeof styleText>[0]) => (string: string) =>
  styleText(color, string);

export const styleConfigName = generateStyleFn('yellow');
export const stylePackageName = generateStyleFn('yellow');
export const stylePluginPrefix = generateStyleFn('blue');
export const styleRuleName = generateStyleFn('green');
