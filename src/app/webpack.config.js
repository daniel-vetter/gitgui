const path = require('path');
const webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, './backend'),
    entry: {
        main: './main',
        maintest: './main-test'
    },
    target: 'electron',
    node: {
        __dirname: false
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './../package.json' }
        ])
    ],
    resolve: {
        extensions: ['.js', '.ts']
    },
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
                loaders: ['ts-loader?' + JSON.stringify({
                    configFileName: 'tsconfig.app.json'
                })]
            }
        ]
    }
};
