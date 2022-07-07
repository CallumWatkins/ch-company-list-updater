const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  chainWebpack(config) {
    config.optimization.minimizer('terser').tap((args) => {
      const terserOptions = args[0].terserOptions;
      terserOptions.mangle = {
        ...terserOptions.mangle,
        properties: true,
      };
      return args;
    });
  },
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
