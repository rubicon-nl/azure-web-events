const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        'azure-web-events': './src/index.ts',
        'azure-web-events.min': './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, '_bundles'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'AzureWebEvents',
        umdNamedDefine: true,
    },
    resolve: {
        extensions: [ '.tsx', '.ts','.js'],
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