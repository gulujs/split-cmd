import * as assert from 'assert';
import { splitCmd } from './index.js';

const cases = [
  ['', []],
  [' ', []],
  ['a b', ['a', 'b']],
  [' a b ', ['a', 'b']],
  ["'a' 'b c'", ['a', 'b c']],
  ['"a" "b c"', ['a', 'b c']],
  ['a "\\"b\\" c"', ['a', '"b" c']],
  ["a '\\b c'", ['a', '\\b c']],
  ['a b\\\nc', ['a', 'bc']]
];

console.log('\x1b[33m%s\x1b[0m', 'Testing default options');
for (const [cmd, argv] of cases) {
  assert.deepStrictEqual(splitCmd(cmd), argv);
}
console.log('\x1b[32m%s\x1b[0m', 'Done');

const keepQuotesCases = [
  ['', []],
  [' ', []],
  ['a b', ['a', 'b']],
  [' a b ', ['a', 'b']],
  ["'a' 'b c'", ["'a'", "'b c'"]],
  ['"a" "b c"', ['"a"', '"b c"']],
  ['a "\\"b\\" c"', ['a', '"\\"b\\" c"']],
  ["a '\\b c'", ['a', "'\\b c'"]],
  ['a b\\\nc', ['a', 'bc']]
];

console.log('\x1b[33m%s\x1b[0m', 'Testing with options "{ keepQuotes: true }"');
for (const [cmd, argv] of keepQuotesCases) {
  assert.deepStrictEqual(splitCmd(cmd, { keepQuotes: true }), argv);
}
console.log('\x1b[32m%s\x1b[0m', 'Done');

