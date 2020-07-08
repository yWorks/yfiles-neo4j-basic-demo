'use strict';
const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const YFilesOptimizerPlugin = require('@yworks/optimizer/webpack-plugin');

const config = {

  entry: {
    app: ['regenerator-runtime/runtime', path.resolve('app/scripts/app.js')]
  },

  output: {
    path: path.resolve(__dirname, 'app/dist/'),
    publicPath: 'dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|lib)/,
        loader: 'babel-loader',
        options: {
          compact: true,
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        lib: {
          test: /([\\/]lib)|([\\/]node_modules[\\/])/,
          name: 'lib',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  performance: {
    // don't complain about large chunks/assets
    hints: false
  }
};

module.exports = function (env, options) {

  console.log("Running webpack...");

  if (options.mode === 'development') {
    config.devServer = {
      contentBase: [path.join(__dirname, './app')],
      compress: true,
      port: 9003
    }
    // don't add the default SourceMapDevToolPlugin config
    config.devtool = false
    config.plugins.push(
        new webpack.SourceMapDevToolPlugin({
          filename: '[file].map',
          // add source maps for non-library code to enable convenient debugging
          exclude: ['lib.js']
        })
    )
  }

  if(options.mode === 'production') {
    // Add the core-js polyfill for production
    config.entry.app.unshift('core-js/stable')

    // Run the yWorks Optimizer
    config.plugins.unshift(
        new YFilesOptimizerPlugin({
          logLevel: 'info'
        })
    )
  }

  return config
};
