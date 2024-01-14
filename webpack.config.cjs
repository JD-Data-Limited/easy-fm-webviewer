/*
 * Copyright (c) 2023. See LICENSE file for more information
 */

const path = require("path")

module.exports = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        // fallback: {
        //     crypto: require.resolve("crypto-browserify")
        // }
    },
    output: {
        filename: "index.min.js",
        path: path.resolve(__dirname, "dist"),
        library: "EasyFM",
        libraryExport: "default",
        libraryTarget: "umd2"
    },
    mode: "development",
    target: "web",
    externals: {
        "node-fetch": "fetch"
    }
}