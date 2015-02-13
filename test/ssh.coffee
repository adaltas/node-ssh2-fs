
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'ssh', ->

  they 'call after end', (ssh, next) ->
    return next() unless ssh
    ssh.end()
    ssh.on 'end', ->
      fs.readFile ssh, "#{@scratch}/a_file", 'utf8', (err, content) ->
        err.message.should.eql 'Closed SSH Connection'
        next()


