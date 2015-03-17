
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'lstat', ->

  they 'work', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", "helloworld", flags: 'a', (err) =>
      return next err if err
      fs.symlink ssh, "#{@scratch}/a_file", "#{@scratch}/a_link", (err) =>
        return next err if err
        fs.lstat ssh, "#{@scratch}/a_link", (err, lstat) =>
          return next err if err
          lstat.isSymbolicLink().should.be.True 
          next()

  they 'return error code is not exists', test (ssh, next) ->
    fs.lstat ssh, "#{@scratch}/a_missing_link", (err, lstat) =>
      err.code.should.eql 'ENOENT'
      next()
