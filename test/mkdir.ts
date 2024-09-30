import * as ssh2fs from "../src/index.js";
import { tmpdir, scratch, they } from "./test.js";

describe("mkdir", function () {
  beforeEach(tmpdir);

  they("create a new directory", async ({ ssh }) => {
    await ssh2fs.mkdir(ssh, `${scratch}/new_dir`);
  });

  they("pass error if dir exists", async ({ ssh }) => {
    await ssh2fs.mkdir(ssh, `${scratch}/new_dir`);
    ssh2fs.mkdir(ssh, `${scratch}/new_dir`).should.be.rejectedWith({
      message: `EEXIST: file already exists, mkdir '${scratch}/new_dir'`,
      path: `${scratch}/new_dir`,
      errno: -17,
      code: "EEXIST",
      syscall: "mkdir",
    });
  });

  they("set mode", async ({ ssh }) => {
    await ssh2fs.mkdir(ssh, `${scratch}/mode_dir`, 0o0714);
    const stat = await ssh2fs.stat(ssh, `${scratch}/mode_dir`);
    stat.mode.toString(8).should.eql("40714");
  });
});
