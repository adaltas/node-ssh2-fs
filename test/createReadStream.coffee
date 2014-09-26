
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'createReadStream', ->

  they 'pass error if file does not exists', test (ssh, next) ->
    fs.createReadStream ssh, "#{@scratch}/not_here", (err, stream) =>
      stream.on 'error', (err) =>
        err.message.should.eql "ENOENT, open '#{@scratch}/not_here'"
        # err.errno.should.eql 34 # Broken in latest Node.js 0.11.13
        err.code.should.eql 'ENOENT'
        err.path.should.eql "#{@scratch}/not_here"
        next()

  they 'pass error if file is a directory', test (ssh, next) ->
    fs.createReadStream ssh, __dirname, (err, stream) =>
      stream.on 'error', (err) =>
        err.message.should.eql "EISDIR, read"
        # err.errno.should.eql 28 # Broken in latest Node.js 0.11.13
        err.code.should.eql 'EISDIR'
        next()
