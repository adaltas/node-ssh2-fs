
test = require './test'
they = require 'ssh2-they'
fs = require '../lib'

describe 'constants', ->

  it 'match with native constants', ->
    fs.constants.S_IFDIR.should.be.a.Number()
    fs.constants.S_IFDIR is require('fs').constants.S_IFDIR
