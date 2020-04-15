
fs = require 'fs'
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'createReadStream', ->
  
  describe 'error', ->

    they 'ENOENT if file does not exists', ({ssh}) ->
      new Promise (resolve, reject) ->
        stream = await ssh2fs.createReadStream ssh, "#{scratch}/not_here"
        stream.on 'error', reject
      .should.be.rejectedWith
        message: "ENOENT: no such file or directory, open '#{scratch}/not_here'"
        code: 'ENOENT'
        errno: -2
        syscall: 'open'
        path: "#{scratch}/not_here"

    they 'EISDIR if file is a directory', ({ssh}) ->
      new Promise (resolve, reject) ->
        stream = await ssh2fs.createReadStream ssh, __dirname
        stream.on 'error', reject
      .should.be.rejectedWith
        code: 'EISDIR'
        message: "EISDIR: illegal operation on a directory, read"
        errno: -21
        syscall: 'read'
  
  describe 'usage', ->

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
