'use strict';
var path = require("path");
var webpack = require('webpack')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')


var baseConfig = {
  output: {
    path: path.resolve(__dirname, 'app/dist/'),
    publicPath: 'dist',
    filename: '[name].js'
  },
  
  optimization: {
    splitChunks: {
      cacheGroups: {
        lib: {
          test: /([\\/]lib[\\/]yfiles)|([\\/]node_modules[\\/])/,
          name: 'lib',
          chunks: 'all'
        }
      }
    }
  }
}

module.exports = function (env, options) {

  console.log("Running webpack...")

  if (options.mode === 'development') {
    return Object.assign({
      mode: 'development',
      entry: {
        app: path.resolve('app/scripts/app.js')
      },
      resolve: {
        modules: ['node_modules', path.resolve('app/lib/')],
      },
      devServer: {
        contentBase: [path.join(__dirname, './app')],
        compress: true,
        port: 9003
      },
      plugins: [
        new webpack.SourceMapDevToolPlugin({
          filename: '[file].map',
          // add source maps for non-library code to enable convenient debugging
          exclude: ['lib.js']
        })
      ]
    }, baseConfig);
  } else {
    return Object.assign({
      mode: 'production',
      entry: {
        app: path.resolve('build/obf/scripts/app.js')
      },
      resolve: {
        modules: ['node_modules', path.resolve('build/obf/lib/')],
      },
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            beautify: false,
            compress: {
              dead_code: false,
              conditionals: false
            }
          }
        })
      ]
    }, baseConfig);
  }
}
