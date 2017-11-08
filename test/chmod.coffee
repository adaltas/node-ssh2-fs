
test = require './test'
they = require 'ssh2-they'
fs = require '../lib'

describe 'chmod', ->

  they 'change permission', test (ssh, next) ->
    fs.writeFile ssh, "#{@scratch}/a_file", "hello", (err) =>
      fs.chmod ssh, "#{@scratch}/a_file", '546', (err) =>
        return next err if err
        fs.stat ssh, "#{@scratch}/a_file", (err, stat) =>
          "0o0#{(stat.mode & 0o0777).toString 8}".should.eql '0o0546'
          next err
