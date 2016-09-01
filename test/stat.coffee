
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'stat', ->

  they 'on file', test (ssh, next) ->
    fs.stat ssh, __filename, (err, stat) ->
      return next err if err
      stat.isFile().should.be.true()
      next()

  they 'on directory', test (ssh, next) ->
    fs.stat ssh, __dirname, (err, stat) ->
      return next err if err
      stat.isDirectory().should.be.true()
      next()

  they 'check does not exist', test (ssh, next) ->
    fs.stat ssh, "#{__dirname}/noone", (err, stat) ->
      err.code.should.eql 'ENOENT'
      next()
