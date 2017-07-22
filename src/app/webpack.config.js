const path = require('path');
const webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = function (env) {

    if (env !== "dev" && env !== "prod")
        throw "Invalid env value";

    const config = {
        context: path.resolve(__dirname, './backend'),
        entry: {
            'app/main': './main',
            'test/test': './test'
        },
        target: 'electron',
        node: {
            __dirname: false
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: './../package.json', to: "app/package.json" }
            ])
        ],
        resolve: {
            extensions: ['.js', '.ts']
        },
        output: {
            path: path.resolve(__dirname, '../../build'),
            filename: '[name].js',
        },
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

    if (env === "dev") {
        config.devtool = 'source-map';
    }
    return config;
};
