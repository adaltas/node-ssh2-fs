
path = require 'path'
should = require 'should'
test = require './test'
they = require 'ssh2-exec/lib/they'
fs = require '../src'

describe 'readdir', ->
  
  they 'list', test (ssh, next) ->
    fs.readdir ssh, "#{__dirname}", (err, files) ->
      return next err if err
      files.length.should.be.above 5
      files.indexOf(path.basename __filename).should.not.equal -1
      next()
