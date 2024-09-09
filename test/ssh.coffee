
ssh2fs = require '../lib'
{connect, tmpdir, scratch, they} = require './test'

beforeEach tmpdir

describe 'ssh', ->

  they 'call after end', connect ({ssh}) ->
    return unless ssh
    new Promise (resolve, reject) ->
      ssh.end()
      ssh.on 'end', ->
        ssh2fs.readFile ssh, "#{scratch}/a_file", 'utf8'
        .should.be.rejectedWith
          message: 'Closed SSH Connection'
        resolve()
