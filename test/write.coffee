
should = require 'should'
test = require './test'
they = require 'ssh2-exec/lib/they'
fs = require '../src'

describe 'write', ->

  they 'append', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", "hello", flags: 'a', (err) =>
      return next err if err
      fs.writeFile ssh, "#{@scratch}/a_file", "world", flags: 'a', (err) =>
        return next err if err
        fs.readFile ssh, "#{@scratch}/a_file", 'utf8', (err, content) =>
          content.should.eql "helloworld"
          next()
