const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "build.js",
    publicPath: "/dist/",
    path: path.resolve(__dirname, "./dist")
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ["vue-loader"]
      },
      {
        test: /\.js$/,
        include: "/src",
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: "css-loader",
          fallback: "vue-style-loader"
        })
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new ExtractTextPlugin("style.css")
  ],
  devServer: {
    https: true
  }
};
