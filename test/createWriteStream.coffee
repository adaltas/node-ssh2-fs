
fs = require 'fs'
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'createWriteStream', ->

  they 'pipe into stream reader', ({ssh}) ->
    await fs.promises.writeFile "#{scratch}/source", 'a text'
    rs = fs.createReadStream "#{scratch}/source"
    ws = await ssh2fs.createWriteStream ssh, "#{scratch}/target"
    rs.pipe ws
    new Promise (resolve, reject) ->
      ws.on 'error', (err) ->
        reject err
      ws.on 'end', ->
        ws.destroy()
      ws.on 'close', ->
        content = await ssh2fs.readFile ssh, "#{scratch}/target", 'ascii'
        content.should.eql 'a text'
        resolve()
