import * as ssh2fs from "../dist/esm/index.js";
import { connect, tmpdir, they } from "./test.js";

const __filename = new URL(import.meta.url).pathname;

describe("exists", function () {
  beforeEach(tmpdir);

  they(
    "on file",
    connect(async ({ ssh }) => {
      const exists = await ssh2fs.exists(ssh, __filename);
      exists.should.be.true();
    }),
  );

  they(
    "does not exist",
    connect(async ({ ssh }) => {
      const exists = await ssh2fs.exists(ssh, `${__filename}/nothere`);
      exists.should.not.be.true();
    }),
  );
});
