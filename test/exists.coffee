
ssh2fs = require '../src'
{tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'exists', ->

  they 'on file', ({ssh}) ->
    exists = await ssh2fs.exists ssh, "#{__filename}"
    exists.should.be.true()

  they 'does not exist', ({ssh}) ->
    exists = await ssh2fs.exists ssh, "#{__filename}/nothere"
    exists.should.not.be.true()
