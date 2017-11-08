
fs = require 'fs'
test = require './test'
they = require 'ssh2-they'
ssh2fs = require '../src'

describe 'createWriteStream', ->

  they 'pipe into stream reader', test (ssh, next) ->
    ssh2fs.createWriteStream ssh, "#{@scratch}/target", (err, ws) =>
      return next err if err
      fs.writeFile "#{@scratch}/source", 'a text', (err) =>
        return next err if err
        rs = fs.createReadStream "#{@scratch}/source"
        rs.pipe ws
        ws.on 'error', (err) ->
          next err
        ws.on 'end', ->
          ws.destroy()
        ws.on 'close', =>
          ssh2fs.readFile ssh, "#{@scratch}/target", 'ascii', (err, content) ->
            content.should.eql 'a text' unless err
            next err

    # they 'handle file does not exist', test (ssh, next) ->
    #   ssh2fs.createWriteStream ssh, "#{@scratch}/missing", (err, ws) =>
    #     return next err if err
    #     fs.writeFile "#{@scratch}/source", 'a text', (err) =>
    #       return next err if err
    #       rs = fs.createReadStream "#{@scratch}/source"
    #       rs.pipe ws
    #       ws.on 'error', (err) ->
    #         next err
    #       ws.on 'end', ->
    #         ws.destroy()
    #       ws.on 'close', =>
    #         ssh2fs.readFile ssh, "#{@scratch}/target", 'ascii', (err, content) ->
    #           content.should.eql 'a text' unless err
    #           next err
