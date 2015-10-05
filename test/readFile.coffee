
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'readFile', ->

  they 'pass error to callback if not exists', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", 'hello', flags: 'w', (err, exists) =>
      fs.readFile ssh, "#{@scratch}/a_file", 'utf8', (err, content) =>
        content.should.eql 'hello'
        fs.unlink
        next()

  they 'pass error to callback if not exists', test (ssh, next) ->
    fs.readFile ssh, "#{@scratch}/doesnotexist", 'utf8', (err, exists) =>
      err.message.should.eql "ENOENT, open '#{@scratch}/doesnotexist'"
      # err.errno.should.eql 34 # Broken in latest Node.js 0.11.13
      err.code.should.eql 'ENOENT'
      err.path.should.eql "#{@scratch}/doesnotexist"
      next()

  they 'error with directory', test (ssh, next) ->
    fs.readFile ssh, "#{@scratch}", (err, exists) ->
      err.message.should.eql 'EISDIR, read'
      err.code.should.eql 'EISDIR'
      err.errno.should.eql -21
      next()
