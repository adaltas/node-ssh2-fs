import * as ssh2fs from "../lib/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

beforeEach(tmpdir);

describe("lstat", () => {
  they(
    "work",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "helloworld", {
        flags: "a",
      });
      await ssh2fs.symlink(ssh, `${scratch}/a_file`, `${scratch}/a_link`);
      await ssh2fs
        .lstat(ssh, `${scratch}/a_link`)
        .then((lstat) => lstat.isSymbolicLink().should.be.true());
    }),
  );

  they(
    "return error code is not exists",
    connect(({ ssh }) => {
      return ssh2fs
        .lstat(ssh, `${scratch}/a_missing_link`)
        .should.be.rejectedWith({
          code: "ENOENT",
        });
    }),
  );
});
