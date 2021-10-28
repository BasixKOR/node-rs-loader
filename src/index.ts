import type { LoaderDefinition } from "webpack";
import { platform, arch } from "os";
import { platformArchTriples } from "@napi-rs/triples";

namespace NodeRsLoader {
  export interface Options {
    triples?: string[];
  }
}

const loadBindingsRegex = /loadBinding\(\s*__dirname,\s*['"][^'"]+['"],\s*['"]([^'"]+)/m;

const NodeRsLoader: LoaderDefinition<NodeRsLoader.Options> = async function (
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
      triples: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  });

  // Get name of native modules.
  const moduleName = loadBindingsRegex.exec(source)?.[1];
  if(!moduleName) throw new Error("Could not find module name");

  // Resolves native modules from triples.
  const resolve = this.getResolve({ extensions: [".node"] });
  const promises = await Promise.allSettled(
    triples.map((triple) =>
      resolve(this.context, `${moduleName}-${triple}`).then(() => triple)
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

export default NodeRsLoader;
