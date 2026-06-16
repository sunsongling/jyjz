const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './')
      }
    }
  },
  chainWebpack(config) {
    config.module
      .rule('uni-template-export-compat')
      .resourceQuery(/vue&type=template/)
      .enforce('post')
      .use('uni-template-export-compat')
      .loader(path.resolve(__dirname, 'build/uni-template-export-compat-loader.js'))
  }
}
