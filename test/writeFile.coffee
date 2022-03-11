
fs = require 'fs'
ssh2fs = require '../src'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'writeFile', ->

  they 'source is buffer', connect ({ssh}) ->
    buf = Buffer.from 'helloworld'
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", buf
    content = await ssh2fs.readFile ssh, "#{scratch}/a_file", 'utf8'
    content.should.eql "helloworld"

  they 'source is readable stream', connect ({ssh}) ->
    await fs.promises.writeFile "#{scratch}/source", 'helloworld'
    rs = await fs.createReadStream "#{scratch}/source"
    await ssh2fs.writeFile ssh, "#{scratch}/target", rs
    content = await ssh2fs.readFile ssh, "#{scratch}/target", 'utf8'
    content.should.eql "helloworld"

  they 'source is invalid readable stream', connect ({ssh}) ->
    ssh = null
    rs = await fs.createReadStream "#{scratch}/does_not_exists"
    ssh2fs.writeFile ssh, "#{scratch}/target", rs
    .should.be.rejectedWith
      code: 'ENOENT'

  they 'pass append flag', connect ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", "hello", flags: 'a'
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", "world", flags: 'a'
    ssh2fs.readFile ssh, "#{scratch}/a_file", 'utf8'
    .should.resolvedWith "helloworld"
