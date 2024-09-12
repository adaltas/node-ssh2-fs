import fs from "node:fs";
import * as ssh2fs from "../dist/esm/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

const __dirname = new URL(".", import.meta.url).pathname;

describe("createWriteStream", function () {
  beforeEach(tmpdir);

  describe("error", function () {
    they(
      "ENOENT if parent dir does not exists",
      connect(async ({ ssh }) => {
        await new Promise((resolve, reject) => {
          ssh2fs
            .createWriteStream(ssh, `${scratch}/not/here`, "")
            .then((stream) => {
              stream.on("error", reject);
            });
        }).should.be.rejectedWith({
          message: `ENOENT: no such file or directory, open '${scratch}/not/here'`,
          code: "ENOENT",
          errno: -2,
          syscall: "open",
          path: `${scratch}/not/here`,
        });
      }),
    );

    they(
      "EISDIR if file is a directory",
      connect(async ({ ssh }) => {
        await new Promise((resolve, reject) => {
          ssh2fs.createWriteStream(ssh, __dirname).then((stream) => {
            stream.on("error", reject);
          });
        }).should.be.rejectedWith({
          code: "EISDIR",
          message: `EISDIR: illegal operation on a directory, open '${__dirname}'`,
          errno: -21,
          syscall: "open",
        });
      }),
    );
  });

  they(
    "pipe into stream reader",
    connect(async ({ ssh }) => {
      await fs.promises.writeFile(`${scratch}/source`, "a text");
      await new Promise((resolve, reject) => {
        ssh2fs.createWriteStream(ssh, `${scratch}/target`).then((ws) =>
          fs
            .createReadStream(`${scratch}/source`)
            .pipe(ws)
            .on("error", reject)
            .on("end", () => ws.destroy())
            .on("close", async () => {
              ssh2fs
                .readFile(ssh, `${scratch}/target`, "ascii")
                .should.finally.eql("a text")
                .then(resolve)
                .catch(reject);
            }),
        );
      });
    }),
  );

  they(
    "option `flags`",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "hello");
      await new Promise((resolve, reject) => {
        ssh2fs
          .createWriteStream(ssh, `${scratch}/a_file`, {
            flags: "a",
          })
          .then((ws) => {
            ws.write("world");
            ws.end();
            ws.on("close", async () => {
              await ssh2fs
                .readFile(ssh, `${scratch}/a_file`, "utf8")
                .should.resolvedWith("helloworld")
                .then(resolve)
                .catch(reject);
            });
          });
      });
    }),
  );

  they(
    "option `mode`",
    connect(async ({ ssh }) => {
      await new Promise((resolve) => {
        ssh2fs
          .createWriteStream(ssh, `${scratch}/a_file`, {
            mode: 0o0611,
          })
          .then((ws) => {
            ws.write("world");
            ws.end();
            ws.on("close", async () => {
              ssh2fs.stat(ssh, `${scratch}/a_file`).then(({ mode }) => {
                mode.toString(8).substr(-3).should.eql("611");
                resolve();
              });
            });
          });
      });
    }),
  );
});
