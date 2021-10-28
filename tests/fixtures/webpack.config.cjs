const path = require('path');

module.exports = {
  mode: "development",
  devtool: false,
  context: path.resolve(__dirname, "../fixtures"),
  target: "node",
  node: {
    __dirname: false,
  },
  output: {
    path: path.resolve(__dirname, "../outputs"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
    library: "remarkLoaderExport",
  },
  module: {
    rules: [
      {
        test: [require.resolve("@node-rs/xxhash")],
        loader: require.resolve("../../."),
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ],
  },
};
