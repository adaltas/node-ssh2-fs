# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.4.0](https://github.com/adaltas/node-ssh2-fs/compare/v1.3.3...v1.4.0) (2025-12-02)

### Features

- main usage of dist folder ([6acfae7](https://github.com/adaltas/node-ssh2-fs/commit/6acfae73f4279a1c52a420b5cd892f32d1d82ce5))

### [1.3.3](https://github.com/adaltas/node-ssh2-fs/compare/v1.3.2...v1.3.3) (2024-11-28)

### [1.3.2](https://github.com/adaltas/node-ssh2-fs/compare/v1.3.1...v1.3.2) (2024-11-27)

### Bug Fixes

- close sftp channel in mkdir ([54e2c6d](https://github.com/adaltas/node-ssh2-fs/commit/54e2c6dadbd25dc2cb2717a06ca932a9067e1275))
- sftp error in rmdir ([2349ff0](https://github.com/adaltas/node-ssh2-fs/commit/2349ff09d6b569e8b3a4ddbf32c412ad790c4803))

### [1.3.1](https://github.com/adaltas/node-ssh2-fs/compare/v1.3.0...v1.3.1) (2024-11-07)

## [1.3.0](https://github.com/adaltas/node-ssh2-fs/compare/v1.2.2...v1.3.0) (2024-11-07)

### Features

- default export ([157cdd1](https://github.com/adaltas/node-ssh2-fs/commit/157cdd1415de1cc1440dee468c091a3364f07539))
- relax ssh null check ([9214112](https://github.com/adaltas/node-ssh2-fs/commit/92141121dacbd079e7a8a4cbb1da6ef084821c03))

### [1.2.2](https://github.com/adaltas/node-ssh2-fs/compare/v1.2.1...v1.2.2) (2024-10-24)

### [1.2.1](https://github.com/adaltas/node-ssh2-fs/compare/v1.2.0...v1.2.1) (2024-10-01)

## [1.2.0](https://github.com/adaltas/node-ssh2-fs/compare/v1.1.3...v1.2.0) (2024-10-01)

### ⚠ BREAKING CHANGES

- convertion to typescript
- remove default mkdir mode
- conversion from commonjs to esm

### Features

- export hidden types ([e5312a2](https://github.com/adaltas/node-ssh2-fs/commit/e5312a2e0efc7cc0e8058ffbc9f22cdb5b24f0de))
- finalize typescript migration ([1ca74b7](https://github.com/adaltas/node-ssh2-fs/commit/1ca74b721ef26822703c1cace0f8390fd0a00474))
- remove default mkdir mode ([4e509d3](https://github.com/adaltas/node-ssh2-fs/commit/4e509d38920dd5d321d40a3935c42342ef7ff8c2))

### Bug Fixes

- lint errors ([663c206](https://github.com/adaltas/node-ssh2-fs/commit/663c20603b1a5428041da3fbd0a861c07ccd04ec))

- conversion from commonjs to esm ([29df183](https://github.com/adaltas/node-ssh2-fs/commit/29df1835174d11f3f6919bb5ba0921bf2966d8ce))
- convertion to typescript ([0f75bbb](https://github.com/adaltas/node-ssh2-fs/commit/0f75bbb7b62234f68d462a07c69da7fc5614273e))

### [1.1.3](https://github.com/adaltas/node-ssh2-fs/compare/v1.1.2...v1.1.3) (2024-07-19)

### [1.1.2](https://github.com/adaltas/node-ssh2-fs/compare/v1.1.1...v1.1.2) (2022-06-26)

### [1.1.1](https://github.com/adaltas/node-ssh2-fs/compare/v1.1.0...v1.1.1) (2022-04-14)

## [1.1.0](https://github.com/adaltas/node-ssh2-fs/compare/v1.0.6...v1.1.0) (2022-03-11)

### Features

- support latest ssh2 ([6f87e0c](https://github.com/adaltas/node-ssh2-fs/commit/6f87e0c56a939972f86b9ee2c57cb6a18ef7a6be))

### Bug Fixes

- createWriteStream EISDIR error ([f20a185](https://github.com/adaltas/node-ssh2-fs/commit/f20a185374274c6d45f16c5741ebfda182266689))

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
