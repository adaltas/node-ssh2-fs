
fs = require 'fs'
test = require './test'
they = require 'ssh2-they'
ssh2fs = require '../src'

describe 'writeFile', ->

  they 'source is buffer', test (ssh, next) ->
    buf = Buffer.from 'helloworld'
    ssh2fs.writeFile ssh, "#{@scratch}/a_file", buf, (err) =>
      return next err if err
      ssh2fs.readFile ssh, "#{@scratch}/a_file", 'utf8', (err, content) =>
        content.should.eql "helloworld" unless err
        next err

  they 'source is readable stream', test (ssh, next) ->
    fs.writeFile "#{@scratch}/source", 'helloworld', (err) =>
      return next err if err
      rs = fs.createReadStream "#{@scratch}/source"
      ssh2fs.writeFile ssh, "#{@scratch}/target", rs, (err) =>
        return next err if err
        ssh2fs.readFile ssh, "#{@scratch}/target", 'utf8', (err, content) =>
          content.should.eql "helloworld" unless err
          next err

  they 'source is invalid readable stream', test (ssh, next) ->
    ssh = null
    rs = fs.createReadStream "#{@scratch}/does_not_exists"
    ssh2fs.writeFile ssh, "#{@scratch}/target", rs, (err, ws) =>
      err.code.should.eql 'ENOENT'
      next()

  they 'pass append flag', test (ssh, next) ->
    ssh2fs.writeFile ssh, "#{@scratch}/a_file", "hello", flags: 'a', (err) =>
      return next err if err
      ssh2fs.writeFile ssh, "#{@scratch}/a_file", "world", flags: 'a', (err) =>
        return next err if err
        ssh2fs.readFile ssh, "#{@scratch}/a_file", 'utf8', (err, content) =>
          content.should.eql "helloworld" unless err
          next err
