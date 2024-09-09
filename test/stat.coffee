
ssh2fs = require '../lib'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'stat', ->

  they 'on file', connect ({ssh}) ->
    stat = await ssh2fs.stat ssh, __filename
    stat.isFile().should.be.true()

  they 'on directory', connect ({ssh}) ->
    stat = await ssh2fs.stat ssh, __dirname
    stat.isDirectory().should.be.true()

  they 'check does not exist', connect ({ssh}) ->
    ssh2fs.stat ssh, "#{__dirname}/noone"
    .should.be.rejectedWith
      code: 'ENOENT'
