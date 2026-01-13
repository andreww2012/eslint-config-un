// eslint-disable-next-line node/no-unsupported-features/node-builtins
import {register as registerModule} from 'node:module';

registerModule('./https-module-resolver.js', import.meta.url);
