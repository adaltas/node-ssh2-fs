
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'exists', ->

  they 'on file', test (ssh, next) ->
    fs.exists ssh, "#{__filename}", (err, exists) ->
      exists.should.be.ok
      next()

  they 'does not exist', test (ssh, next) ->
    fs.exists ssh, "#{__filename}/nothere", (err, exists) ->
      exists.should.not.be.ok
      next()
