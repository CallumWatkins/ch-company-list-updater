const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: 'all',
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "@/assets/styles/styles.scss";',
      },
    },
  },
});
