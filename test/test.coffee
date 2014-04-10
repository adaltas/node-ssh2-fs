
fs = require 'fs'
should = require 'should'
exec = require 'ssh2-exec'

scratch = "/tmp/mecano-test"

module.exports = (callback) ->
    (ssh, next) ->
      @timeout 10000
      @scratch = scratch
      exec "rm -rdf #{scratch}", ssh: ssh, (err) =>
        exec "mkdir -p #{scratch}", ssh: ssh, (err) =>
          callback.call @, ssh, next
