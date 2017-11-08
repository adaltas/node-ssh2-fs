
fs = require 'fs'
exec = require 'ssh2-exec'

scratch = "/tmp/ssh2-fs-test"

module.exports = (callback) ->
  (ssh, next) ->
    @scratch = "#{scratch}"
    exec ssh, "rm -rf #{@scratch}", (err) =>
      return next err if err
      exec ssh, "mkdir -p #{@scratch}", (cleanerr) =>
        callback.call @, ssh, next
