import * as path from "node:path";
import * as ssh2fs from "../src/index.js";
import { tmpdir, scratch, they } from "./test.js";

const __filename = new URL(import.meta.url).pathname;
const __dirname = new URL(".", import.meta.url).pathname;

describe("readdir", function () {
  beforeEach(tmpdir);

  they("list", async ({ ssh }) => {
    const files = await ssh2fs.readdir(ssh, __dirname);
    files.length.should.be.above(5);
    files.indexOf(path.basename(__filename)).should.not.equal(-1);
  });

  they("list empty dir", async ({ ssh }) => {
    await ssh2fs.mkdir(ssh, `${scratch}/empty`);
    const files = await ssh2fs.readdir(ssh, `${scratch}/empty`);
    files.length.should.equal(0);
  });

  they("error on file", async ({ ssh }) => {
    await ssh2fs.readdir(ssh, __filename).should.be.rejectedWith({
      code: "ENOTDIR",
      message: `ENOTDIR: not a directory, scandir '${__filename}'`,
      path: __filename,
    });
  });
});
