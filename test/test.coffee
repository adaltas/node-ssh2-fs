
fs = require 'fs'
exec = require 'ssh2-exec'

scratch = "/tmp/ssh2-fs-test"

tmpdir = ->
  ssh = null
  new Promise (resolve, reject) ->
    exec ssh, "rm -rf #{scratch}", (err) ->
      return reject err if err
      exec ssh, "mkdir -p #{scratch}", (cleanerr) ->
        unless err then resolve() else reject err

# Configure and return they
they = require('ssh2-they').configure [
  null
,
  ssh: host: '127.0.0.1', username: process.env.USER
]

module.exports =
  scratch: scratch
  they: they
  tmpdir: tmpdir
