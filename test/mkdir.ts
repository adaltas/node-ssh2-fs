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

  they("write in parallel", async ({ ssh }) => {
    // Fix issue where mkdir did not closed the connection and generated
    // "Error: (SSH) Channel open failure: open failed".
    const files = Array(4)
      .fill("")
      .map((value, i) =>
        ssh2fs.writeFile(
          ssh,
          `${scratch}/mkdir_parallel_file_${i}`,
          [...Array(1000)]
            .map(() => Math.floor(Math.random() * 36).toString(36))
            .join(""),
        ),
      );
    const mkdirs = Array(4)
      .fill("")
      .map((value, i) =>
        ssh2fs.mkdir(ssh, `${scratch}/mkdir_parallel_dir_${i}`, 0o0714),
      );
    await Promise.allSettled([...files, ...mkdirs]).then(() =>
      Promise.all([
        ...files.map((val, i) =>
          ssh2fs.unlink(ssh, `${scratch}/mkdir_parallel_file_${i}`),
        ),
        ...mkdirs.map((val, i) =>
          ssh2fs.rmdir(ssh, `${scratch}/mkdir_parallel_dir_${i}`),
        ),
      ]),
    );
  });
});
