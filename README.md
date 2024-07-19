[![Build Status](https://secure.travis-ci.org/adaltas/node-ssh2-fs.png)][travis]

# Node.js ssh2-fs

The Node.js ssh2-fs package extends the [`ssh2`][ssh2] module to provide 
transparent of the `fs` and module either locally or over SSH. 

## Installation

This is OSS and licensed under the [new BSD license][license].

```bash
npm install ssh2-fs
```

## Usage

The API borrows from the `fs.promises` module with the additionnal first
argument. The function run locally when "null" or it run over SSH when an
[`ssh2`][ssh2] connection. Otherwise the API is strictly the same with a few
exception due to the SSH2 API:

- The `exists` function which execute the call with 2 arguments: an error and 
  the exists argument.
- The functions `createReadStream` and `createWriteStream` return a promise with
  a stream argument.

Only the asynchronous functions are ported, we have no plan to support 
synchronous functions. Morevover, they are not supported by [`ssh2`].

Non (yet) implemented functions are "ftruncate", "truncate", "fchown", "lchown", 
"fchmod", "lchmod", "fstat", "realpath", "rmdir", "close", "open", "utimes", 
"fsync", "write", "read", "appendFile", "watchFile", "unwatchFile", "watch".

## Examples

The example is using both the "ssh2-connect" and "ssh2-fs" modules.

```js
const connect = require('ssh2-connect');
const fs = require('ssh2-fs');
const ssh = await connect({host: 'localhost'});
await fs.mkdir(ssh, '/tmp/a_dir');
```

## Development

Tests are executed with mocha. To install it, simple run `npm install`, it will install
mocha and its dependencies in your project "node_modules" directory.

To run the tests:
```bash
npm test
```

The test suite is run online with [Travis][travis] against Node.js version 0.9, 
0.10 and 0.11.

The tests run against the CoffeeScript source files.

To generate the JavaScript files:
```bash
make build
```

## Release

Versions are incremented using semantic versioning. To create a new version and publish it to NPM, run:

```bash
npm run release
npm publish
```

The publication is not(yet) handled by the GitHub action.

## Contributors

*   David Worms: <https://github.com/wdavidw>

[travis]: http://travis-ci.org/adaltas/node-ssh2-fs
[ssh2]: https://github.com/mscdex/ssh2
[license]: https://github.com/adaltas/node-ssh2-fs/blob/master/LICENSE.md
