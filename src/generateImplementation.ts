import { LoaderContext } from "webpack";

export function generateDetectorImplementation(
  ctx: LoaderContext<any>,
  paths: string[],
  moduleName: string
): string {
  const modules = paths
    .map(
      (triple) =>
        `"${triple}":require.resolve('${ctx.utils.contextify(
          ctx.context,
          `${moduleName}-${triple}`
        )}')`
    )
    .join(",");

	return `(function(){
    const m = {${modules}};
    const os = require('os');
    const {platformArchTriples} = require('@napi-rs/triples');
    const a = platformArchTriples[os.platform()][os.arch()];
    return __webpack_require__(a.filter(t=>t.platformArchABI in m).map(t=>m[t.platformArchABI])[0]);
  })()`;
}

export function generateDumbImplementation(
	_: LoaderContext<any>,
	paths: string[],
	moduleName: string
): string {
	const mod = JSON.stringify(`${moduleName}-${paths[0]}`)
	return `require(${mod})`;
}
