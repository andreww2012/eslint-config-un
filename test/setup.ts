import {testEslintConfig as testEslintConfigImpl} from './helpers/test-eslint-config';

/* eslint-disable vars-on-top */
declare global {
  var testEslintConfig: typeof testEslintConfigImpl;
}
/* eslint-enable vars-on-top */

globalThis.testEslintConfig = testEslintConfigImpl;
