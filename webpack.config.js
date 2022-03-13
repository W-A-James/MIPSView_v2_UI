const path = require('path');
const DIST_DIR = path.resolve(__dirname, "../");
const SRC_DIR = path.resolve(__dirname, "src");

module.exports = {
    entry: path.resolve(SRC_DIR, "bootstrap.js"),
    output: {
        path: DIST_DIR,
        filename: "main.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.html$/i,
                loader: "file-loader",
                options: {
                    publicPath: DIST_DIR,
                    name: '[name].[ext]'
                }
            },
            {
                test: /\.(png|jpeg|jpg|gif)$/i,
                type: "javascript/auto"
            },
        ]
    },
    devServer: {
        static: DIST_DIR
    },
    mode: "development",
};
