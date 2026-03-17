// eslint-disable-next-line node/no-unsupported-features/node-builtins -- stable enough for test infrastructure
import {register} from 'node:module';

register(new URL('./hooks.js', import.meta.url));
