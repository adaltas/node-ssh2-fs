
fs = require 'fs'
should = require 'should'
exec = require 'ssh2-exec'

scratch = "/tmp/mecano-test"

module.exports = (callback) ->
    (ssh, next) ->
      @scratch = scratch
      exec ssh, "rm -rdf #{scratch}", (err) =>
        exec ssh, "mkdir -p #{scratch}", (err) =>
          callback.call @, ssh, next
