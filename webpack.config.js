const path = require('path');
const CleanWebpackPlugin = require('webpack-clean');

module.exports = {
    entry: {
        'azure-web-events': './src/index.ts',
        'azure-web-events.min': './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'AzureWebEvents',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true,
    },
    resolve: {
        extensions: [ '.ts','.js'],
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/,
                query: {
                  declaration: false,
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};