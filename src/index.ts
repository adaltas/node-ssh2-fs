import * as fs from "node:fs";
import {
  Stats,
  ReadStream as ReadStreamNode,
  // ReadStreamOptions,
  WriteStream as WriteStreamNode,
} from "node:fs";
import {
  Client,
  ReadStream as ReadStreamSsh,
  WriteStream as WriteStreamSsh,
} from "ssh2";
import * as stream from "node:stream";
import * as buffer from "node:buffer";
import * as ssh from "ssh2";
import { opened } from "ssh2-connect";

/*
Export native Node.js access, open, type and mode file constants for comfort.
*/
export const constants = fs.constants;

/*
Asynchronously changes the permissions of a file. No arguments is returned by the function.
*/
export const chmod = async function (
  ssh: Client | null,
  path: fs.PathLike,
  mode: number,
) {
  if (!ssh) {
    return fs.promises.chmod(path, mode);
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        if (typeof path !== "string") path = path.toString();
        sftp.chmod(path, mode, (err) => {
          sftp.end();
          !err ? resolve() : reject(err);
        });
      });
    });
  }
};

/*
`ssh2-fs.chown(ssh: Client | null, path, uid, gid)`

Asynchronously changes owner and group of a file. No arguments is returned by the function.
*/
export const chown = async (
  ssh: Client | null,
  path: fs.PathLike,
  uid: number,
  gid: number,
) => {
  if (!uid && !gid) {
    throw Error('Either option "uid" or "gid" is required');
  }
  if (!ssh) {
    return fs.promises.chown(path, uid, gid);
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        if (typeof path !== "string") path = path.toString();
        sftp.chown(path, uid, gid, (err) => {
          sftp.end();
          !err ? resolve() : reject(err);
        });
      });
    });
  }
};

/*
`ssh2-fs.createReadStream(ssh: Client | null, path, [options])`

Return a promise with a new [ReadStream object](https://nodejs.org/api/stream.html#stream_class_stream_readable) on completion.

In the original `fs` API, `createReadStream` is directly return instead of being available on a promise completion. The reason is due to the nature of the SSH library where we need to create an SFTP instance asynchronously before returning the the writable stream.

Example:

```js
stream = await fs.createReadStream(sshOrNull, 'test.out')
stream.pipe(fs.createWriteStream('test.in'))
```
*/

class ReadStreamError extends Error {
  code?: string | number;
  errno?: number;
  syscall?: string;
  path?: string;
  type?: string;
}
export const createReadStream = async (
  ssh: Client | null,
  source: fs.PathLike,
  options: {},
): Promise<ReadStreamNode | ReadStreamSsh> => {
  if (!ssh) {
    return Promise.resolve(fs.createReadStream(source, options));
  } else {
    return new Promise<ReadStreamSsh>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) {
          return reject(err);
        }
        if (typeof source !== "string") source = source.toString();
        const rs = sftp.createReadStream(source, options);
        rs.emit = ((emit) =>
          function (key: string, ...vals: unknown[]): boolean {
            if (key === "error") {
              let val = vals[0] as ReadStreamError;
              if (val.code === 4) {
                val = new Error(
                  "EISDIR: illegal operation on a directory, read",
                );
                val.errno = -21;
                val.code = "EISDIR";
                val.syscall = "read";
              } else if (val.code === 2) {
                val = new Error(
                  `ENOENT: no such file or directory, open '${source}'`,
                );
                val.code = "ENOENT";
                val.errno = -2;
                val.syscall = "open";
                val.path = source.toString();
              } else if (val.code === 3) {
                // Not tested, hard to reproduce without a sudo environment
                val = new Error(`EACCES: permission denied, open '${source}'`);
                val.code = "EACCES";
                val.errno = -13;
                val.syscall = "open";
                val.path = source.toString();
              }
              return emit.call(rs, "error", val);
            }
            return emit.call(rs, key, ...vals);
          })(rs.emit);
        rs.on("close", () => sftp.end());
        resolve(rs);
      });
    });
  }
};

/*
`createWriteStream(ssh: Client | null, path, [options])`

Return a promise with a new [WriteStream
object](https://nodejs.org/api/stream.html#stream_class_stream_writable) on
completion.

In the original `fs` API, `createWriteStream` is directly return instead of
being available on a promise completion. The reason is due to the internal
nature where we need to create an SFTP instance asynchronously before returning
the the writable stream.

Example:

```js
stream = await fs.createWriteStream sshOrNull, 'test.out'
fs.createReadStream('test.in').pipe stream
```
*/
class WriteStreamError extends Error {
  code?: string | number;
  errno?: number;
  syscall?: string;
  path?: string;
}

interface StreamOptions {
  flags?: string | undefined;
  encoding?: BufferEncoding | undefined;
  fd?: number | fs.promises.FileHandle | undefined;
  mode?: number | undefined;
  autoClose?: boolean | undefined;
  emitClose?: boolean | undefined;
  start?: number | undefined;
  signal?: AbortSignal | null | undefined;
  highWaterMark?: number | undefined;
}
interface WriteStreamOptions extends StreamOptions {
  // fs?: CreateWriteStreamFSImplementation | null | undefined;
  flush?: boolean | undefined;
}
interface Ssh2WriteStreamOptions {
  flags?: ssh.OpenMode;
  mode?: number;
  start?: number;
  autoClose?: boolean;
  handle?: Buffer;
  encoding?: BufferEncoding;
}
export const createWriteStream = async (
  ssh: Client | null,
  path: fs.PathLike,
  options:
    | BufferEncoding
    | (typeof ssh extends Client ? WriteStreamOptions
      : Ssh2WriteStreamOptions) = {},
): Promise<WriteStreamNode | WriteStreamSsh> => {
  if (typeof options === "string") options = { encoding: options };
  if (!ssh) {
    return fs.createWriteStream(path, options);
  } else {
    return new Promise<WriteStreamSsh>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        if (typeof path !== "string") path = path.toString();
        const ws = sftp.createWriteStream(path, options);
        ws.emit = ((emit) =>
          function (key, ...vals: unknown[]) {
            let val = vals[0] as WriteStreamError;
            if (key === "error") {
              if (val.code === 4) {
                val = new WriteStreamError(
                  `EISDIR: illegal operation on a directory, open '${path}'`,
                );
                val.errno = -21;
                val.code = "EISDIR";
                val.syscall = "open";
              } else if (val.code === 2) {
                val = new WriteStreamError(
                  `ENOENT: no such file or directory, open '${path}'`,
                );
                val.code = "ENOENT";
                val.errno = -2;
                val.syscall = "open";
                val.path = path.toString();
              }
              return emit.call(ws, "error", val);
            }
            return emit.call(ws, key, val);
          })(ws.emit);
        ws.on("close", () => sftp.end());
        resolve(ws);
      });
    });
  }
};

/*
`ssh2-fs.exists(ssh: Client | null, path)`

Command options are:

- `ssh`         SSH connection in case of a remote file path.
- `path`        Path to test.

Returned value is:

- `exists`      True if the file exists.

Test whether or not the given path exists by checking with the file system.
*/
export const exists = async (
  ssh: Client | null,
  path: fs.PathLike,
): Promise<boolean> => {
  if (!ssh) {
    try {
      await fs.promises.access(path, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        if (typeof path !== "string") path = path.toString();
        sftp.stat(path, (err?: ReadStreamError) => {
          sftp.end();
          // ssh2@0.4.x use err.code; ssh2@0.3.x use err.type
          if (err && err.code !== 2 && err.type !== "NO_SUCH_FILE")
            return reject(err);
          resolve(err ? false : true);
        });
      });
    });
  }
};

/*
`ssh2-fs.futimes(ssh: Client | null, path, atime, mtime)`

Sets the access time and modified time for the resource associated with handle.
*/
export const futimes = (
  ssh: Client | null,
  path: fs.PathLike,
  atime: fs.TimeLike,
  mtime: fs.TimeLike,
) => {
  if (!ssh) {
    return fs.promises.utimes(path, atime, mtime);
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        const end = (err: Error | undefined | null) => {
          sftp.end();
          !err ? resolve() : reject(err);
        };
        if (err) return end;
        if (typeof path !== "string") path = path.toString();
        sftp.open(path, "r", (err, fd) => {
          if (err) return end;
          if (typeof atime === "string") atime = parseInt(atime, 10);
          if (typeof mtime === "string") mtime = parseInt(mtime, 10);
          sftp.futimes(fd, atime, mtime, (err) => {
            if (err) return end;
            sftp.close(fd, (err) => {
              end(err);
            });
          });
        });
      });
    });
  }
};

/*
`ssh2-fs.lstat(ssh: Client | null, path)`

The function returns the fs.Stats object. lstat() is identical to stat(), except
that if path is a symbolic link, then the link itself is stat-ed, not the file
that it refers to.
*/
export const lstat = (
  ssh: Client | null,
  path: fs.PathLike,
): Promise<fs.Stats | ssh.Stats> => {
  if (!ssh) {
    return fs.promises.lstat(path);
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        if (typeof path !== "string") path = path.toString();
        sftp.lstat(
          path,
          (err: ReadStreamError | undefined, attr: ssh.Stats) => {
            sftp.end();
            // see https://github.com/mscdex/ssh2-streams/blob/master/lib/sftp.js#L30
            // ssh2@0.4.x use err.code; ssh2@0.3.x use err.type
            if (err && (err.type == "NO_SUCH_FILE" || err.code === 2)) {
              err.code = "ENOENT";
              return reject(err);
            }
            resolve(attr);
          },
        );
      });
    });
  }
};

/*
`ssh2-fs.mkdir(ssh: Client | null, path, [options])`

Asynchronously creates a directory then resolves the Promise with either no
arguments, or the first folder path created if recursive is true.

In SSH, options is an [ATTR SSH2 object][https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md#attrs] && may contains such attributes as
'uid', 'gid' and 'mode'. If option is not an object, it is considered to be the
permission mode.

For the sake of compatibility, the local mode also accept additionnal options
than mode. Additionnal supported options are "uid' and "guid". It differs from
the native Node.js API which only accept a permission mode.

TODO: `recursive` is not implemented yet
*/
interface MkdirOptions extends fs.MakeDirectoryOptions {
  gid?: number;
  uid?: number;
}
export const mkdir = async (
  ssh: Client | null,
  path: fs.PathLike,
  options: MkdirOptions,
) => {
  if (typeof options !== "object") options = { mode: options };
  if (typeof options.mode === "string")
    options.mode = parseInt(options.mode, 8);
  if (!ssh) {
    return fs.promises.mkdir(path, options.mode).then(() => {
      if (options.uid && options.gid)
        return fs.promises.chown(path, options.uid, options.gid);
    });
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        const mkdir = () => {
          if (typeof path !== "string") path = path.toString();
          sftp.mkdir(
            path,
            options,
            (err: WriteStreamError | null | undefined) => {
              if (err?.message === "Failure") {
                err = new Error(`EEXIST: file already exists, mkdir '${path}'`);
                err.errno = -17;
                err.code = "EEXIST";
                err.path = path.toString();
                err.syscall = "mkdir";
              }
              if (err) return finish(err);
              chown();
            },
          );
        };
        const chown = () => {
          if (!options.uid || !options.gid) return finish();
          // chown should be required but mkdir doesnt seem to honor uid & gid attributes
          if (typeof path !== "string") path = path.toString();
          sftp.chown(path, options.uid, options.gid, (err) => {
            finish(err || undefined);
          });
        };
        const finish = (err?: Error) => {
          sftp.end();
          !err ? resolve() : reject(err);
        };
        mkdir();
      });
    });
  }
};

/*
`ssh2-fs.readdir(path)`

Reads the contents of a directory and return an array of the names of the files
in the directory excluding '.' and '..'.
*/
export const readdir = (ssh: Client | null, path: fs.PathLike) => {
  if (!ssh) {
    return fs.promises.readdir(path);
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        const not_a_dir = (path: string, err: WriteStreamError) => {
          sftp.stat(path, (er, attr) => {
            if (!er && !attr.isDirectory()) {
              err = Error(`ENOTDIR: not a directory, scandir '${path}'`);
              err.errno = 27;
              err.code = "ENOTDIR";
              err.path = path;
            }
            reject(err);
          });
        };
        if (typeof path !== "string") path = path.toString();
        sftp.opendir(path, (err, handle) => {
          if (typeof path !== "string") path = path.toString();
          if (err) return not_a_dir(path, err);
          sftp.readdir(handle, (err1, files) => {
            sftp.close(handle, (err2) => {
              if (err1 || err2) return reject(err1 || err2);
              sftp.end();
              resolve(files.map((file) => file.filename));
            });
          });
        });
      });
    });
  }
};

/*
`ssh2-fs.readFile(ssh: Client | null, path, [options])`

Asynchronously reads the entire contents of a file.

- `filename` String
- `options` Object | String
  A string is intepreted as an encoding.
- `options.encoding` String | Null default = null
- `options.flag` String default = 'r'
*/
export const readFile = async (
  ssh: Client | null,
  path: fs.PathLike,
  options: {
    encoding?: BufferEncoding;
    flag?: fs.OpenMode;
  } = {},
  // | ({
  //     encoding?: null | undefined;
  //     flag?: fs.OpenMode | undefined;
  //   } & events.EventEmitter.Abortable)
  // | null = {},
) => {
  if (typeof options === "string") options = { encoding: options };
  if (!path) throw Error(`Invalid path '${path}'`);
  if (!ssh) {
    return fs.promises.readFile(path, options?.encoding);
  } else {
    return new Promise<Buffer | String>((resolve, reject) => {
      // options.autoClose ??= false; // Required after version 0.0.18 (sep 2015)
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        const buffers: Buffer[] = [];
        if (typeof path !== "string") path = path.toString();
        const s = sftp.createReadStream(path, {
          ...options,
          encoding: undefined,
        });
        const finish = (err: Error | null, data?: Buffer) => {
          // if (!options.autoClose) sftp.end();
          sftp.end();
          // if (!err && options?.encoding) data = data.toString();
          err || data == null ?
            reject(err)
          : resolve(
              options?.encoding ? data.toString(options?.encoding) : data,
            );
        };
        s.on("data", (buffer: Buffer) => {
          // if (options.encoding) buffer = Buffer.from(buffer, options.encoding);
          buffers.push(buffer);
        });
        s.on("error", (err: WriteStreamError) => {
          if (err.code === 4) {
            err = new Error("EISDIR: illegal operation on a directory, read");
            err.errno = -21;
            err.code = "EISDIR";
            err.syscall = "read";
          } else if (err.code === 2) {
            err = new Error(
              `ENOENT: no such file or directory, open '${path}'`,
            );
            err.code = "ENOENT";
            err.errno = -2;
            err.syscall = "open";
            err.path = path.toString();
          }
          finish(err);
        });
        s.on("end", () => finish(null, Buffer.concat(buffers)));
      });
    });
  }
};

/*
`ssh2-fs.readlink(ssh: Client | null, path)`

Return the link location.
*/
export const readlink = async (ssh: Client | null, path: fs.PathLike) => {
  if (!ssh) {
    return fs.promises.readlink(path);
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        if (typeof path !== "string") path = path.toString();
        sftp.readlink(path, (err, target) => {
          sftp.end();
          !err ? resolve(target) : reject(err);
        });
      });
    });
  }
};

/*
`ssh2-fs.rename(sshOrNull, oldPath, newPath)`

No promise arguments is given.
*/
export const rename = async (
  ssh: Client | null,
  source: fs.PathLike,
  target: fs.PathLike,
) => {
  if (typeof target !== "string") target = target.toString();
  if (typeof source !== "string") source = source.toString();
  if (!ssh) {
    return fs.promises.rename(source, target);
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        sftp.unlink(target, () => {
          // Required after version 0.0.18 (sep 2015)
          sftp.rename(source, target, (err) => {
            sftp.end();
            !err ? resolve(target) : reject(err);
          });
        });
      });
    });
  }
};

/*
`ssh2-fs.rmdir(sshOrNull, path)`

No promise arguments is given.
*/
export const rmdir = async (ssh: Client | null, target: fs.PathLike) => {
  if (typeof target !== "string") target = target.toString();
  if (!ssh) {
    return fs.promises.rmdir(target);
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((_, sftp) => {
        sftp.rmdir(target, (err: ReadStreamError | undefined | null) => {
          sftp.end();
          if (err && (err.type === "NO_SUCH_FILE" || err.code === 2)) {
            err.message = `ENOENT: no such file or directory, rmdir '${target}'`;
            err.errno = -2;
            err.code = "ENOENT";
            err.syscall = "rmdir";
            err.path = target;
          }
          !err ? resolve() : reject(err);
        });
      });
    });
  }
};

/*
`ssh2-fs.stat(ssh: Client | null, path)`

The promise return an fs.Stats object. See the fs.Stats section below for more
information.
*/
export const stat = async (ssh: Client | null, path: fs.PathLike) => {
  if (typeof path !== "string") path = path.toString();
  // Not yet test, no way to know if file is a direct or a link
  if (!ssh) {
    // { dev: 16777218, mode: 16877, nlink: 19, uid: 501, gid: 20,
    // rdev: 0, blksize: 4096, ino: 1736226, size: 646, blocks: 0,
    // atime: Wed Feb 27 2013 23:25:07 GMT+0100 (CET), mtime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET), ctime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET) }
    return fs.promises.stat(path);
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        sftp.stat(path, (err: ReadStreamError | undefined, attr) => {
          sftp.end();
          // see https://github.com/mscdex/ssh2-streams/blob/master/lib/sftp.js#L30
          // ssh2@0.4.x use err.code; ssh2@0.3.x use err.type
          if (err && (err.type === "NO_SUCH_FILE" || err.code === 2)) {
            err.code = "ENOENT";
            return reject(err);
          }
          !err ? resolve(attr) : reject(err);
        });
      });
    });
  }
};

/*
`ssh2-fs.symlink(ssh: Client | null, srcpath, linkPath)`

No promise argument is given. The type argument can be set to 'dir', 'file', or 'junction'
(default is 'file') and is only available on Windows (ignored on other
platforms). Note that Windows junction points require the target path to
be absolute. When using 'junction', the target argument will automatically
be normalized to absolute path.
*/
export const symlink = async (
  ssh: Client | null,
  srcpath: fs.PathLike,
  dstpath: fs.PathLike,
) => {
  if (typeof srcpath !== "string") srcpath = srcpath.toString();
  if (typeof dstpath !== "string") dstpath = dstpath.toString();
  if (!ssh) {
    return fs.promises.symlink(srcpath, dstpath);
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        sftp.symlink(srcpath, dstpath, (err) => {
          sftp.end();
          !err ? resolve() : reject(err);
        });
      });
    });
  }
};

/*
`ssh2-fs.unlink(ssh: Client | null, path)`

No promise argument is given.
*/
export const unlink = async (ssh: Client | null, path: fs.PathLike) => {
  if (typeof path !== "string") path = path.toString();
  if (!ssh) {
    return fs.promises.unlink(path);
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        sftp.unlink(path, (err) => {
          sftp.end();
          !err ? resolve() : reject(err);
        });
      });
    });
  }
};

/*
`ssh2-fs.writeFile(ssh: Client | null, target, content, [options])`

Asynchronously writes data to a file, replacing the file if it already exists.
data can be a string or a buffer.

The encoding option is ignored if data is a buffer. It defaults to 'utf8'.

- `target` (string)
  Location of the file where to write.
- `data` String | Buffer | stream reader
  String or buffer of the content to be written.
- `options.encoding` String | Null default = 'utf8'
- `options.gid` (integer)
  Unix group name or id who owns the target file, not in the original Node.js implementation.
- `options.mode` Integer, 0o0666
  File mode.
- `options.flag` String, 'w'
  File system flag, such as 'w' and 'a'.
- `options.uid` (integer)
  Unix user name or id who owns the target file, not in the original Node.js implementation.
*/
export const writeFile = async (
  ssh: Client | null,
  target: fs.PathLike,
  data: stream.Readable | Buffer | string,
  // options: fs.ObjectEncodingOptions & {
  //   mode?: fs.Mode | undefined;
  //   flag?: fs.OpenMode | undefined;
  //   /**
  //    * If all data is successfully written to the file, and `flush`
  //    * is `true`, `filehandle.sync()` is used to flush the data.
  //    * @default false
  //    */
  //   flush?: boolean | undefined;
  //   uid?: number;
  //   gid?: number;
  // } = {},
  options:
    | BufferEncoding
    | ((typeof ssh extends Client ? WriteStreamOptions
      : Ssh2WriteStreamOptions) & {
        uid?: number;
        gid?: number;
      }) = {},
) => {
  if (typeof target !== "string") target = target.toString();
  if (typeof options === "string") options = { encoding: options };
  if (!ssh) {
    return new Promise<void>((resolve, reject) => {
      let error = false;
      const write = () => {
        if (typeof data !== "string" && !Buffer.isBuffer(data))
          data.on("error", (err: Error) => {
            reject(err);
            error = true;
          });
        const stream = fs.createWriteStream(target, options);
        if (typeof data === "string" || Buffer.isBuffer(data)) {
          if (data) stream.write(data);
          stream.end();
        } else {
          data.pipe(stream);
        }
        stream.on("error", (err) => {
          if (!error) reject(err);
        });
        stream.on("end", () => stream.destroy());
        stream.on("close", () => chown());
      };
      const chown = () => {
        if (!options.uid || !options.gid) {
          return chmod();
        }
        fs.chown(target, options.uid, options.gid, (err) => {
          if (err) return reject(err);
          chmod();
        });
      };
      const chmod = () => {
        if (!options.mode) return finish();
        fs.chmod(target, options.mode, (err) => {
          finish(err);
        });
      };
      const finish = (err?: Error | null) => {
        if (!error) !err ? resolve() : reject(err);
      };
      write();
    });
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      let error = false;
      if (typeof data !== "string" && !Buffer.isBuffer(data))
        data.on("error", (err) => {
          reject(err);
          error = true;
        });
      ssh.sftp((err, sftp) => {
        if (err) {
          if (!error) reject(err);
          error = true;
          return;
        }
        const write = () => {
          const ws = sftp.createWriteStream(target, options);
          if (typeof data === "string" || Buffer.isBuffer(data)) {
            if (data) ws.write(data);
            ws.end();
          } else {
            data.pipe(ws);
          }
          ws.on("error", (err: Error) => finish(err));
          ws.on("end", () => ws.destroy());
          ws.on("close", () => chown());
        };
        const chown = () => {
          if (!options.uid || !options.gid) return chmod();
          sftp.chown(target, options.uid, options.gid, (err) => {
            if (err) return finish(err);
            chmod();
          });
        };
        const chmod = () => {
          if (!options.mode) return finish();
          sftp.chmod(target, options.mode, (err) => {
            finish(err);
          });
        };
        const finish = (err?: Error | null) => {
          sftp.end();
          if (!error) !err ? resolve() : reject(err);
          error = true;
        };
        write();
      });
    });
  }
};