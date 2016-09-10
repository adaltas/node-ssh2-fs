
    fs = require 'fs'

    module.exports =

# `ssh2-fs.chmod(ssh, path, options, callback)`

No arguments other than a possible exception are given to the completion
callback. 

      chmod: (ssh, path, mode, callback) ->
        unless ssh
          fs.chmod path, mode, (err) ->
            callback err
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.chmod path, mode, (err) ->
              sftp.end()
              callback err

# `ssh2-fs.chown(ssh, path, uid, gid, callback)`

No arguments other than a possible exception are given to the completion
callback. 

      chown: (ssh, path, uid, gid, callback) ->
        return callback new Error 'Either option "uid" or "gid" is required' unless uid? or gid?
        unless ssh
          fs.chown path, uid, gid, (err) ->
            callback err
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.chown path, uid, gid, (err) ->
              sftp.end()
              callback err

# `ssh2-fs.createReadStream(ssh, path, [options], callback)`

Pass a new ReadStream object (See Readable Stream) to the completion callback.

This differs from the original `fs` API which return the Readable Stream instead
of passing it to the completion callback, this is internally due to the ssh2
API.

Example:   

```coffee
fs.createReadStream sshOrNull, 'test.out', (err, stream) ->
  stream.pipe fs.createWriteStream 'test.in'
```

      createReadStream: (ssh, source, options, callback) ->
        if arguments.length is 3
          callback = options
          options = {}
        unless ssh
          callback null, fs.createReadStream source, options
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            s = sftp.createReadStream source, options
            s.emit = ( (emit) ->
              (key, val) ->
                if key is 'error' and val?.message is 'Failure'
                  val = new Error "EISDIR: illegal operation on a directory, read"
                  val.errno = 28
                  val.code = 'EISDIR'
                  return emit.call @, 'error', val
                if key is 'error' and val.message is 'No such file'
                  val = new Error "ENOENT: no such file or directory, open '#{source}'"
                  val.errno = 34
                  val.code = 'ENOENT'
                  val.path = source
                  return emit.call @, 'error', val
                emit.apply @, arguments
            )(s.emit)
            s.on 'close', ->
              sftp.end()
            callback null, s

# `createWriteStream(ssh, path, [options], callback)`

Pass a new WriteStream object (See Writable Stream) to the completion callback.

This differs from the original `fs` API which return the Writable Stream instead
of passing it to the completion callback, this is internally due to the ssh2
API.

Example:   

```coffee
misc.file.createWriteStream sshOrNull, 'test.out', (err, stream) ->
  fs.createReadStream('test.in').pipe stream
```

      createWriteStream: (ssh, path, options, callback) ->
        if arguments.length is 3
          callback = options
          options = {}
        unless ssh
          callback null, fs.createWriteStream(path, options)
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            ws = sftp.createWriteStream(path, options)
            ws.on 'close', ->
              sftp.end()
            callback null, ws

# `ssh2-fs.exists(ssh, path, callback)`

`options`         Command options include:   

*   `ssh`         SSH connection in case of a remote file path.  
*   `path`        Path to test.   
*   `callback`    Callback to return the result.   

`callback`        Received parameters are:   

*   `err`         Error object if any.   
*   `exists`      True if the file exists.   

Test whether or not the given path exists by checking with the file system.
Then call the callback argument with an error and either true or false.

      exists: (ssh, path, callback) ->
        unless ssh
          fs.exists path, (exists) ->
            callback null, exists
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.stat path, (err, attr) ->
              sftp.end()
              callback null, if err then false else true

# `ssh2-fs.lstat(ssh, path, callback)`

The callback gets two arguments (err, stats) where stats is a fs.Stats object.
lstat() is identical to stat(), except that if path is a symbolic link, then
the link itself is stat-ed, not the file that it refers to. 

      lstat: (ssh, path, callback) ->
        unless ssh
          fs.lstat path, (err, stat) ->
            callback err, stat
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.lstat path, (err, attr) ->
              sftp.end()
              # see https://github.com/mscdex/ssh2-streams/blob/master/lib/sftp.js#L30
              # ssh2@0.3.x use err.type
              # ssh2@0.4.x use err.code
              if err and (err.type is 'NO_SUCH_FILE' or err.code is 2)
                err.code = 'ENOENT'
                return callback err
              callback err, attr

# `ssh2-fs.mkdir(ssh, path, [options], callback)`

No arguments other than a possible exception are given to the completion
callback. mode defaults to 0777.

In SSH, options is an [ATTR SSH2 object][attr] and may contains such attributes as
'uid', 'gid' and 'mode'. If option is not an object, it is considered to be the
permission mode.

For the sake of compatibility, the local mode also accept additionnal options
than mode. Additionnal supported options are "uid' and "guid". It differs from
the native Node.js API which only accept a permission mode.

      mkdir: (ssh, path, options, callback) ->
        if arguments.length is 3
          callback = options
          options = 0o0777
        if typeof options isnt 'object'
          options = mode: options
        if options.permissions
          process.stderr.write 'Deprecated, use mode instead of permissions'
          options.mode = options.permissions
        options.mode = parseInt options.mode, 8 if typeof options.mode is 'string'
        unless ssh
          fs.mkdir path, options.mode, (err) ->
            return callback err if err
            return callback() unless options.uid or options.gid
            fs.chown path, options.uid, options.gid, callback
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            mkdir = ->
              sftp.mkdir path, options, (err, attr) ->
                if err?.message is 'Failure'
                  err = new Error "EEXIST: file already exists, mkdir '#{path}'"
                  err.errno = 47
                  err.code = 'EEXIST'
                  err.path = path
                return finish err if err
                chown()
            chown = ->
              return finish() unless options.uid or options.gid
              # chown should be required but mkdir doesnt seem to honor uid & gid attributes
              sftp.chown path, options.uid, options.gid, (err) ->
                return finish err if err
                finish()
            finish = (err) ->
              sftp.end()
              callback err
            mkdir()

# `ssh2-fs.readdir(path, callback)`

Reads the contents of a directory. The callback gets two arguments (err, files)
where files is an array of the names of the files in the directory excluding
'.' and '..'. 

      readdir: (ssh, path, callback) ->
        unless ssh
          fs.readdir path, callback
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            not_a_dir = (err) ->
              sftp.stat path, (er, attr) ->
                if not er and not attr.isDirectory()
                  err = Error "ENOTDIR: not a directory, scandir '#{path}'"
                  err.errno = 27
                  err.code = 'ENOTDIR'
                  err.path = path
                callback err
            sftp.opendir path, (err, handle) ->
              return not_a_dir err if err
              sftp.readdir handle, (err, files) ->
                sftp.close handle, (err) ->
                  return callback err if err
                  sftp.end()
                  files = for file in files then file.filename
                  callback err, files

# `ssh2-fs.readFile(ssh, path, [options], callback)` 

*   `filename` String   
*   `options` Object   
*   `options.encoding` String | Null default = null   
*   `options.flag` String default = 'r'   
*   `callback` Function   

Asynchronously reads the entire contents of a file.

      readFile: (ssh, path, options, callback) ->
        if arguments.length is 3
          callback = options
          options = {}
        else
          options = encoding: options if typeof options is 'string'
        return callback new Error "Invalid path '#{path}'" unless path
        unless ssh
          fs.readFile path, options.encoding, (err, content) ->
            callback err, content
        else
          options.autoClose ?= false # Required after version 0.0.18 (sep 2015)
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            s = sftp.createReadStream path, options
            data = []
            s.on 'data', (d) ->
              data.push d.toString()
            s.on 'error', (err) ->
              if err.code is 4
                err = new Error "EISDIR: illegal operation on a directory, read"
                err.errno = -21
                err.code = 'EISDIR'
              else if err.code is 2
                err = new Error "ENOENT: no such file or directory, open '#{path}'"
                err.errno = 34
                err.code = 'ENOENT'
                err.path = path
              finish err
            s.on 'end', ->
              finish null, data.join ''
            finish = (err, data) ->
              sftp.end() unless options.autoClose
              callback err, data

# `ssh2-fs.readlink(ssh, path, callback)`

The callback gets two arguments (err, linkString).

      readlink: (ssh, path, callback) ->
        unless ssh
          fs.readlink path, (err, target) ->
            callback err, target
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.readlink path, (err, target) ->
              sftp.end()
              callback err, target

# `ssh2-fs.rename(sshOrNull, oldPath, newPath, callback)`

No arguments other than a possible exception are given to the completion
callback. 

      rename: (ssh, source, target, callback) ->
        unless ssh
          fs.rename source, target, (err) ->
            callback err
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            sftp.unlink target, -> # Required after version 0.0.18 (sep 2015)
              sftp.rename source, target, (err) ->
                sftp.end()
                callback err

# `ssh2-fs.stat(ssh, path, callback)`

The callback gets two arguments (err, stats) where stats is a fs.Stats object.
See the fs.Stats section below for more information.

      stat: (ssh, path, callback) ->
        # Not yet test, no way to know if file is a direct or a link
        unless ssh
          # { dev: 16777218, mode: 16877, nlink: 19, uid: 501, gid: 20,
          # rdev: 0, blksize: 4096, ino: 1736226, size: 646, blocks: 0,
          # atime: Wed Feb 27 2013 23:25:07 GMT+0100 (CET), mtime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET), ctime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET) }
          fs.stat path, (err, stat) ->
            callback err, stat
        else
          # { size: 646, uid: 501, gid: 20, permissions: 16877, 
          # atime: 1362003965, mtime: 1359498568 }
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.stat path, (err, attr) ->
              sftp.end()
              # see https://github.com/mscdex/ssh2-streams/blob/master/lib/sftp.js#L30
              # ssh2@0.3.x use err.type
              # ssh2@0.4.x use err.code
              if err and (err.type is 'NO_SUCH_FILE' or err.code is 2)
                err.code = 'ENOENT'
                return callback err
              callback err, attr

# `ssh2-fs.symlink(ssh, srcpath, linkPath, callback)`

No arguments other than a possible exception are given to the completion
callback. The type argument can be set to 'dir', 'file', or 'junction'
(default is 'file') and is only available on Windows (ignored on other
platforms). Note that Windows junction points require the target path to
be absolute. When using 'junction', the target argument will automatically
be normalized to absolute path. 

      symlink: (ssh, srcpath, dstpath, callback) ->
        unless ssh
          fs.symlink srcpath, dstpath, (err) ->
            callback err
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.symlink srcpath, dstpath, (err) ->
              sftp.end()
              callback err

# `ssh2-fs.unlink(ssh, path, callback)`

No arguments other than a possible exception are given to the completion
callback.

      unlink: (ssh, path, callback) ->
        unless ssh
          fs.unlink path, (err) ->
            callback err
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          ssh.sftp (err, sftp) ->
            return callback err if err
            sftp.unlink path, (err) ->
              sftp.end()
              callback err

# `ssh2-fs.writeFile(ssh, path, content, [options], callback)`

*   `filename` String   
*   `data` String | Buffer | stream reader   
*   `options` Object   
*   `options.encoding` String | Null default = 'utf8'   
*   `options.mode` Number default = 438 (aka 0666 in Octal)   
*   `options.flag` String default = 'w'   
*   `callback` Function   

Asynchronously writes data to a file, replacing the file if it already exists.
data can be a string or a buffer.

The encoding option is ignored if data is a buffer. It defaults to 'utf8'.

      writeFile: (ssh, source, content, options, callback) ->
        if arguments.length is 4
          callback = options
          options = {}
        else
          options = encoding: options if typeof options is 'string'
        unless ssh
          write = ->
            unless typeof content is 'string' or Buffer.isBuffer content
              content.on 'error', (err) ->
                callback err
                callback = null
            stream = fs.createWriteStream source, options
            if typeof content is 'string' or Buffer.isBuffer content
              stream.write content if content
              stream.end()
            else
              content.pipe stream
            stream.on 'error', (err) ->
              callback err if callback
            stream.on 'end', ->
              s.destroy()
            stream.on 'close', ->
              chown()
          chown = ->
            return chmod() unless options.uid or options.gid
            fs.chown source, options.uid, options.gid, (err) ->
              return callback err if callback err
              chmod()
          chmod = ->
            return finish() unless options.mode
            fs.chmod source, options.mode, (err) ->
              finish err
          finish = (err) ->
            callback err if callback
          write()
        else
          # ssh@0.3.x use "_state"
          # ssh@0.4.x use "_sshstream" and "_sock"
          open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
          return callback Error 'Closed SSH Connection' unless open
          unless typeof content is 'string' or Buffer.isBuffer content
            content.on 'error', (err) ->
              callback err
              callback = null
          ssh.sftp (err, sftp) ->
            if err
              callback err if callback
              callback = null
              return
            write = ->
              ws = sftp.createWriteStream source, options
              if typeof content is 'string' or Buffer.isBuffer content
                ws.write content if content
                ws.end()
              else
                content.pipe ws
              ws.on 'error', (err) ->
                finish err
              ws.on 'end', ->
                ws.destroy()
              ws.on 'close', ->
                chown()
            chown = ->
              return chmod() unless options.uid or options.gid
              sftp.chown source, options.uid, options.gid, (err) ->
                return finish err if err
                chmod()
            chmod = ->
              return finish() unless options.mode
              sftp.chmod source, options.mode, (err) ->
                finish err
            finish = (err) ->
              sftp.end()
              callback err if callback
              callback = null
            write()

[attr]: https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md#attrs
