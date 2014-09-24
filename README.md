[![Build Status](https://secure.travis-ci.org/wdavidw/node-ssh2-fs.png)][travis]

# Node.js ssh2-fs

The Node.js ssh2-fs package extends the [`ssh2`][ssh2] module to provide 
transparent of the `fs` and module either locally or over SSH. 

## Installation

This is OSS and licensed under the [new BSD license][license].

```bash
npm install ssh2-fs
```

## Usage

The API borrows from the `fs` module with the additionnal first argument. The 
function run locally when "null" or it run over SSH when an [`ssh2`][ssh2] 
connection. Otherwise the API is strictly the same with a few exception due to
the SSH2 API:

*   The exists function which execute the call with 2 arguments: an error and 
    the exists argument.
*   The functions `createReadStream` and `createWriteStream` pass the streams 
    it to their completion callback instead of returning it.


Only the asynchronous functions are ported, we have no plan to support 
sunchronous functions. Morevover, they are not supported by [`ssh2`].

Non (yet) implemented functions are "ftruncate", "truncate", "fchown", "lchown", 
"fchmod", "lchmod", "fstat", "realpath", "rmdir", "close", "open", "utimes", 
"futimes", "fsync", "write", "read", "appendFile", "watchFile", "unwatchFile",
"watch".

## Examples

The example is using both the "ssh2-connect" and "ssh2-fs" modules.

```js
connect = require('ssh2-connect');
fs = require('ssh2-fs');
connect({host: 'localhost'}, function(err, ssh){
  fs.mkdir(ssh, '/tmp/a_dir', (err, stdout, stderr){
    console.log(stdout);
  });
});
```

## Development

Tests are executed with mocha. To install it, simple run `npm install`, it will install
mocha and its dependencies in your project "node_modules" directory.

To run the tests:
```bash
npm test
```

The tests run against the CoffeeScript source files.

To generate the JavaScript files:
```bash
make build
```

The test suite is run online with [Travis][travis] against Node.js version 0.9, 
0.10 and 0.11.

## Contributors

*   David Worms: <https://github.com/wdavidw>

[travis]: http://travis-ci.org/wdavidw/node-ssh2-fs
[ssh2]: https://github.com/mscdex/ssh2
[license]: https://github.com/wdavidw/node-ssh2-fs/blob/master/LICENSE.md

