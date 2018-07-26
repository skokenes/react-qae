"use strict";

var path = require("path");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");
var webpack = require("webpack");

module.exports = {
  entry: "./index.js",
  output: {
    filename: "react-qae.js",
    path: path.resolve("dist"),
    libraryTarget: "commonjs2"
  },
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      }
      // {
      //   include: path.resolve("node_modules", "rxq"),
      //   sideEffects: false
      // }
    }]
  },
  mode: "production",
  plugins: [new UglifyJsPlugin({
    sourceMap: true
  }), new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("production")
  })]
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin({
  //       sourceMap: true
  //     })
  //   ]
  // }
};