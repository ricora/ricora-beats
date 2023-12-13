// @ts-check

const rspack = require("@rspack/core")

const date = new Date()
const buildDate = `${date.getFullYear().toString().padStart(4, "0")}${(date.getMonth() + 1)
  .toString()
  .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date.getHours().toString().padStart(2, "0")}${date
  .getMinutes()
  .toString()
  .padStart(2, "0")}${date.getSeconds().toString().padStart(2, "0")}`

const isProduction = process.env.NODE_ENV === "production"

/** @type {import('@rspack/cli').Configuration} */
const config = {
  entry: "./src/app.ts",
  output: {
    filename: "bundle.js",
    path: "./dist/",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "builtin:swc-loader",
      },
    ],
  },
  devServer: { static: { directory: "./dist/" } },
  plugins: [
    new rspack.DefinePlugin({
      "process.env.SERVER_URL": JSON.stringify(process.env.SERVER_URL),
      "process.env.BUILD_DATE": JSON.stringify(buildDate),
      "process.env.CREDITS": JSON.stringify(process.env.CREDITS),
    }),
    new rspack.ProvidePlugin({
      process: [require.resolve("process/browser")],
    }),
  ],
  devtool: isProduction ? false : "source-map",
}

module.exports = config
