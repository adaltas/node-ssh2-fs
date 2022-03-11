
ssh2fs = require '../src'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'rename', ->

  they 'a file', connect ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/src_file", "helloworld", flags: 'a'
    await ssh2fs.rename ssh, "#{scratch}/src_file", "#{scratch}/dest_file"
    content = await ssh2fs.readFile ssh, "#{scratch}/dest_file", 'utf8'
    content.should.eql "helloworld"

  they 'over an existing file', connect ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/dest_file", "overwrite", flags: 'a'
    await ssh2fs.writeFile ssh, "#{scratch}/src_file", "helloworld", flags: 'a'
    await ssh2fs.rename ssh, "#{scratch}/src_file", "#{scratch}/dest_file"
    content = await ssh2fs.readFile ssh, "#{scratch}/dest_file", 'utf8'
    content.should.eql "helloworld"
