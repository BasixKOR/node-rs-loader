import type { LoaderDefinition } from "webpack";
import { platform, arch } from "os";
import { platformArchTriples } from "@napi-rs/triples";
import { generateDumbImplementation, generateDetectorImplementation } from "./generateImplementation"

namespace NodeRsLoader {
  export interface Options {
    triples?: string[];
    detect?: boolean;
  }
}

const loadBindingsRegex = /loadBinding\(\s*__dirname,\s*['"][^'"]+['"],\s*['"]([^'"]+)['"]\)/m;

const NodeRsLoader: LoaderDefinition<NodeRsLoader.Options> = async function (
  this,
  source
) {
  const {
    triples = platformArchTriples[platform()][arch()].map(
      (t) => t.platformArchABI
    ),
    detect = true
  } = this.getOptions({
    type: "object",
    properties: {
      triples: {
        type: "array",
        items: {
          type: "string",
        },
      },
      detect: {
        type: "boolean",
        default: true,
      }
    },
  });

  // Get name of native modules.
  const loadBindingsCall = loadBindingsRegex.exec(source);
  const moduleName = loadBindingsCall?.[1];
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

  const generateImplementation = detect ? generateDetectorImplementation : generateDumbImplementation;
  return source.replace(loadBindingsCall[0], generateImplementation(this, paths, moduleName));
};

export default NodeRsLoader;
