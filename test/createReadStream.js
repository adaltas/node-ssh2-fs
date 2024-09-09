import fs from "node:fs";
import * as ssh2fs from "../lib/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

const __dirname = new URL(".", import.meta.url).pathname;

beforeEach(tmpdir);

describe("createReadStream", () => {
  describe("error", () => {
    they(
      "ENOENT if file does not exists",
      connect(async ({ ssh }) => {
        await new Promise((resolve, reject) => {
          ssh2fs.createReadStream(ssh, `${scratch}/not_here`).then((stream) => {
            stream.on("error", reject);
            stream.read();
          });
        }).should.be.rejectedWith({
          message: `ENOENT: no such file or directory, open '${scratch}/not_here'`,
          code: "ENOENT",
          errno: -2,
          syscall: "open",
          path: `${scratch}/not_here`,
        });
      }),
    );

    they(
      "EISDIR if file is a directory",
      connect(async ({ ssh }) => {
        await new Promise((resolve, reject) => {
          ssh2fs.createReadStream(ssh, __dirname).then((stream) => {
            stream.on("error", reject);
            stream.read();
          });
        }).should.be.rejectedWith({
          code: "EISDIR",
          message: "EISDIR: illegal operation on a directory, read",
          errno: -21,
          syscall: "read",
        });
      }),
    );
  });

  describe("usage", () => {
    they(
      "pipe to stream writer",
      connect(async ({ ssh }) => {
        await ssh2fs.writeFile(ssh, `${scratch}/source`, "a text");
        await new Promise(async (resolve, reject) => {
          const ws = fs
            .createWriteStream(`${scratch}/target`)
            .on("error", reject)
            .on("end", () => ws.destroy())
            .on("close", () =>
              fs.readFile(`${scratch}/target`, "ascii", (err, content) => {
                if (!err) {
                  content.should.eql("a text");
                  resolve();
                } else {
                  reject(err);
                }
              }),
            );
          ssh2fs
            .createReadStream(ssh, `${scratch}/source`)
            .then((rs) => rs.pipe(ws));
        });
      }),
    );
  });
});
