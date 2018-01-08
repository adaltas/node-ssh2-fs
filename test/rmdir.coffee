
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'rmdir', ->

  they 'a dir', test (ssh, next) ->
    fs.mkdir ssh, "#{@scratch}/a_dir", (err) =>
      return next err if err
      fs.rmdir ssh, "#{@scratch}/a_dir", (err) =>
        return next err if err
        next()

  they 'a missing file', test (ssh, next) ->
    fs.rmdir ssh, "#{@scratch}/a_dir", (err) =>
      err.message.should.eql 'ENOENT: no such file or directory, rmdir \'/tmp/ssh2-fs-test/a_dir\''
      err.errno.should.eql -2
      err.code.should.eql 'ENOENT'
      err.syscall.should.eql 'rmdir'
      err.path.should.eql '/tmp/ssh2-fs-test/a_dir'
      next()
