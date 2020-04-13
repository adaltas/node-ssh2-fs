
path = require 'path'
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'readdir', ->
  
  they 'list', ({ssh}) ->
    files = await ssh2fs.readdir ssh, "#{__dirname}"
    files.length.should.be.above 5
    files.indexOf(path.basename __filename).should.not.equal -1
        
  they 'list empty dir', ({ssh}) ->
    files = await ssh2fs.mkdir ssh, "#{scratch}/empty"
    files = await ssh2fs.readdir ssh, "#{scratch}/empty"
    files.length.should.equal 0
  
  they 'error on file', ({ssh}) ->
    files = await ssh2fs.readdir ssh, "#{__filename}"
    .should.be.rejectedWith
      code: 'ENOTDIR'
      message: "ENOTDIR: not a directory, scandir '#{__filename}'"
      path: __filename
