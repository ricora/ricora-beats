const path = require("path")
const webpack = require("webpack")
module.exports = {
    entry: {
        bundle: "./src/app.ts",
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.SERVER_URL": JSON.stringify(process.env.SERVER_URL),
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
    },
    module: {
        rules: [{
            test: /\.ts$/,
            loader: "ts-loader",
        }, ],
    },
}