
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'stat', ->

  they 'on file', ({ssh}) ->
    stat = await ssh2fs.stat ssh, __filename
    stat.isFile().should.be.true()

  they 'on directory', ({ssh}) ->
    stat = await ssh2fs.stat ssh, __dirname
    stat.isDirectory().should.be.true()

  they 'check does not exist', ({ssh}) ->
    ssh2fs.stat ssh, "#{__dirname}/noone"
    .should.be.rejectedWith
      code: 'ENOENT'
