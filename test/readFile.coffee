
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'readFile', ->

  they 'return a buffer unless encoding is present', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", 'hello', flags: 'w', (err) =>
      return next err if err
      fs.readFile ssh, "#{@scratch}/a_file", (err, content) =>
        Buffer.isBuffer(content).should.be.true()
        next()

  they 'return a string if encoding is present', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", 'hello', flags: 'w', (err) =>
      return next err if err
      fs.readFile ssh, "#{@scratch}/a_file", 'utf8', (err, content) =>
        content.should.eql 'hello'
        next()

  they 'error with missing file', test (ssh, next) ->
    fs.readFile ssh, "#{@scratch}/doesnotexist", 'utf8', (err) =>
      err.message.should.eql "ENOENT: no such file or directory, open '#{@scratch}/doesnotexist'"
      err.code.should.eql 'ENOENT'
      err.errno.should.eql -2
      err.syscall.should.eql 'open'
      err.path.should.eql "#{@scratch}/doesnotexist"
      next()

  they 'error with directory', test (ssh, next) ->
    fs.readFile ssh, "#{@scratch}", (err) ->
      err.message.should.eql 'EISDIR: illegal operation on a directory, read'
      err.code.should.eql 'EISDIR'
      err.errno.should.eql -21
      err.syscall.should.eql 'read'
      next()
