import * as ssh2fs from "../lib/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

describe("readFile", function () {
  beforeEach(tmpdir);

  they(
    "return a buffer unless encoding is present",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "hello", { flags: "w" });
      await ssh2fs
        .readFile(ssh, `${scratch}/a_file`)
        .then((content) => Buffer.isBuffer(content).should.be.true());
    }),
  );

  they(
    "return a string if encoding is present",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "hello", { flags: "w" });
      await ssh2fs
        .readFile(ssh, `${scratch}/a_file`, "utf8")
        .then((content) => content.should.eql("hello"));
    }),
  );

  they(
    "error with missing file",
    connect(({ ssh }) => {
      return ssh2fs
        .readFile(ssh, `${scratch}/doesnotexist`, "utf8")
        .should.be.rejectedWith({
          message: `ENOENT: no such file or directory, open '${scratch}/doesnotexist'`,
          code: "ENOENT",
          errno: -2,
          syscall: "open",
          path: `${scratch}/doesnotexist`,
        });
    }),
  );

  they(
    "error with directory",
    connect(({ ssh }) => {
      return ssh2fs.readFile(ssh, `${scratch}`).should.be.rejectedWith({
        message: "EISDIR: illegal operation on a directory, read",
        code: "EISDIR",
        errno: -21,
        syscall: "read",
      });
    }),
  );
});
