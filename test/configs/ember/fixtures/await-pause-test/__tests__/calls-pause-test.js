import {pauseTest} from '@ember/test-helpers';

test('should not pause', async function () {
  await pauseTest();
});
