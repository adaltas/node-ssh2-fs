
path = require 'path'
ssh2fs = require '../lib'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'readdir', ->

  they 'list', connect ({ssh}) ->
    files = await ssh2fs.readdir ssh, "#{__dirname}"
    files.length.should.be.above 5
    files.indexOf(path.basename __filename).should.not.equal -1

  they 'list empty dir', connect ({ssh}) ->
    files = await ssh2fs.mkdir ssh, "#{scratch}/empty"
    files = await ssh2fs.readdir ssh, "#{scratch}/empty"
    files.length.should.equal 0

  they 'error on file', connect ({ssh}) ->
    files = await ssh2fs.readdir ssh, "#{__filename}"
    .should.be.rejectedWith
      code: 'ENOTDIR'
      message: "ENOTDIR: not a directory, scandir '#{__filename}'"
      path: __filename
