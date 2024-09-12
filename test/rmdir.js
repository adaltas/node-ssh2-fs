import * as ssh2fs from "../dist/esm/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

describe("rmdir", function () {
  beforeEach(tmpdir);

  they(
    "a dir",
    connect(async ({ ssh }) => {
      await ssh2fs.mkdir(ssh, `${scratch}/a_dir`);
      await ssh2fs.rmdir(ssh, `${scratch}/a_dir`);
    }),
  );

  they(
    "a missing file",
    connect(({ ssh }) => {
      return ssh2fs.rmdir(ssh, `${scratch}/a_dir`).should.be.rejectedWith({
        message:
          "ENOENT: no such file or directory, rmdir '/tmp/ssh2-fs-test/a_dir'",
        errno: -2,
        code: "ENOENT",
        syscall: "rmdir",
        path: "/tmp/ssh2-fs-test/a_dir",
      });
    }),
  );
});
