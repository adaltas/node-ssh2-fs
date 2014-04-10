
should = require 'should'
test = require './test'
they = require 'ssh2-exec/lib/they'
fs = require '../src'

describe 'mkdir', ->

  they 'create a new directory', test (ssh, next) ->
    fs.mkdir ssh, "#{@scratch}/new_dir", (err) =>
      next err

  they 'pass error if dir exists', test (ssh, next) ->
    fs.mkdir ssh, "#{@scratch}/new_dir", (err) =>
      fs.mkdir ssh, "#{@scratch}/new_dir", (err) =>
        err.message.should.eql "EEXIST, mkdir '#{@scratch}/new_dir'"
        err.path.should.eql "#{@scratch}/new_dir"
        err.errno.should.eql 47
        err.code.should.eql 'EEXIST'
        next()
