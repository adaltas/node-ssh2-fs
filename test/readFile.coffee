
should = require 'should'
test = require './test'
they = require 'ssh2-exec/lib/they'
fs = require '../src'

describe 'readFile', ->

  they 'pass error to callback if not exists', test (ssh, next) ->
    fs.readFile ssh, "#{__dirname}/doesnotexist", 'utf8', (err, exists) ->
      err.message.should.eql "ENOENT, open '#{__dirname}/doesnotexist'"
      err.errno.should.eql 34
      err.code.should.eql 'ENOENT'
      err.path.should.eql "#{__dirname}/doesnotexist"
      next()
