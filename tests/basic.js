import test from 'ava';
import * as helpers from './helpers/index.js';

test('successfully make a bundle', async t => {
  const compiler = helpers.getCompiler('basic.js')
  await helpers.compile(compiler);
  t.pass();
})
