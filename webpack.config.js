const path = require("path")
const webpack = require("webpack")

const date = new Date()
const buildDate = `${date.getFullYear().toString().padStart(4, "0")}${(
  date.getMonth() + 1
)
  .toString()
  .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date
  .getHours()
  .toString()
  .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
  .getSeconds()
  .toString()
  .padStart(2, "0")}`

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
            "process.env.BUILD_DATE": JSON.stringify(buildDate),
            "process.env.CREDITS": JSON.stringify(process.env.CREDITS),
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