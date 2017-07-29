/* global __dirname:true */
const { CheckerPlugin } = require("awesome-typescript-loader");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  context: `${__dirname}/src`,

  entry: {
    panel: "./panel",
    options: "./options",
  },

  output: {
    filename: "[name]/index.js",
    path: `${__dirname}/dist`,
    publicPath: "/",
  },

  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },
      {
        test: /\.svg$/,
        loader: "file-loader",
        options: {
          name: "[path][hash].[ext]"
        }
      }
    ]
  },

  plugins: [
    new CheckerPlugin(),
    new CopyPlugin([
      { from: "manifest.json" },
      { from: "_locales", to: "_locales" },
      { from: "**/*.html" },
    ])
  ]
};
