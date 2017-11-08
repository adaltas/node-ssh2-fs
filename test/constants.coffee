
test = require './test'
they = require 'ssh2-they'
fs = require '../lib'

describe 'constants', ->

  it 'match with native constants', ->
    # (typeof fs.constants is 'object').should.be.true()
    fs.constants.should.be.an.Object()
    fs.constants.S_IFREG is require('fs').constants.S_IFREG
