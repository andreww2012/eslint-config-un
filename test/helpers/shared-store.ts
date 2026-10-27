import os from 'node:os';
import path from 'node:path';

// Nothing is linked next to it, so whatever the code finds from its real location is not its own
export const SHARED_STORE_PACKAGE_JSON_PATH = path.join(
  os.tmpdir(),
  'shared-store',
  'eslint-config-un@1.0.0',
  'node_modules',
  'eslint-config-un',
  'package.json',
);
