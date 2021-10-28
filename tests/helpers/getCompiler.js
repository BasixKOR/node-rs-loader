import { createRequire } from 'module';

import webpack from "webpack";
import { createFsFromVolume, Volume } from "memfs";

import defaultConfig from "../fixtures/webpack.config.cjs";

const require = createRequire(import.meta.url);

export default (fixture, loaderOptions = {}, config = {}) => {
  const fullConfig = {
    ...defaultConfig,
    entry: require.resolve('../fixtures/' + fixture),
    ...config,
  };

  fullConfig.module.rules[0].options = loaderOptions;

  const compiler = webpack(fullConfig);

  if (!config.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
};
