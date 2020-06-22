
    fs = require 'fs'

    module.exports =

# `ssh2-fs.constants`

Export native Node.js access, open, type and mode file constants for comfort.

      constants: fs.constants

# `ssh2-fs.chmod(ssh, path, mode)`

Asynchronously changes the permissions of a file. No arguments is returned by the function. 

      chmod: (ssh, path, mode) ->
        unless ssh
          fs.promises.chmod path, mode
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.chmod path, mode, (err) ->
                sftp.end()
                unless err then resolve() else reject err

# `ssh2-fs.chown(ssh, path, uid, gid)`

Asynchronously changes owner and group of a file. No arguments is returned by the function. 

      chown: (ssh, path, uid, gid) ->
        throw Error 'Either option "uid" or "gid" is required' unless uid? or gid?
        unless ssh
          fs.promises.chown path, uid, gid
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock": ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.chown path, uid, gid, (err) ->
                sftp.end()
                unless err then resolve() else reject err

# `ssh2-fs.createReadStream(ssh, path, [options])`

Return a promise with a new [ReadStream
object](https://nodejs.org/api/stream.html#stream_class_stream_readable) on
completion.

In the original `fs` API, `createReadStream` is directly return instead of being
available on a promise completion. The reason is due to the nature of
the SSH library where we need to create an SFTP instance asynchronously before
returning the the writable stream.

Example:

```coffee
stream = await fs.createReadStream sshOrNull, 'test.out'
stream.pipe fs.createWriteStream 'test.in'
```

      createReadStream: (ssh, source, options = {}) ->
        unless ssh
          fs.createReadStream source, options
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock": ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              rs = sftp.createReadStream source, options
              rs.emit = ( (emit) ->
                (key, val) ->
                  if key is 'error'
                    if val.code is 4
                      val = new Error "EISDIR: illegal operation on a directory, read"
                      val.errno = -21
                      val.code = 'EISDIR'
                      val.syscall = 'read'
                    else if val.code is 2
                      val = new Error "ENOENT: no such file or directory, open '#{source}'"
                      val.code = 'ENOENT'
                      val.errno = -2
                      val.syscall = 'open'
                      val.path = source
                    else if val.code is 3 # Not tested, hard to reproduce without a sudo environment
                      val = new Error "EACCES: permission denied, open '#{source}'"
                      val.code = 'EACCES'
                      val.errno = -13
                      val.syscall = 'open'
                      val.path = source
                    return emit.call @, 'error', val
                  emit.apply @, arguments
              )(rs.emit)
              rs.on 'close', -> sftp.end()
              resolve rs

# `createWriteStream(ssh, path, [options])`

Return a promise with a new [WriteStream
object](https://nodejs.org/api/stream.html#stream_class_stream_writable) on
completion.

In the original `fs` API, `createWriteStream` is directly return instead of
being available on a promise completion. The reason is due to the internal
nature where we need to create an SFTP instance asynchronously before returning
the the writable stream.

Example:

```coffee
stream = await fs.createWriteStream sshOrNull, 'test.out'
fs.createReadStream('test.in').pipe stream
```

      createWriteStream: (ssh, path, options = {}) ->
        unless ssh
          fs.createWriteStream path, options
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock": ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              ws = sftp.createWriteStream(path, options)
              ws.emit = ( (emit) ->
                (key, val) ->
                  if key is 'error'
                    if val.code is 4
                      val = new Error "EISDIR: illegal operation on a directory, read"
                      val.errno = -21
                      val.code = 'EISDIR'
                      val.syscall = 'read'
                    else if val.code is 2
                      val = new Error "ENOENT: no such file or directory, open '#{path}'"
                      val.code = 'ENOENT'
                      val.errno = -2
                      val.syscall = 'open'
                      val.path = path
                    return emit.call @, 'error', val
                  emit.apply @, arguments
              )(ws.emit)
              ws.on 'close', -> sftp.end()
              resolve ws

# `ssh2-fs.exists(ssh, path)`

Command options are:   

*   `ssh`         SSH connection in case of a remote file path.  
*   `path`        Path to test.   

Returned value is:   
 
*   `exists`      True if the file exists.   

Test whether or not the given path exists by checking with the file system.

      exists: (ssh, path) ->
        unless ssh
          try
            await fs.promises.access path, fs.constants.F_OK
            true
          catch err
            false
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; scsh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.stat path, (err, attr) ->
                sftp.end()
                # ssh2@0.4.x use err.code; ssh2@0.3.x use err.type
                return reject err if err and (err.code isnt 2 and err.type isnt 'NO_SUCH_FILE')
                resolve if err then false else true

# `ssh2-fs.futimes(ssh, path, atime, mtime)`

Sets the access time and modified time for the resource associated with handle. 

      futimes: (ssh, path, atime, mtime) ->
        unless ssh
          fs.promises.utimes path, atime, mtime
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              end = (err) ->
                sftp.end()
                unless err then resolve() else reject err
              return end err if err
              sftp.open path, 'r', (err, fd) ->
                return end err if err
                sftp.futimes fd, atime, mtime, (err) ->
                  return end err if err
                  sftp.close fd, (err) ->
                    end err

# `ssh2-fs.lstat(ssh, path)`

The function returns the fs.Stats object. lstat() is identical to stat(), except
that if path is a symbolic link, then the link itself is stat-ed, not the file
that it refers to.

      lstat: (ssh, path) ->
        unless ssh
          fs.promises.lstat path
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.lstat path, (err, attr) ->
                sftp.end()
                # see https://github.com/mscdex/ssh2-streams/blob/master/lib/sftp.js#L30
                # ssh2@0.4.x use err.code; ssh2@0.3.x use err.type
                if err and (err.type is 'NO_SUCH_FILE' or err.code is 2)
                  err.code = 'ENOENT'
                  return reject err
                resolve attr

# `ssh2-fs.mkdir(ssh, path, [options])`

Asynchronously creates a directory then resolves the Promise with either no
arguments, or the first folder path created if recursive is true. mode defaults to 0777.

In SSH, options is an [ATTR SSH2 object][attr] and may contains such attributes as
'uid', 'gid' and 'mode'. If option is not an object, it is considered to be the
permission mode.

For the sake of compatibility, the local mode also accept additionnal options
than mode. Additionnal supported options are "uid' and "guid". It differs from
the native Node.js API which only accept a permission mode.

TODO: `recursive` is not implemented yet

      mkdir: (ssh, path, options = 0o0777) ->
        if typeof options isnt 'object'
          options = mode: options
        options.mode = parseInt options.mode, 8 if typeof options.mode is 'string'
        unless ssh
          await fs.promises.mkdir path, options.mode
          if options.uid or options.gid
            fs.promises.chown path, options.uid, options.gid
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              mkdir = ->
                sftp.mkdir path, options, (err, attr) ->
                  if err?.message is 'Failure'
                    err = new Error "EEXIST: file already exists, mkdir '#{path}'"
                    err.errno = -17
                    err.code = 'EEXIST'
                    err.path = path
                    err.syscall = 'mkdir'
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
                unless err then resolve() else reject err
              mkdir()

# `ssh2-fs.readdir(path)`

Reads the contents of a directory and return an array of the names of the files
in the directory excluding '.' and '..'.

      readdir: (ssh, path) ->
        unless ssh
          fs.promises.readdir path
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              not_a_dir = (err) ->
                sftp.stat path, (er, attr) ->
                  if not er and not attr.isDirectory()
                    err = Error "ENOTDIR: not a directory, scandir '#{path}'"
                    err.errno = 27
                    err.code = 'ENOTDIR'
                    err.path = path
                  reject err
              sftp.opendir path, (err, handle) ->
                return not_a_dir err if err
                sftp.readdir handle, (err1, files) ->
                  sftp.close handle, (err2) ->
                    return reject err1 or err2 if err1 or err2
                    sftp.end()
                    files = for file in files then file.filename
                    resolve files

# `ssh2-fs.readFile(ssh, path, [options])` 

*   `filename` String   
*   `options` Object   
*   `options.encoding` String | Null default = null   
*   `options.flag` String default = 'r'

Asynchronously reads the entire contents of a file.

      readFile: (ssh, path, options = {}) ->
        options = encoding: options if typeof options is 'string'
        throw Error "Invalid path '#{path}'" unless path
        unless ssh
          fs.promises.readFile path, options.encoding
        else
          new Promise (resolve, reject) ->
            options.autoClose ?= false # Required after version 0.0.18 (sep 2015)
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              s = sftp.createReadStream path, options
              buffers = []
              s.on 'data', (buffer) ->
                buffer = Buffer.from buffer, options.encoding if options.encoding
                buffers.push buffer
              s.on 'error', (err) ->
                if err.code is 4
                  err = new Error "EISDIR: illegal operation on a directory, read"
                  err.errno = -21
                  err.code = 'EISDIR'
                  err.syscall = 'read'
                else if err.code is 2
                  err = new Error "ENOENT: no such file or directory, open '#{path}'"
                  err.code = 'ENOENT'
                  err.errno = -2
                  err.syscall = 'open'
                  err.path = path
                finish err
              s.on 'end', ->
                finish null, Buffer.concat buffers
              finish = (err, data) ->
                sftp.end() unless options.autoClose
                data = data.toString() if not err and options.encoding
                unless err
                then resolve data
                else reject err

# `ssh2-fs.readlink(ssh, path)`

Return the link location.

      readlink: (ssh, path) ->
        unless ssh
          fs.promises.readlink path
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.readlink path, (err, target) ->
                sftp.end()
                unless err
                then resolve target
                else reject err

# `ssh2-fs.rename(sshOrNull, oldPath, newPath)`

No promise arguments is given.

      rename: (ssh, source, target) ->
        unless ssh
          fs.promises.rename source, target
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              sftp.unlink target, -> # Required after version 0.0.18 (sep 2015)
                sftp.rename source, target, (err) ->
                  sftp.end()
                  unless err
                  then resolve target
                  else reject err

# `ssh2-fs.rmdir(sshOrNull, path)`

No promise arguments is given.

      rmdir: (ssh, target) ->
        unless ssh
          fs.promises.rmdir target
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              sftp.rmdir target, (err) ->
                sftp.end()
                if err and (err.type is 'NO_SUCH_FILE' or err.code is 2)
                  err.message = "ENOENT: no such file or directory, rmdir '#{target}'"
                  err.errno = -2
                  err.code = 'ENOENT'
                  err.syscall = 'rmdir'
                  err.path = target
                unless err
                then resolve()
                else reject err

# `ssh2-fs.stat(ssh, path)`

The promise return an fs.Stats object. See the fs.Stats section below for more
information.

      stat: (ssh, path) ->
        # Not yet test, no way to know if file is a direct or a link
        unless ssh
          # { dev: 16777218, mode: 16877, nlink: 19, uid: 501, gid: 20,
          # rdev: 0, blksize: 4096, ino: 1736226, size: 646, blocks: 0,
          # atime: Wed Feb 27 2013 23:25:07 GMT+0100 (CET), mtime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET), ctime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET) }
          fs.promises.stat path
        else
          new Promise (resolve, reject) ->
            # { size: 646, uid: 501, gid: 20, permissions: 16877,
            # atime: 1362003965, mtime: 1359498568 }
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.stat path, (err, attr) ->
                sftp.end()
                # see https://github.com/mscdex/ssh2-streams/blob/master/lib/sftp.js#L30
                # ssh2@0.4.x use err.code; ssh2@0.3.x use err.type
                if err and (err.type is 'NO_SUCH_FILE' or err.code is 2)
                  err.code = 'ENOENT'
                  return reject err
                unless err
                then resolve attr
                else reject err

# `ssh2-fs.symlink(ssh, srcpath, linkPath)`

No promise argument is given. The type argument can be set to 'dir', 'file', or 'junction'
(default is 'file') and is only available on Windows (ignored on other
platforms). Note that Windows junction points require the target path to
be absolute. When using 'junction', the target argument will automatically
be normalized to absolute path. 

      symlink: (ssh, srcpath, dstpath) ->
        unless ssh
          fs.promises.symlink srcpath, dstpath
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.symlink srcpath, dstpath, (err) ->
                sftp.end()
                unless err then resolve() else reject err

# `ssh2-fs.unlink(ssh, path)`

No promise argument is given.

      unlink: (ssh, path) ->
        unless ssh
          fs.unlink path
        else
          new Promise (resolve, reject) ->
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            ssh.sftp (err, sftp) ->
              return reject err if err
              sftp.unlink path, (err) ->
                sftp.end()
                unless err then resolve() else reject err

# `ssh2-fs.writeFile(ssh, target, content, [options])`

* `target` (string)   
  Location of the file where to write.
* `data` String | Buffer | stream reader   
  String or buffer of the content to be written.
* `options.encoding` String | Null default = 'utf8'   
* `options.gid` (integer)   
  Unix group name or id who owns the target file, not in the original Node.js implementation.   
* `options.mode` Integer, 0o0666   
  File mode.
* `options.flag` String, 'w'   
  File system flag, such as 'w' and 'a'.
* `options.uid` (integer)   
  Unix user name or id who owns the target file, not in the original Node.js implementation.   

Asynchronously writes data to a file, replacing the file if it already exists.
data can be a string or a buffer.

The encoding option is ignored if data is a buffer. It defaults to 'utf8'.

      writeFile: (ssh, target, data, options = {}) ->
        options = encoding: options if typeof options is 'string'
        unless ssh
          new Promise (resolve, reject) ->
            error = false
            write = ->
              unless typeof data is 'string' or Buffer.isBuffer data
                data.on 'error', (err) ->
                  reject err
                  error = true
              stream = fs.createWriteStream target, options
              if typeof data is 'string' or Buffer.isBuffer data
                stream.write data if data
                stream.end()
              else
                data.pipe stream
              stream.on 'error', (err) ->
                reject err unless error
              stream.on 'end', ->
                s.destroy()
              stream.on 'close', ->
                chown()
            chown = ->
              return chmod() unless options.uid? or options.gid?
              fs.chown target, options.uid, options.gid, (err) ->
                return reject err if err
                chmod()
            chmod = ->
              return finish() unless options.mode
              fs.chmod target, options.mode, (err) ->
                finish err
            finish = (err) ->
              unless error
                unless err then resolve() else reject err
            write()
        else
          new Promise (resolve, reject) ->
            error = false
            # ssh@0.4.x use "_sshstream" and "_sock"; ssh@0.3.x use "_state"
            open = (ssh._state? and ssh._state isnt 'closed') or (ssh._sshstream?.writable and ssh._sock?.writable)
            return reject Error 'Closed SSH Connection' unless open
            unless typeof data is 'string' or Buffer.isBuffer data
              data.on 'error', (err) ->
                reject err
                error = true
            ssh.sftp (err, sftp) ->
              if err
                reject err unless error
                error = true
                return
              write = ->
                ws = sftp.createWriteStream target, options
                if typeof data is 'string' or Buffer.isBuffer data
                  ws.write data if data
                  ws.end()
                else
                  data.pipe ws
                ws.on 'error', (err) ->
                  finish err
                ws.on 'end', ->
                  ws.destroy()
                ws.on 'close', ->
                  chown()
              chown = ->
                return chmod() unless options.uid? or options.gid?
                sftp.chown target, options.uid, options.gid, (err) ->
                  return finish err if err
                  chmod()
              chmod = ->
                return finish() unless options.mode
                sftp.chmod target, options.mode, (err) ->
                  finish err
              finish = (err) ->
                sftp.end()
                unless error
                  unless err then resolve() else reject err
                error = true
              write()

[attr]: https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md#attrs
