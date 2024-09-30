import * as ssh2fs from "../src/index.js";
import { tmpdir, scratch, they } from "./test.js";

describe("lstat", function () {
  beforeEach(tmpdir);

  they("work", async ({ ssh }) => {
    await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "helloworld", {
      flags: "a",
    });
    await ssh2fs.symlink(ssh, `${scratch}/a_file`, `${scratch}/a_link`);
    await ssh2fs
      .lstat(ssh, `${scratch}/a_link`)
      .then((lstat) => lstat.isSymbolicLink().should.be.true());
  });

  they("return error code is not exists", ({ ssh }) => {
    return ssh2fs
      .lstat(ssh, `${scratch}/a_missing_link`)
      .should.be.rejectedWith({
        code: "ENOENT",
      });
  });
});
