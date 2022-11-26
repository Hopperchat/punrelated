const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const entries = {
  "chat": "./src/js/chat.js",
  "index": "./src/js/index.js",
  "complete-profile": "./src/js/complete-profile.js",
  "signup" : "./src/js/signup.js",
  "profile" : "./src/js/profile.js",
  "login": "./src/js/login.js",
  "users": "./src/js/users.js"
};

const plugins = [];

Object.keys(entries).forEach((entry) => {
  const plugin = new HtmlWebpackPlugin({
    template: "./src/html/" + entry + ".html",
    filename: entry + ".html",
    chunks: [entry],
    scriptLoading: "module",
    cache: true
  });
  plugins.push(plugin);
});

module.exports = {
  entry: entries,
  plugins: [
    ...plugins,
    new WebpackManifestPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/js/utils.js",
          to: ""
        },
        {
          from: "src/favicons",
          to: ""
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
    ],
  },
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: true
  }
};