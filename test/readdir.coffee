
path = require 'path'
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'readdir', ->
  
  they 'list', test (ssh, next) ->
    fs.readdir ssh, "#{__dirname}", (err, files) ->
      return next err if err
      files.length.should.be.above 5
      files.indexOf(path.basename __filename).should.not.equal -1
      next()
        
  they 'list empty dir', test (ssh, next) ->
    fs.mkdir ssh, "#{@scratch}/empty", (err) =>
      return next err if err
      fs.readdir ssh, "#{@scratch}/empty", (err, files) =>
        return next err if err
        files.length.should.equal 0
        next()
  
  they 'error on file', test (ssh, next) ->
    fs.readdir ssh, "#{__filename}", (err, files) ->
      try
        err.message.should.eql "ENOTDIR, readdir '#{__filename}'"
        # err.errno.should.equal 27 # Broken in latest Node.js 0.11.13
      catch
        err.message.should.eql "ENOTDIR: not a directory, scandir '#{__filename}'"
      err.code.should.equal 'ENOTDIR'
      err.path.should.equal __filename
      next()
