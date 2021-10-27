# node-rs-loader
This loader replaces `@node-rs/helper` with own implementation to incorporate Rust-based native modules with Webpack.

## Usage
Enabling this loader on packages powered by `@node-rs/helper` will resolve its native modules using `node-rs-loader`.
**It is your resposiblity to handle .node files.** Usually [`node-loader`](https://github.com/webpack-contrib/node-loader) is a good choice.

```js
module.exports = {
  target: "node",
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: ['@node-rs/bcrypt'],
        loader: "@basixjs/node-rs-loader",
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ],
  },
};
```
