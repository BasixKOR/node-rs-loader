import type { RawLoaderDefinition } from "webpack";
import { platform, arch } from "os";
import { platformArchTriples } from "@napi-rs/triples";

namespace NodeRsLoader {
  export interface Options {
    triples?: string[];
  }
}

const NodeRsLoader: RawLoaderDefinition<NodeRsLoader.Options> = async function (
  this,
  source
) {
  const {
    triples = platformArchTriples[platform()][arch()].map(
      (t) => t.platformArchABI
    ),
  } = this.getOptions({
    type: "object",
    properties: {
      userId: {
        type: "array",
        required: false,
        items: {
          type: "string",
        },
      },
    },
  });

  // Resolves native modules from triples.
  const moduleName = this.resourcePath;
  const resolve = this.getResolve({ extensions: [".node"] });
  const promises = await Promise.allSettled(
    triples.map((triple) =>
      resolve(this.context, `${this.resourcePath}-${triple}`).then(() => triple)
    )
  );
  const paths = promises.flatMap((p) =>
    p.status === "fulfilled" ? p.value : []
  );

  const modules = paths
    .map(
      (triple) =>
        `"${triple}":require('${this.utils.contextify(
          this.context,
          `${moduleName}-${triple}`
        )}')`
    )
    .join(",");

  return `
          const m = {${modules}};
          const os = require('os');
          const {platformArchTriples} = require('@napi-rs/triples');
          const a = platformArchTriples[os.platform()][os.arch()];
          module.exports = a.filter(t=>t.platformArchABI in m).map(t=>m[t.platformArchABI])[0];
  `;
};

NodeRsLoader.raw = true;

export default NodeRsLoader;
