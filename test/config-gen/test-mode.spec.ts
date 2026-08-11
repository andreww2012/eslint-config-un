import {eslintConfigInternal} from '../../src/config-un/config';

describe('internal option: `testMode`', () => {
  it('returns the resolved configs along with the collected errors', async () => {
    const {configs, errors} = await eslintConfigInternal(
      {defaultConfigsStatus: 'all-disabled', cacheConfigs: false},
      {testMode: true},
    );

    expect(configs.length).toBeGreaterThan(0);
    expect(errors).toBeInstanceOf(Array);
  });
});
