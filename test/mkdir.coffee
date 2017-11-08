
test = require './test'
they = require 'ssh2-they'
fs = require '../src'

describe 'mkdir', ->

  they 'create a new directory', test (ssh, next) ->
    fs.mkdir ssh, "#{@scratch}/new_dir", (err) =>
      next err

  they 'pass error if dir exists', test (ssh, next) ->
    fs.mkdir ssh, "#{@scratch}/new_dir", (err) =>
      fs.mkdir ssh, "#{@scratch}/new_dir", (err) =>
        err.message.should.eql "EEXIST: file already exists, mkdir '#{@scratch}/new_dir'"
        err.path.should.eql "#{@scratch}/new_dir"
        # err.errno.should.eql 47 # Broken in latest Node.js 0.11.13
        err.code.should.eql 'EEXIST'
        next()

  they 'set mode', test (ssh, next) ->
    fs.mkdir ssh, "#{@scratch}/mode_dir", 0o0714, (err) =>
      return next err if err
      fs.stat ssh, "#{@scratch}/mode_dir", (err, stat) ->
        return next err if err
        stat.mode.toString(8).should.eql '40714'
        next()
