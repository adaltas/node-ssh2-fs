# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/adaltas/node-ssh2-fs/compare/v1.0.6...v1.1.0) (2022-03-11)


### Features

* support latest ssh2 ([6f87e0c](https://github.com/adaltas/node-ssh2-fs/commit/6f87e0c56a939972f86b9ee2c57cb6a18ef7a6be))


### Bug Fixes

* createWriteStream EISDIR error ([f20a185](https://github.com/adaltas/node-ssh2-fs/commit/f20a185374274c6d45f16c5741ebfda182266689))


# Changelog

## Version 1.0.6

- package: latest dependencies

## Version 1.0.5

- package: raise node.js version
- mkdir: align syscall error property on EEXIST
- mkdir: align errno error property on EEXIST

## Version 1.0.4

- createReadStream: support EACCES

## Version 1.0.3

- createWriteStream: support ENOENT and EISDIR error with SSH

## Version 1.0.2

- ssh2@0.4.x use err.code; ssh2@0.3.x use err.type
- src: remove occurance of callback

## Version 1.0.1

- package: remove old lock file

## Version 1.0.0

- api: convert to promise based api
- package: latest dependencies
- test: latest mocha, move config to package.json
- package: coffee lint

## Version 0.3.8

- package: update adaltas url

## Version 0.3.7

- project: latest dependencies

## Version 0.3.6

- package: latest dependencies
- package: ignore lock files

## Version 0.3.5

- package: start running tests in preversion

## Version 0.3.4

- createReadStream: align with native fs error

## Version 0.3.3

- readFile: align with native fs error when file does not exists
- package: latest dependencies
- travis: test against Node.js 9

## Version 0.3.2

- rmdir: new function

## Version 0.3.1

- package: run tests first before releasing
- readFile: add syscall error property when target is a directory

## Version 0.3.0

- package: update to CoffeeScript 2

## Version 0.2.5

- test: fix constant test
- package: npm release commands
- readdir: traverse empty directory

## Version 0.2.4

- api: export fs.constants
- src: support root uid and gid
- src: fix wrong callback usage
- src: catch close and readdir errors

## Version 0.2.3

- package: latest dependencies
- package: move ownership

## Version 0.2.2

- readFile: return buffer unless encoding option

## Version 0.2.0

- test: simplify test wrapper
- futures: new functionality
- all: reorder code alphabetically
