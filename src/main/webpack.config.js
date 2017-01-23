const path = require('path');
const webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    main: './main.ts',
  },
  target: 'electron',
  node: {
    __dirname: false
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: '../package.json' }
    ])
  ],
  output: {
    path: path.resolve(__dirname, '../../build/app'),
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loaders: ['ts-loader']
      }
    ]
  }
};