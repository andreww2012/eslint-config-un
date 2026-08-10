import {eslintConfig} from '../src';

describe('eslintConfig', () => {
  it('generates a config when called without arguments', async () => {
    const config = await eslintConfig();

    expect(config.length).toBeGreaterThan(0);
  });
});
