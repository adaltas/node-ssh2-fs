
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'lstat', ->

  they 'work', ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", "helloworld", flags: 'a'
    await ssh2fs.symlink ssh, "#{scratch}/a_file", "#{scratch}/a_link"
    lstat = await ssh2fs.lstat ssh, "#{scratch}/a_link"
    lstat.isSymbolicLink().should.be.True()

  they 'return error code is not exists', ({ssh}) ->
    ssh2fs.lstat ssh, "#{scratch}/a_missing_link"
    .should.be.rejectedWith
      code: 'ENOENT'
