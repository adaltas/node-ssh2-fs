
fs = require 'fs'
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'createReadStream', ->

  they 'pass error if file does not exists', ({ssh}) ->
    stream = await ssh2fs.createReadStream ssh, "#{scratch}/not_here"
    stream.on 'error', (err) ->
      err.message.should.eql "ENOENT: no such file or directory, open '#{scratch}/not_here'"
      err.code.should.eql 'ENOENT'
      err.errno.should.eql -2
      err.syscall.should.eql 'open'
      err.path.should.eql "#{scratch}/not_here"

  they 'pass error if file is a directory', ({ssh}) ->
    stream = await ssh2fs.createReadStream ssh, __dirname
    stream.on 'error', (err) ->
      err.message.should.eql "EISDIR: illegal operation on a directory, read"
      # err.errno.should.eql 28 # Broken in latest Node.js 0.11.13
      err.code.should.eql 'EISDIR'

  they 'pipe to stream writer', ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/source", 'a text'
    ws = await fs.createWriteStream "#{scratch}/target"
    new Promise (resolve, reject) ->
      rs = await ssh2fs.createReadStream ssh, "#{scratch}/source"
      rs.pipe ws
      ws.on 'error', (err) ->
        reject err
      ws.on 'end', ->
        ws.destroy()
      ws.on 'close', ->
        fs.readFile "#{scratch}/target", 'ascii', (err, content) ->
          content.should.eql 'a text' unless err
          unless err then resolve() else reject err
