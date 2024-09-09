
ssh2fs = require '../lib'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'exists', ->

  they 'on file', connect ({ssh}) ->
    exists = await ssh2fs.exists ssh, "#{__filename}"
    exists.should.be.true()

  they 'does not exist', connect ({ssh}) ->
    exists = await ssh2fs.exists ssh, "#{__filename}/nothere"
    exists.should.not.be.true()
