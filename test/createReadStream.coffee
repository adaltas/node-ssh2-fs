
fs = require 'fs'
ssh2fs = require '../src'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'createReadStream', ->
  
  describe 'error', ->

    they 'ENOENT if file does not exists', connect ({ssh}) ->
      new Promise (resolve, reject) ->
        stream = await ssh2fs.createReadStream ssh, "#{scratch}/not_here"
        stream.on 'error', reject
        stream.read()
      .should.be.rejectedWith
        message: "ENOENT: no such file or directory, open '#{scratch}/not_here'"
        code: 'ENOENT'
        errno: -2
        syscall: 'open'
        path: "#{scratch}/not_here"

    they 'EISDIR if file is a directory', connect ({ssh}) ->
      new Promise (resolve, reject) ->
        stream = await ssh2fs.createReadStream ssh, __dirname
        stream.on 'error', reject
        stream.read()
      .should.be.rejectedWith
        code: 'EISDIR'
        message: "EISDIR: illegal operation on a directory, read"
        errno: -21
        syscall: 'read'
  
  describe 'usage', ->

    they 'pipe to stream writer', connect ({ssh}) ->
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
