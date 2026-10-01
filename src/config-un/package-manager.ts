import path from 'node:path';
import * as findUp from 'empathic/find';
import type {DetectResult} from 'package-manager-detector';
import {detect} from 'package-manager-detector/detect';

export const UPM_LOCKFILE_NAME = 'upm.lock';

// `package-manager-detector` does not know upm, which only leaves its lockfile behind
export const detectPackageManager = async (): Promise<
  DetectResult | {name: 'upm'; agent: 'upm'} | null
> => {
  const upmLockfilePath = findUp.file(UPM_LOCKFILE_NAME);
  if (upmLockfilePath == null) {
    return await detect();
  }

  const upmProjectDir = path.dirname(upmLockfilePath);
  // Like with other lockfiles, the closest project wins
  const nestedProjectPackageManager =
    upmProjectDir === process.cwd()
      ? null
      : await detect({stopDir: (directory) => path.dirname(directory) === upmProjectDir});
  return nestedProjectPackageManager || {name: 'upm', agent: 'upm'};
};
