import * as ssh2fs from "../lib/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

beforeEach(tmpdir);

describe("futimes", () => {
  they(
    "change permission",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "hello");
      const stat1 = await ssh2fs.stat(ssh, `${scratch}/a_file`);
      await ssh2fs.futimes(ssh, `${scratch}/a_file`, Date.now(), Date.now());
      const stat2 = await ssh2fs.stat(ssh, `${scratch}/a_file`);
      stat1.atime.should.not.equal(stat2.atime);
      stat1.mtime.should.not.equal(stat2.mtime);
    }),
  );
});
