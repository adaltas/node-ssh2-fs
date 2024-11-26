import * as fs from "node:fs";
import * as stream from "node:stream";
import * as ssh2 from "ssh2";
import { opened } from "ssh2-connect";

/**
 * Export native Node.js access, open, type and mode file constants for comfort.
 */
export const constants = fs.constants;

/**
 * Asynchronously changes the permissions of a file.
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the file.
 * @param mode - File mode to set.
 * @returns Promise that resolves when the operation is complete.
 */
export async function chmod(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
  mode: number,
): Promise<void> {
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
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}

/**
 * Asynchronously changes owner and group of a file.
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the file.
 * @param uid - User ID to set.
 * @param gid - Group ID to set.
 * @returns Promise that resolves when the operation is complete.
 * @throws Error if neither uid nor gid is provided.
 */
export async function chown(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
  uid: number,
  gid: number,
): Promise<void> {
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
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}

/**
 * Rejected error by `createReadStream`.
 */
class ReadStreamError extends Error {
  code?: string | number;
  errno?: number;
  syscall?: string;
  path?: string;
  type?: string;
}

/**
 * Non exposed options type from `fs.createReadStream`.
 */
export type FsReadStreamOptions = Parameters<typeof fs.createReadStream>[1];

/**
 * Creates a readable stream for a file.
 * @param ssh - SSH client or null for local operation.
 * @param source - Path to the source file.
 * @param options - Options for creating the read stream.
 * @returns Promise that resolves with a ReadStream.
 *
 * @example
 *
 * ```typescript
 * stream = await fs.createReadStream(sshOrNull, 'hello')
 * stream.pipe(fs.createWriteStream('test.in'))
 * ```
 */
export async function createReadStream<T extends ssh2.Client | null>(
  ssh: T,
  source: fs.PathLike,
  options: T extends null ? FsReadStreamOptions : ssh2.ReadStreamOptions = {},
): Promise<T extends null ? fs.ReadStream : ssh2.ReadStream> {
  if (!ssh) {
    return Promise.resolve(fs.createReadStream(source, options)) as Promise<
      T extends null ? fs.ReadStream : ssh2.ReadStream
    >;
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) {
          return reject(err);
        }
        if (typeof source !== "string") source = source.toString();
        const rs = sftp.createReadStream(
          source,
          options as ssh2.ReadStreamOptions,
        );
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
        resolve(rs as T extends null ? fs.ReadStream : ssh2.ReadStream);
      });
    });
  }
}

/**
 * Rejected error by `createReadStream`.
 */
export class WriteStreamError extends Error {
  code?: string | number;
  errno?: number;
  syscall?: string;
  path?: string;
}

/**
 * Non exposed options type from `fs.createReadStream`.
 */
export type FsWriteStreamOptions = Parameters<typeof fs.createWriteStream>[1];

/**
 * Creates a writable stream for a file.
 *
 * In the original `fs` API, `createWriteStream` is directly return instead of being available on a promise completion. The reason is due to the internal nature where we need to create an SFTP instance asynchronously before returning the the writable stream..
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the destination file.
 * @param options - Options for creating the write stream.
 * @returns Promise that resolves with a WriteStream.
 *
 * @example
 *
 * ```javascript
 * stream = await fs.createWriteStream sshOrNull, 'test.out'
 * fs.createReadStream('test.in').pipe stream
 * ````
 */
export async function createWriteStream<T extends null | ssh2.Client>(
  ssh: T,
  path: fs.PathLike,
  options: T extends null ? FsWriteStreamOptions : ssh2.WriteStreamOptions = {},
): Promise<T extends null ? fs.WriteStream : ssh2.WriteStream> {
  if (typeof options === "string") options = { encoding: options };
  if (!ssh) {
    return Promise.resolve(fs.createWriteStream(path, options)) as Promise<
      T extends null ? fs.WriteStream : ssh2.WriteStream
    >;
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        if (typeof path !== "string") path = path.toString();
        const ws = sftp.createWriteStream(
          path,
          options as ssh2.WriteStreamOptions,
        );
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
        resolve(ws as T extends null ? fs.WriteStream : ssh2.WriteStream);
      });
    });
  }
}

/**
 * Tests whether a file or directory exists.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to test.
 * @returns Promise that resolves with a boolean indicating existence.
 */
export async function exists(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
): Promise<boolean> {
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
}

/**
 * Sets the access and modification times of a file.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the file.
 * @param atime - Access time to set.
 * @param mtime - Modification time to set.
 * @returns Promise that resolves when the operation is complete.
 */
export async function futimes(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
  atime: fs.TimeLike,
  mtime: fs.TimeLike,
): Promise<void> {
  if (!ssh) {
    return fs.promises.utimes(path, atime, mtime);
  } else {
    return new Promise<void>((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        const end = (err: Error | undefined | null) => {
          sftp.end();
          if (err) {
            reject(err);
          } else {
            resolve();
          }
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
}

/**
 * Retrieves the fs.Stats object for a symbolic link.
 *
 * The function returns the fs.Stats object. lstat() is identical to stat(), except that if path is a symbolic link, then the link itself is stat-ed, not the file that it refers to.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the symbolic link.
 * @returns Promise that resolves with the fs.Stats or ssh2.Stats object.
 */
export async function lstat(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
): Promise<fs.Stats | ssh2.Stats> {
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
          (err: ReadStreamError | undefined, attr: ssh2.Stats) => {
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
}

/**
 * Options for `mkdir`.
 *
 * Options extend the Node.js native options with the additional `gid` and `uid` options.
 */
export type FsMkdirOptions = fs.MakeDirectoryOptions & {
  recursive: true;
} & {
  gid?: number;
  uid?: number;
};

/**
 * Creates a directory.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path of the directory to create.
 * @param options - Options for directory creation.
 * @returns Promise that resolves when the operation is complete.
 */
export async function mkdir(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
  options?: fs.Mode | FsMkdirOptions | ssh2.InputAttributes,
): Promise<void> {
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
        if (typeof path !== "string") path = path.toString();
        Promise.resolve(path)
          .then(
            (path) =>
              new Promise<string>((resolve, reject) =>
                sftp.mkdir(
                  path,
                  options,
                  (err: WriteStreamError | null | undefined) => {
                    if (err?.message === "Failure") {
                      err = new Error(
                        `EEXIST: file already exists, mkdir '${path}'`,
                      );
                      err.errno = -17;
                      err.code = "EEXIST";
                      err.path = path.toString();
                      err.syscall = "mkdir";
                    }
                    if (err) return reject(err);
                    resolve(path);
                  },
                ),
              ),
          )
          .then(
            (path) =>
              new Promise<void>((resolve, reject) => {
                if (!options.uid || !options.gid) return resolve();
                // chown should be required but mkdir doesnt seem to honor uid & gid attributes
                sftp.chown(path, options.uid, options.gid, (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }),
          )
          .then(resolve)
          .catch(reject)
          .finally(() => sftp.end());
      });
    });
  }
}

/**
 * Reads the contents of a directory.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the directory.
 * @returns Promise that resolves with an array of file names in the directory.
 */
export async function readdir(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
): Promise<string[]> {
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
}

/**
 * Non exposed options type from `fs.promises.readFile`.
 */
export type FsReadFileOptions = Parameters<typeof fs.promises.readFile>[1];

/**
 * Reads the entire contents of a file.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the file.
 * @param options - Options for reading the file.
 * @params options.encoding - Encoding used to convert a buffer into a string.
 * @params options.flag - File system flag, default is `r`.
 * @returns Promise that resolves with the file contents as a string or Buffer.
 */
export async function readFile<T extends ssh2.Client | null>(
  ssh: T,
  path: fs.PathLike,
  options: T extends null ? FsReadFileOptions
  : BufferEncoding | ssh2.ReadFileOptions = {},
): Promise<string | Buffer> {
  if (typeof options === "string") options = { encoding: options };
  if (!path) throw Error(`Invalid path '${path}'`);
  if (!ssh) {
    return fs.promises.readFile(path, options);
  } else {
    return new Promise<Buffer | string>((resolve, reject) => {
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
          if (err || data == null) {
            reject(err);
          } else {
            resolve(
              options?.encoding ? data.toString(options?.encoding) : data,
            );
          }
        };
        s.on("data", (buffer: Buffer) => {
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
        s.on("end", () =>
          finish(
            null,
            Buffer.concat(
              buffers.map(
                (buf) => new Uint8Array(buf.buffer, buf.byteOffset, buf.length),
              ),
            ),
          ),
        );
      });
    });
  }
}

/**
 * Reads the value of a symbolic link.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the symbolic link.
 * @returns Promise that resolves with the link's string value.
 */
export async function readlink(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
): Promise<string> {
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
          if (err) {
            reject(err);
          } else {
            resolve(target);
          }
        });
      });
    });
  }
}

/**
 * Renames a file or directory.
 *
 * @param ssh - SSH client or null for local operation.
 * @param source - Current path of the file or directory.
 * @param target - New path for the file or directory.
 * @returns Promise that resolves when the operation is complete.
 */
export async function rename(
  ssh: ssh2.Client | null,
  source: fs.PathLike,
  target: fs.PathLike,
): Promise<void> {
  if (typeof target !== "string") target = target.toString();
  if (typeof source !== "string") source = source.toString();
  if (!ssh) {
    return fs.promises.rename(source, target);
  } else {
    return new Promise((resolve, reject) => {
      if (!opened(ssh)) return reject(Error("Closed SSH Connection"));
      ssh.sftp((err, sftp) => {
        if (err) return reject(err);
        sftp.unlink(target, () => {
          // Required after version 0.0.18 (sep 2015)
          sftp.rename(source, target, (err) => {
            sftp.end();
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });
    });
  }
}

/**
 * Removes a directory.
 *
 * @param ssh - SSH client or null for local operation.
 * @param target - Path of the directory to remove.
 * @returns Promise that resolves when the operation is complete.
 */
export async function rmdir(
  ssh: ssh2.Client | null,
  target: fs.PathLike,
): Promise<void> {
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
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}

/**
 * Retrieves the Stats object for a file or directory.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path to the file or directory.
 * @returns Promise that resolves with the fs.Stats or ssh2.Stats object.
 */
export async function stat<T extends null | ssh2.Client>(
  ssh: T,
  path: fs.PathLike,
): Promise<T extends null ? fs.Stats : ssh2.Stats> {
  if (typeof path !== "string") path = path.toString();
  // Not yet test, no way to know if file is a direct or a link
  if (!ssh) {
    // { dev: 16777218, mode: 16877, nlink: 19, uid: 501, gid: 20,
    // rdev: 0, blksize: 4096, ino: 1736226, size: 646, blocks: 0,
    // atime: Wed Feb 27 2013 23:25:07 GMT+0100 (CET), mtime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET), ctime: Tue Jan 29 2013 23:29:28 GMT+0100 (CET) }
    // const stats: fs.Stats = await fs.promises.stat(path);
    return fs.promises.stat(path) as Promise<
      T extends null ? fs.Stats : ssh2.Stats
    >;
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
          if (err) {
            reject(err);
          } else {
            resolve(attr as T extends null ? fs.Stats : ssh2.Stats);
          }
        });
      });
    });
  }
}

/**
 * Creates a symbolic link.
 *
 * @param ssh - SSH client or null for local operation.
 * @param srcpath - Path that the symlink should point to.
 * @param dstpath - Path where the symbolic link should be created.
 * @returns Promise that resolves when the operation is complete.
 */
export async function symlink(
  ssh: ssh2.Client | null,
  srcpath: fs.PathLike,
  dstpath: fs.PathLike,
): Promise<void> {
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
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}

/**
 * Removes a file.
 *
 * @param ssh - SSH client or null for local operation.
 * @param path - Path of the file to remove.
 * @returns Promise that resolves when the operation is complete.
 */
export async function unlink(
  ssh: ssh2.Client | null,
  path: fs.PathLike,
): Promise<void> {
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
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}

/**
 * Extends the WriteFileOptions with `uid` and `gid` options.
 */
export type WriteFileOptions<T> = (T extends null ? FsWriteStreamOptions
: ssh2.WriteStreamOptions) & {
  uid?: number;
  gid?: number;
};

/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 *
 * @param ssh - SSH client or null for local operation.
 * @param target - Path of the file to write.
 * @param data - The data to write to the file.
 * @param options - Options for writing the file.
 * @param options - Buffer encoding, default to `utf8`.
 * @param options.gid - Unix group name or id who owns the target file, not in the original Node.js implementation..
 * @param options.flag - File system flag.
 * @param options.uid - Unix user name or id who owns the target file, not in the original Node.js implementation.
 * @returns Promise that resolves when the operation is complete.
 */
export async function writeFile<T extends null | ssh2.Client>(
  ssh: T,
  target: fs.PathLike,
  data: stream.Readable | Buffer | string,
  options: WriteFileOptions<T> = {},
) {
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
        if (!error) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
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
          const ws = sftp.createWriteStream(
            target,
            options as ssh2.WriteStreamOptions,
          );
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
          if (!error) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
          error = true;
        };
        write();
      });
    });
  }
}

export default {
  constants,
  chmod,
  chown,
  createReadStream,
  WriteStreamError,
  createWriteStream,
  exists,
  futimes,
  lstat,
  mkdir,
  readdir,
  readFile,
  readlink,
  rename,
  rmdir,
  stat,
  symlink,
  unlink,
  writeFile,
};
