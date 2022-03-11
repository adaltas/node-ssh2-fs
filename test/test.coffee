
fs = require('fs').promises
exec = require 'ssh2-exec'
connect = require 'ssh2-connect'

scratch = "/tmp/ssh2-fs-test"

tmpdir = ->
  ssh = null
  new Promise (resolve, reject) ->
    exec ssh, "rm -rf #{scratch}", (err) ->
      return reject err if err
      exec ssh, "mkdir -p #{scratch}", (cleanerr) ->
        unless err then resolve() else reject err

# Configure and return they
they = require('mocha-they') [
  label: 'local'
,
  label: 'remote'
  ssh: host: '127.0.0.1', username: process.env.USER
]

wrap = (handler) ->
  (...args) ->
    new Promise (resolve, reject) ->
      conn = null
      try
        ssh = args[0].ssh
        conn = await connect ssh if ssh
        args[0].ssh = conn if conn
        await handler.call @, ...args
        resolve()
      catch err
        reject err
      finally
        conn.end() if conn

module.exports =
  connect: wrap
  scratch: scratch
  they: they
  tmpdir: tmpdir
