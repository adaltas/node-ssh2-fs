import * as ssh2fs from "../src/index.js";
import { tmpdir, scratch, they } from "./test.js";

describe("rename", function () {
  beforeEach(tmpdir);

  they("a file", async ({ ssh }) => {
    await ssh2fs.writeFile(ssh, `${scratch}/src_file`, "helloworld", {
      flags: "a",
    });
    await ssh2fs.rename(ssh, `${scratch}/src_file`, `${scratch}/dest_file`);
    await ssh2fs
      .readFile(ssh, `${scratch}/dest_file`, "utf8")
      .then((content) => content.should.eql("helloworld"));
  });

  they("over an existing file", async ({ ssh }) => {
    await ssh2fs.writeFile(ssh, `${scratch}/dest_file`, "overwrite", {
      flags: "a",
    });
    await ssh2fs.writeFile(ssh, `${scratch}/src_file`, "helloworld", {
      flags: "a",
    });
    await ssh2fs.rename(ssh, `${scratch}/src_file`, `${scratch}/dest_file`);
    await ssh2fs
      .readFile(ssh, `${scratch}/dest_file`, "utf8")
      .then((content) => content.should.eql("helloworld"));
  });
});
