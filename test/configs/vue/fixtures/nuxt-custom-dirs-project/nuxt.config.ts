export default defineNuxtConfig({
  dir: {
    layouts: 'page-layouts',
    middleware: 'route-middleware',
    modules: 'local-modules',
    pages: 'views',
    plugins: 'nuxt-plugins',
  },
  components: ['~/widgets', {path: '~~/ui', prefix: 'Ui'}],
});
