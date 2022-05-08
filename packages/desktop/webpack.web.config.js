const rules = require("./webpack.rules");

const plugins = require("./webpack.plugins");

const path = require("path");

rules.push({
  test: /\.css$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          config: path.join(__dirname, "postcss.config.js"),
        },
      },
    },
  ],
});

module.exports = {
  mode: "development",
  entry: "./src/app.tsx",
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devServer: {
    static: path.join(__dirname, "build"),
    compress: true,
    port: 4000,
  },
};
