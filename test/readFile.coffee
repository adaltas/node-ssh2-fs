
ssh2fs = require '../src'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'readFile', ->

  they 'return a buffer unless encoding is present', connect ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", 'hello', flags: 'w'
    content = await ssh2fs.readFile ssh, "#{scratch}/a_file"
    Buffer.isBuffer(content).should.be.true()

  they 'return a string if encoding is present', connect ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", 'hello', flags: 'w'
    content = await ssh2fs.readFile ssh, "#{scratch}/a_file", 'utf8'
    content.should.eql 'hello'

  they 'error with missing file', connect ({ssh}) ->
    ssh2fs.readFile ssh, "#{scratch}/doesnotexist", 'utf8'
    .should.be.rejectedWith
      message: "ENOENT: no such file or directory, open '#{scratch}/doesnotexist'"
      code: 'ENOENT'
      errno: -2
      syscall: 'open'
      path: "#{scratch}/doesnotexist"

  they 'error with directory', connect ({ssh}) ->
    ssh2fs.readFile ssh, "#{scratch}"
    .should.be.rejectedWith
      message: 'EISDIR: illegal operation on a directory, read'
      code: 'EISDIR'
      errno: -21
      syscall: 'read'
