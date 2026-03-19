import {createRoute} from '@tanstack/react-router';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const route = createRoute({
  loader: () => ({data: 'foo'}),
  beforeLoad: () => {},
});
