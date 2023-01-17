const { defineConfig } = require('@vue/cli-service');

process.env.VUE_APP_VERSION = process.env.npm_package_version;

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  devServer: {
    allowedHosts: 'all',
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/styles/variables.scss";
          @import "~bulma/sass/utilities/mixins.sass";
        `,
      },
    },
  },
});
