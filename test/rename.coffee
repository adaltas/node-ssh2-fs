
should = require 'should'
test = require './test'
they = require 'ssh2-exec/lib/they'
fs = require '../src'

describe 'rename', ->

  they 'work', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", "helloworld", flags: 'a', (err) =>
      return next err if err
      fs.rename ssh, "#{@scratch}/a_file", "#{@scratch}/a_renamed_file", (err) =>
        return next err if err
        fs.readFile ssh, "#{@scratch}/a_renamed_file", 'utf8', (err, content) =>
          return next err if err
          content.should.eql "helloworld"
          next()
