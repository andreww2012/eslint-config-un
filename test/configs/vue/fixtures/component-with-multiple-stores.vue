<script setup>
import {defineStore} from 'pinia';

const useCountStore = defineStore('count', () => ({count: 0}));
const useNameStore = defineStore('name', () => ({name: ''}));
</script>
