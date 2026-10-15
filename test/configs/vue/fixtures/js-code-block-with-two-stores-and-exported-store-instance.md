# Stores

```js
import {defineStore} from 'pinia';

export const useCounterStore = defineStore('counter', {state: () => ({count: 0})});
export const useUserStore = defineStore('user', {state: () => ({name: ''})});

export const counterStore = useCounterStore();
```
