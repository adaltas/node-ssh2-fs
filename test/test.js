import exec from "ssh2-exec";
import ssh2They from "mocha-they";
import { connect as ssh2Connect } from "ssh2-connect";

export const scratch = "/tmp/ssh2-fs-test";

export const tmpdir = async () => {
  const ssh = null;
  return new Promise((resolve, reject) => {
    exec(ssh, `rm -rf ${scratch}`, (err) => {
      if (err) return reject(err);
      exec(ssh, `mkdir -p ${scratch}`, (err) => {
        !err ? resolve() : reject(err);
      });
    });
  });
};

// Configure and return they
export const they = ssh2They([
  {
    label: "local",
  },
  {
    label: "remote",
    ssh: { host: "127.0.0.1", username: process.env.USER },
  },
]);

export const connect =
  (handler) =>
  (...args) =>
    new Promise(async (resolve, reject) => {
      let conn = null;
      try {
        const ssh = args[0].ssh;
        if (ssh) conn = await ssh2Connect(ssh);
        if (conn) args[0].ssh = conn;
        await handler.call(this, ...args);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        conn && conn.end();
      }
    });
