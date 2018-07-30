"use strict";

var path = require("path");

var UglifyJsPlugin = require("uglifyjs-webpack-plugin");

var webpack = require("webpack");

var buildTarget = process.env.NODE_ENV;
module.exports = {
  entry: "./index.js",
  output: {
    filename: "react-qae.js",
    path: path.resolve("dist") //libraryTarget: "commonjs2"

  },
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      } // {
      //   include: path.resolve("node_modules", "rxq"),
      //   sideEffects: false
      // }

    }]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  mode: "production",
  plugins: [// new UglifyJsPlugin({
    //   sourceMap: true
    // })
    // new webpack.DefinePlugin({
    //   "process.env.NODE_ENV": JSON.stringify("production")
    // })
  ]
};
/*
{
  "env": {
    "esm": {
      "presets": ["@babel/react", "@babel/typescript", ["@babel/env", { "modules": false }]],
      "plugins": ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-proposal-class-properties"]
    },
    "cjs": {
      "presets": ["@babel/react", "@babel/typescript", ["@babel/env", { "modules": "commonjs" }]],
      "plugins": ["@babel/plugin-transform-modules-commonjs"]
    }
  }
}

*/