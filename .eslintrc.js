/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["standard-with-typescript", "prettier"],
  overrides: [],
  parserOptions: {
    sourceType: "module",
  },
  rules: {},
}
