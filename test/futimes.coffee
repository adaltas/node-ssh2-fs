
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'futimes', ->

  they 'change permission', ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", "hello"
    stat1 = await ssh2fs.stat ssh, "#{scratch}/a_file"
    await ssh2fs.futimes ssh, "#{scratch}/a_file", Date.now(), Date.now()
    stat2 = await ssh2fs.stat ssh, "#{scratch}/a_file"
    stat1.atime.should.not.equal stat2.atime
    stat1.mtime.should.not.equal stat2.mtime
