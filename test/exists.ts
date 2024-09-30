import * as ssh2fs from "../src/index.js";
import { tmpdir, they } from "./test.js";

const __filename = new URL(import.meta.url).pathname;

describe("exists", function () {
  beforeEach(tmpdir);

  they("on file", async ({ ssh }) => {
    const exists = await ssh2fs.exists(ssh, __filename);
    exists.should.be.true();
  });

  they("does not exist", async ({ ssh }) => {
    const exists = await ssh2fs.exists(ssh, `${__filename}/nothere`);
    exists.should.not.be.true();
  });
});
