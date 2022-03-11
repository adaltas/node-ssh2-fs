
fs = require 'fs'
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'createWriteStream', ->
  
  describe 'error', ->

    they 'ENOENT if parent dir does not exists', ({ssh}) ->
      new Promise (resolve, reject) ->
        stream = await ssh2fs.createWriteStream ssh, "#{scratch}/not/here", ''
        stream.on 'error', reject
      .should.be.rejectedWith
        message: "ENOENT: no such file or directory, open '#{scratch}/not/here'"
        code: 'ENOENT'
        errno: -2
        syscall: 'open'
        path: "#{scratch}/not/here"

    they 'EISDIR if file is a directory', ({ssh}) ->
      new Promise (resolve, reject) ->
        stream = await ssh2fs.createWriteStream ssh, __dirname
        stream.on 'error', reject
      .should.be.rejectedWith
        code: 'EISDIR'
        message: "EISDIR: illegal operation on a directory, open '#{__dirname}'"
        errno: -21
        syscall: 'open'

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

  they 'option `flags`', ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", "hello"
    ws = await ssh2fs.createWriteStream ssh, "#{scratch}/a_file", flags: 'a'
    ws.write 'world'
    ws.end()
    new Promise (resolve, reject) ->
      ws.on 'close', ->
        ssh2fs.readFile ssh, "#{scratch}/a_file", 'utf8'
        .should.resolvedWith "helloworld"
        .then resolve

  they 'option `mode`', ({ssh}) ->
    ws = await ssh2fs.createWriteStream ssh, "#{scratch}/a_file", mode: 0o0611
    ws.write 'world'
    ws.end()
    new Promise (resolve, reject) ->
      ws.on 'close', ->
        {mode} = await ssh2fs.stat ssh, "#{scratch}/a_file"
        mode.toString(8).substr(-3).should.eql '611'
        resolve()
