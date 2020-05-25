const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        'azure-web-event': './src/index.ts',
        'azure-web-event.min': './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, '_bundles'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'AzureWebEvent',
        umdNamedDefine: true,
    },
    resolve: {
        extensions: ['.ts','.js'],
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
            exclude: /node_modules/,
            query: {
                declaration: false,
            }
        }]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
             sourceMap: true,
             include: /\.min\.js$/,   
            }),
        ]
    },

};