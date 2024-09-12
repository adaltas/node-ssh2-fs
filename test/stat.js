import * as ssh2fs from "../dist/esm/index.js";
import { connect, tmpdir, they } from "./test.js";

const __filename = new URL(import.meta.url).pathname;
const __dirname = new URL(".", import.meta.url).pathname;

describe("stat", function () {
  beforeEach(tmpdir);

  they(
    "on file",
    connect(async ({ ssh }) => {
      const stat = await ssh2fs.stat(ssh, __filename);
      stat.isFile().should.be.true();
    }),
  );

  they(
    "on directory",
    connect(async ({ ssh }) => {
      const stat = await ssh2fs.stat(ssh, __dirname);
      stat.isDirectory().should.be.true();
    }),
  );

  they(
    "check does not exist",
    connect(({ ssh }) => {
      ssh2fs.stat(ssh, "#{__dirname}/noone").should.be.rejectedWith({
        code: "ENOENT",
      });
    }),
  );
});
