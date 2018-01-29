
fs = require 'fs'
test = require './test'
they = require 'ssh2-they'
ssh2fs = require '../src'

describe 'createReadStream', ->

  they 'pass error if file does not exists', test (ssh, next) ->
    ssh2fs.createReadStream ssh, "#{@scratch}/not_here", (err, stream) =>
      stream.on 'error', (err) =>
        err.message.should.eql "ENOENT: no such file or directory, open '#{@scratch}/not_here'"
        err.code.should.eql 'ENOENT'
        err.errno.should.eql -2
        err.syscall.should.eql 'open'
        err.path.should.eql "#{@scratch}/not_here"
        next()

  they 'pass error if file is a directory', test (ssh, next) ->
    ssh2fs.createReadStream ssh, __dirname, (err, stream) =>
      stream.on 'error', (err) =>
        err.message.should.eql "EISDIR: illegal operation on a directory, read"
        # err.errno.should.eql 28 # Broken in latest Node.js 0.11.13
        err.code.should.eql 'EISDIR'
        next()

  they 'pipe to stream writer', test (ssh, next) ->
    ws = fs.createWriteStream "#{@scratch}/target"
    ssh2fs.writeFile ssh, "#{@scratch}/source", 'a text', (err) =>
      return next err if err
      ssh2fs.createReadStream ssh, "#{@scratch}/source", (err, rs) =>
        rs.pipe ws
        ws.on 'error', (err) ->
          next err
        ws.on 'end', ->
          ws.destroy()
        ws.on 'close', =>
          fs.readFile "#{@scratch}/target", 'ascii', (err, content) ->
            content.should.eql 'a text' unless err
            next err
