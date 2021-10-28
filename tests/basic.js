import test from "ava";
import * as helpers from "./helpers/index.js";

test("successfully make a bundle", async (t) => {
  const compiler = helpers.getCompiler("basic.js");
  await t.notThrowsAsync(helpers.compile(compiler));
});

test("bundle includes .node", async (t) => {
  const compiler = helpers.getCompiler("basic.js");
  const stats = await helpers.compile(compiler);
  t.assert(
    Object.keys(stats.compilation.assets).find((asset) =>
      asset.endsWith(".node")
    )
  );
});
