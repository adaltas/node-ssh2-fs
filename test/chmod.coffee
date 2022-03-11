
ssh2fs = require '../src'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'chmod', ->

  they 'change permission', connect ({ssh}) ->
    await ssh2fs.writeFile ssh, "#{scratch}/a_file", "hello"
    await ssh2fs.chmod ssh, "#{scratch}/a_file", '546'
    stat = await ssh2fs.stat ssh, "#{scratch}/a_file"
    "0o0#{(stat.mode & 0o0777).toString 8}".should.eql '0o0546'

  they 'sticky bit', connect ({ssh}) ->
    await ssh2fs.mkdir ssh, "#{scratch}/sticky_bit_dir"
    await ssh2fs.chmod ssh, "#{scratch}/sticky_bit_dir", 0o1777
    stat = await ssh2fs.stat ssh, "#{scratch}/sticky_bit_dir"
    stat.mode.should.eql 0o41777
