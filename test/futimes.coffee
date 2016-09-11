
should = require 'should'
test = require './test'
they = require 'ssh2-they'
fs = require '../lib'

describe 'futimes', ->

  they 'change permission', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", "hello", (err) =>
      fs.stat ssh, "#{@scratch}/a_file", (err, stat1) =>
        fs.futimes ssh, "#{@scratch}/a_file", Date.now(), Date.now(), (err) =>
          return next err if err
          fs.stat ssh, "#{@scratch}/a_file", (err, stat2) =>
            stat1.atime.should.not.equal stat2.atime
            stat1.mtime.should.not.equal stat2.mtime
            next err
