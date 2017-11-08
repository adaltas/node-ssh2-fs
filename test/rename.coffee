
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'rename', ->

  they 'a file', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/src_file", "helloworld", flags: 'a', (err) =>
      return next err if err
      fs.rename ssh, "#{@scratch}/src_file", "#{@scratch}/dest_file", (err) =>
        return next err if err
        fs.readFile ssh, "#{@scratch}/dest_file", 'utf8', (err, content) =>
          return next err if err
          content.should.eql "helloworld"
          next()

  they 'over an existing file', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/dest_file", "overwrite", flags: 'a', (err) =>
      return next err if err
      fs.writeFile ssh, "#{@scratch}/src_file", "helloworld", flags: 'a', (err) =>
        return next err if err
        fs.rename ssh, "#{@scratch}/src_file", "#{@scratch}/dest_file", (err) =>
          return next err if err
          fs.readFile ssh, "#{@scratch}/dest_file", 'utf8', (err, content) =>
            return next err if err
            content.should.eql "helloworld"
            next()
