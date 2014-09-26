
fs = require 'fs'
should = require 'should'
exec = require 'ssh2-exec'

scratch = "/tmp/test-nodejs-ssh2-fs"
i = 0

module.exports = (callback) ->
    (ssh, next) ->
      @scratch = "#{scratch}-#{i++}"
      exec ssh, "mkdir -p #{@scratch}", (err) =>
        callback.call @, ssh, (err) =>
          exec ssh, "rm -rdf #{@scratch}", (cleanerr) =>
            next err or cleanerr
